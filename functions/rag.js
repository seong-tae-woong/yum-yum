/**
 * rag.js — YumYum RAG 모듈
 *
 * Firestore knowledgeBase에서 상황에 맞는 청크를 검색하고
 * Gemini 프롬프트에 삽입할 컨텍스트 문자열을 만들어 반환합니다.
 *
 * 사용법 (functions/index.js에서 import):
 *   const { retrieveKnowledge, buildPromptContext, buildJudgeRules } = require("./rag");
 */

const admin = require("firebase-admin");

// initializeApp() 이후 호출되도록 lazy 초기화
let _db;
function getDb() {
  if (!_db) _db = admin.firestore();
  return _db;
}

/**
 * Firestore knowledgeBase에서 현재 상황에 맞는 청크를 조회합니다.
 *
 * @param {object} params
 * @param {string} params.stage        - "EARLY" | "MID" | "LATE" | "COMPLETE"
 * @param {string[]} params.allergies  - 사용자 알레르기 목록
 * @param {string[]} params.ingredients - 사용 예정 주요 재료 (태그 매칭용)
 * @returns {Promise<{ hardRules: string, softRules: string, nutritionTips: string }>}
 */
async function retrieveKnowledge({ stage, allergies = [], ingredients = [] }) {
  const col = getDb().collection("knowledgeBase");

  // 1. 해당 단계에 적용되는 청크 조회
  //    stages 배열이 비어있으면 전 단계 공통 → 두 쿼리로 합치기
  const [stageSnap, globalSnap] = await Promise.all([
    col.where("stages", "array-contains", stage).get(),
    col.where("stages", "==", []).get(),
  ]);

  const allDocs = [];
  stageSnap.forEach((d) => allDocs.push(d.data()));
  globalSnap.forEach((d) => allDocs.push(d.data()));

  // 2. 재료 기반 관련도 스코어링
  //    사용 재료가 태그에 포함될수록 우선순위 ↑
  const scored = allDocs.map((doc) => {
    const tagMatches = (doc.tags || []).filter(
      (tag) => ingredients.some((ing) => ing.includes(tag) || tag.includes(ing))
    ).length;
    return { ...doc, _score: tagMatches };
  });

  // 3. HARD / SOFT / nutrition / texture / cooking 분류
  const hard = scored.filter(
    (d) => d.priority === "HARD"
  );
  const soft = scored.filter(
    (d) => d.priority === "SOFT" && d.type === "soft_constraint"
  );
  const nutrition = scored.filter(
    (d) => d.type === "nutrition" || d.type === "cooking"
  ).sort((a, b) => b._score - a._score);
  const texture = scored.find((d) => d.type === "texture"); // 해당 단계 1개

  // 4. 프롬프트 텍스트 조립
  const hardText = hard.map((d) => d.content).join("\n\n");
  const softText = soft.map((d) => d.content).join("\n\n");
  const nutritionText = nutrition.slice(0, 3).map((d) => d.content).join("\n\n");
  const textureText = texture ? texture.content : "";

  return {
    hardRules: hardText,
    softRules: softText,
    nutritionTips: nutritionText,
    textureGuide: textureText,
    // Judge용: HARD 규칙만 따로
    hardRulesForJudge: hard.map((d) => ({
      title: d.title,
      content: d.content,
    })),
  };
}

/**
 * 식단 생성 프롬프트에 삽입할 RAG 컨텍스트 블록을 만듭니다.
 */
function buildPromptContext({ hardRules, softRules, nutritionTips, textureGuide }) {
  return `
══════════════════════════════════════════
[소아과 전문 가이드라인 - 반드시 준수]
══════════════════════════════════════════

## 🚫 HARD CONSTRAINTS (절대 위반 금지)
아래 규칙을 하나라도 위반하면 레시피 생성 불가:

${hardRules}

## ⚠️ SOFT CONSTRAINTS (최대한 준수)
가능하면 아래 조합을 피하고, 불가피한 경우 notes에 주의사항 기재:

${softRules}

## 🥗 물성(Texture) 기준
${textureGuide}

## 💡 영양 흡수 최적화 팁
${nutritionTips}

══════════════════════════════════════════
위 가이드라인을 완전히 숙지하고 레시피를 생성하세요.
══════════════════════════════════════════
`.trim();
}

/**
 * Judge 검증 프롬프트에 삽입할 규칙 텍스트를 만듭니다.
 * HARD 규칙만 집중적으로 넣어 Judge 토큰을 절약합니다.
 */
function buildJudgeRules(hardRulesForJudge) {
  if (!hardRulesForJudge?.length) return "알레르기 재료 포함 여부만 확인하세요.";

  return hardRulesForJudge
    .map((r, i) => `[검증항목 ${i + 1}] ${r.title}\n${r.content}`)
    .join("\n\n");
}

module.exports = { retrieveKnowledge, buildPromptContext, buildJudgeRules };
