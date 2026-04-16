/**
 * functions/index.js — YumYum Cloud Functions (최종본)
 *
 * Claude API → Gemini Flash 교체 + RAG(소아과 가이드라인) + Few-Shot + LLM-as-a-Judge
 *
 * 파일 구조:
 *   functions/
 *     index.js   ← 이 파일
 *     rag.js     ← RAG 조회/컨텍스트 빌드 모듈
 */

const { onRequest } = require("firebase-functions/v2/https");
// Vertex AI 사용 → API 키 불필요 (서비스 계정 자동 인증)
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const { retrieveKnowledge, buildPromptContext, buildJudgeRules } = require("./rag");

admin.initializeApp();
const db = admin.firestore();

// ─── 상수 ───────────────────────────────────────────────────────────────────
const DAILY_LIMIT = 5;
const GEMINI_MODEL = "gemini-2.0-flash-001";
const PROJECT_ID = "yum-yum-e7940";
const LOCATION = "us-central1";
const VERTEX_ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${GEMINI_MODEL}:generateContent`;

// ─── Access Token 캐싱 ──────────────────────────────────────────────────────
let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const res = await fetch(
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
    { headers: { "Metadata-Flavor": "Google" } }
  );
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // 만료 1분 전 갱신
  return cachedToken;
}

// ─── Few-Shot 예시 ───────────────────────────────────────────────────────────
// 포맷 학습 목적 — JSON 파싱 오류와 재시도 비용을 줄임
const FEW_SHOT_SINGLE = `
[출력 형식 예시 - 이 형식을 반드시 따르세요]
{
  "recipeTitle": "소고기당근죽",
  "ingredients": [
    {"name": "쌀", "amount": "30", "unit": "g"},
    {"name": "소고기", "amount": "20", "unit": "g"},
    {"name": "당근", "amount": "15", "unit": "g"}
  ],
  "steps": [
    "쌀을 30분 불린 후 7배 물과 함께 냄비에 넣는다",
    "소고기는 핏물 제거 후 삶아 2~3mm로 잘게 다진다",
    "당근을 삶아 2~3mm 크기로 으깬다",
    "죽이 끓으면 소고기와 당근을 넣고 5분 더 끓인다"
  ],
  "reason": "철분 풍부한 소고기에 비타민C가 함유된 당근을 조합해 철분 흡수율을 높인 중기 이유식입니다"
}`;

const FEW_SHOT_SCHEDULE = `
[출력 형식 예시 - 이 형식을 반드시 따르세요]
[
  {
    "date": "2026-04-10",
    "day": "금",
    "meals": [
      {
        "slot": "아침",
        "recipeTitle": "닭고기브로콜리진밥",
        "ingredients": [
          {"name": "쌀", "amount": "50", "unit": "g"},
          {"name": "닭고기", "amount": "30", "unit": "g"},
          {"name": "브로콜리", "amount": "25", "unit": "g"}
        ],
        "steps": [
          "쌀을 30분 불린 뒤 5배 물과 함께 끓인다",
          "닭고기를 삶아 5mm 크기로 잘게 찢는다",
          "브로콜리를 스팀으로 2분 쪄서 5mm로 다진다",
          "진밥에 닭고기와 브로콜리를 섞어 한 번 더 끓인다"
        ],
        "reason": "단백질과 비타민C가 균형잡힌 후기 이유식입니다"
      }
    ]
  }
]`;

// ─── Gemini API 호출 (Vertex AI) ────────────────────────────────────────────
async function callGemini(apiKey, prompt, { temperature = 0.7, maxTokens = 4096 } = {}) {
  const token = await getAccessToken();
  const res = await fetch(VERTEX_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Vertex AI 오류 [${res.status}]:`, errText);
    console.error("요청 URL:", VERTEX_ENDPOINT);
    if (res.status === 429) {
      throw new Error("AI 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
    }
    throw new Error(`AI 서버 오류가 발생했습니다. (${res.status})`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ─── JSON 안전 파싱 ──────────────────────────────────────────────────────────
function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) return JSON.parse(match[1] || match[0]);
    throw new Error("JSON 파싱 실패: " + text.slice(0, 200));
  }
}

// ─── LLM-as-a-Judge ──────────────────────────────────────────────────────────
/**
 * 생성된 식단을 같은 Flash 모델로 검증합니다.
 * HARD 규칙만 넣어 Judge 호출 토큰을 최소화합니다.
 */
async function judgeResult(apiKey, generated, { stage, allergies, hardRulesForJudge, mode }) {
  const judgeRulesText = buildJudgeRules(hardRulesForJudge);

  const prompt = `
당신은 이유식 안전 검증 전문가입니다. 아래 규칙에 따라 생성된 식단을 검증하세요.
JSON으로만 응답하며, 다른 텍스트는 절대 포함하지 마세요.

[검증 규칙]
${judgeRulesText}

[추가 확인 사항]
- 사용자 알레르기 목록: ${allergies.length ? allergies.join(", ") : "없음"} → 이 재료 및 파생 재료 포함 금지
- 이유식 단계: ${stage}
${mode === "schedule" ? "- 같은 날 끼니 간 주재료 중복 여부 확인" : ""}

[검증할 식단]
${JSON.stringify(generated)}

[응답 형식]
{
  "pass": true 또는 false,
  "issues": ["발견된 문제점 (없으면 빈 배열)"],
  "fixSuggestion": "수정 방향 (pass가 true이면 null)"
}
`.trim();

  const raw = await callGemini(apiKey, prompt, { temperature: 0.1, maxTokens: 512 });
  return safeParseJSON(raw);
}

// ─── 식단 전체 생성 ──────────────────────────────────────────────────────────
async function generateFullSchedule(apiKey, params) {
  const { babyName, stage, stageLabel, mealsPerDay, allergies, fridgeIngredients, startDate, endDate, comment } = params;

  const fridgeNames = (fridgeIngredients || []).map((i) => i.name);
  const allergyText = allergies?.length ? allergies.join(", ") : "없음";
  const slots = mealsPerDay === 1 ? ["아침"] : mealsPerDay === 2 ? ["아침", "저녁"] : ["아침", "점심", "저녁"];

  // 1. RAG: 소아과 가이드라인 조회
  const knowledge = await retrieveKnowledge({
    stage,
    allergies: allergies || [],
    ingredients: fridgeNames,
  });
  const ragContext = buildPromptContext(knowledge);

  // 2. 날짜 목록 생성
  const dates = [];
  const cur = new Date(startDate);
  const end = new Date(endDate);
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  while (cur <= end) {
    dates.push({ date: cur.toISOString().split("T")[0], day: dayNames[cur.getDay()] });
    cur.setDate(cur.getDate() + 1);
  }

  // 3. 프롬프트 구성 (RAG + Few-Shot)
  const prompt = `
당신은 소아과 전문 영양사입니다. 아래 전문 가이드라인을 완전히 준수하여 이유식 식단을 생성하세요.

${ragContext}

${FEW_SHOT_SCHEDULE}

[생성 조건]
- 아기 이름: ${babyName}
- 이유식 단계: ${stageLabel}
- 기간: ${startDate} ~ ${endDate} (${dates.length}일)
- 하루 ${mealsPerDay}끼: ${slots.join(", ")}
- 절대 금지 알레르기: ${allergyText}
- 냉장고 재료 우선 사용: ${fridgeNames.length ? fridgeNames.join(", ") : "없음"}
- 추가 요청: ${comment || "없음"}

[생성 규칙]
1. HARD CONSTRAINT 절대 준수 (위반 시 해당 레시피 전체 무효)
2. 물성(Texture) 가이드라인의 입자 크기와 농도를 steps에 구체적으로 명시
3. 영양 흡수 시너지 조합을 최대한 활용 (예: 철분 식품 + 비타민C 채소)
4. 같은 날 끼니 간 주재료 중복 금지
5. 주차별로 단백질 소스 다양화 (소고기 → 닭고기 → 두부 → 생선 등)
6. 냉장고 재료를 우선 소진하되 영양 균형 유지
7. reason에 영양학적 근거 포함

생성할 날짜 목록: ${JSON.stringify(dates)}

JSON 배열만 출력하세요. 다른 텍스트 없이.
`.trim();

  // 4. 생성
  const rawSchedule = await callGemini(apiKey, prompt, { temperature: 0.75, maxTokens: 8192 });
  const schedule = safeParseJSON(rawSchedule);

  // 5. LLM-as-a-Judge 검증
  const judgment = await judgeResult(apiKey, schedule, {
    stage,
    allergies: allergies || [],
    hardRulesForJudge: knowledge.hardRulesForJudge,
    mode: "schedule",
  });

  console.log("Judge 결과:", JSON.stringify(judgment));

  let finalSchedule = schedule;
  if (!judgment.pass) {
    // 재생성 (1회) — 문제점과 수정 방향을 프롬프트에 추가
    console.log("Judge 실패, 재생성:", judgment.issues);
    const retryPrompt = prompt + `

[⚠️ 이전 생성 실패 — 반드시 수정]
발견된 문제: ${judgment.issues.join(", ")}
수정 방향: ${judgment.fixSuggestion || "위 문제를 모두 해결하세요"}
동일한 실수를 반복하면 안 됩니다.`;

    const rawRetry = await callGemini(apiKey, retryPrompt, { temperature: 0.5, maxTokens: 8192 });
    finalSchedule = safeParseJSON(rawRetry);
  }

  // 6. 장보기 목록 + 팁 생성 (가벼운 별도 호출)
  const shoppingPrompt = `
이유식 식단 재료를 분석해 장보기 목록을 JSON으로만 생성하세요.

냉장고에 이미 있는 재료 (구매 불필요): ${fridgeNames.join(", ") || "없음"}

식단: ${JSON.stringify(finalSchedule)}

[응답 형식]
{
  "shoppingList": [
    {"name": "재료명", "amount": "수량", "unit": "단위", "category": "채소|육류|해산물|유제품|곡류|양념|기타"}
  ],
  "tips": "이번 주 식단의 영양학적 특징과 보관 팁 (2~3문장)"
}`.trim();

  const shoppingRaw = await callGemini(apiKey, shoppingPrompt, { temperature: 0.3, maxTokens: 1024 });
  const { shoppingList, tips } = safeParseJSON(shoppingRaw);

  return { schedule: finalSchedule, shoppingList, tips };
}

// ─── 개별 메뉴 변경 ──────────────────────────────────────────────────────────
async function generateSingleMeal(apiKey, params) {
  const { stage, stageLabel, allergies, slot, otherMeals, userPrompt } = params;

  // 1. RAG 조회
  const knowledge = await retrieveKnowledge({
    stage,
    allergies: allergies || [],
    ingredients: [],
  });
  const ragContext = buildPromptContext(knowledge);

  // 2. 프롬프트 구성
  const prompt = `
당신은 소아과 전문 영양사입니다. 아래 가이드라인을 완전히 준수하여 이유식 1개를 생성하세요.

${ragContext}

${FEW_SHOT_SINGLE}

[생성 조건]
- 이유식 단계: ${stageLabel}
- 끼니: ${slot}
- 절대 금지 알레르기: ${(allergies || []).join(", ") || "없음"}
- 같은 날 다른 끼니 (주재료 겹침 금지): ${(otherMeals || []).join(", ") || "없음"}
- 추가 요청: ${userPrompt || "없음"}

JSON만 출력하세요. 다른 텍스트 없이.
`.trim();

  const raw = await callGemini(apiKey, prompt, { temperature: 0.85, maxTokens: 1024 });
  const meal = safeParseJSON(raw);

  // 3. Judge 검증
  const judgment = await judgeResult(apiKey, meal, {
    stage,
    allergies: allergies || [],
    hardRulesForJudge: knowledge.hardRulesForJudge,
    mode: "single",
  });

  if (!judgment.pass) {
    console.log("단일 메뉴 Judge 실패, 재생성:", judgment.issues);
    const retryPrompt = prompt + `\n\n[이전 실패 원인: ${judgment.issues.join(", ")}] 반드시 수정하세요.`;
    const rawRetry = await callGemini(apiKey, retryPrompt, { temperature: 0.5, maxTokens: 1024 });
    return safeParseJSON(rawRetry);
  }

  return meal;
}

// ─── 사용량 제한 ─────────────────────────────────────────────────────────────
async function checkAndIncrementUsage(uid) {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const today = kst.toISOString().split("T")[0];
  const ref = db.collection("apiUsage").doc(`${uid}_${today}`);
  const snap = await ref.get();
  const count = snap.exists ? snap.data().count : 0;
  if (count >= DAILY_LIMIT) return false;
  await ref.set({ count: count + 1, updatedAt: new Date().toISOString() }, { merge: true });
  return true;
}

// ─── Cloud Function 엔트리포인트 ─────────────────────────────────────────────
exports.generateMealSchedule = onRequest(
  {
    timeoutSeconds: 300,
    memory: "512MiB",
    region: "asia-northeast3",
  },
  async (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") return res.status(405).json({ error: "POST만 허용" });

      // 인증
      const idToken = (req.headers.authorization || "").replace("Bearer ", "");
      if (!idToken) return res.status(401).json({ error: "인증 토큰 없음" });

      let uid;
      try {
        uid = (await admin.auth().verifyIdToken(idToken)).uid;
      } catch {
        return res.status(401).json({ error: "유효하지 않은 토큰" });
      }

      // 사용량 제한
      if (!(await checkAndIncrementUsage(uid))) {
        return res.status(429).json({ error: "오늘 사용 한도(5회)를 초과했습니다" });
      }

      try {
        const body = req.body;
        const result = body.mode === "singleMeal"
          ? await generateSingleMeal(null, body)
          : await generateFullSchedule(null, body);

        return res.status(200).json(result);
      } catch (err) {
        console.error("처리 오류:", err);
        return res.status(500).json({ error: "서버 오류", detail: err.message });
      }
    });
  }
);
