/**
 * seedKnowledgeBase.js
 *
 * 소아과 전문 지식을 Firestore knowledgeBase 컬렉션에 구조화하여 저장합니다.
 *
 * 컬렉션 구조:
 *   knowledgeBase/{id}
 *     - type: "texture" | "nutrition" | "hard_constraint" | "soft_constraint" | "cooking"
 *     - stages: ["EARLY","MID","LATE","COMPLETE"] ← 해당 단계 목록 (빈 배열 = 전 단계 적용)
 *     - title: string          ← 검색 키 / 로그용
 *     - content: string        ← 프롬프트에 삽입될 실제 텍스트
 *     - priority: "HARD"|"SOFT" ← HARD = Judge가 반드시 걸러야 할 규칙
 *     - tags: string[]         ← 빠른 필터링용 (예: ["철분","비타민C","흡수"])
 *
 * 사용법:
 *   node seedKnowledgeBase.cjs
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const KNOWLEDGE_BASE = [

  // ════════════════════════════════════════════════════════════════
  // 1. 물성(Texture) 가이드라인
  // ════════════════════════════════════════════════════════════════
  {
    type: "texture",
    stages: ["EARLY"],
    priority: "HARD",
    title: "초기(1단계) 물성 기준",
    tags: ["물성", "질감", "입자크기", "초기"],
    content: `
[초기 이유식 (4~6개월) 물성 규칙 - HARD CONSTRAINT]
- 발달 특징: 혀의 전후 운동만 가능
- 점도: 스푼을 기울였을 때 흐르는 정도 (묽은 미음)
- 입자 크기: 0mm (완전 미음, 덩어리 절대 금지)
- 조리법: 10~20배 죽, 고운 체에 반드시 2번 거름
- 위반 시: 영아 질식 위험 — 레시피 생성 거부
    `.trim(),
  },
  {
    type: "texture",
    stages: ["MID"],
    priority: "HARD",
    title: "중기(2단계) 물성 기준",
    tags: ["물성", "질감", "입자크기", "중기"],
    content: `
[중기 이유식 (7~9개월) 물성 규칙 - HARD CONSTRAINT]
- 발달 특징: 혀와 입천장으로 으깨기 가능
- 점도: 요플레 수준의 농도
- 입자 크기: 2~3mm (쌀알의 1/3 크기)
- 경도 기준: 두부 정도로 손가락으로 쉽게 으깨지는 수준
- 조리법: 7~10배 죽
- 위반 시: 소화 장애 및 질식 위험 — 입자 크기 초과 레시피 반려
    `.trim(),
  },
  {
    type: "texture",
    stages: ["LATE"],
    priority: "HARD",
    title: "후기(3단계) 물성 기준",
    tags: ["물성", "질감", "입자크기", "후기"],
    content: `
[후기 이유식 (10~12개월) 물성 규칙 - HARD CONSTRAINT]
- 발달 특징: 잇몸으로 으깨기 시작
- 입자 크기: 5mm (쌀알 크기 ~ 반알)
- 경도 기준: 바나나 정도 (손가락으로 힘 줘야 으깨지는 수준)
- 조리법: 5배 죽 또는 진밥 형태
- 허용 형태: 형태가 유지되는 진밥, 잘게 찢은 육류
    `.trim(),
  },
  {
    type: "texture",
    stages: ["COMPLETE"],
    priority: "SOFT",
    title: "완료기(4단계) 물성 기준",
    tags: ["물성", "질감", "입자크기", "완료기"],
    content: `
[완료기 이유식 (13개월+) 물성 규칙]
- 발달 특징: 어금니 쪽 잇몸 사용, 약한 저작 가능
- 입자 크기: 7~10mm (큐브 형태)
- 경도 기준: 잘 익은 검은콩 정도, 무른 밥 수준
- 조리법: 무른 밥, 부드러운 일반식
- 주의: 아직 단단한 견과류, 날것은 금지
    `.trim(),
  },

  // ════════════════════════════════════════════════════════════════
  // 2. 미량 영양소 흡수 시너지 (Positive Synergy)
  // ════════════════════════════════════════════════════════════════
  {
    type: "nutrition",
    stages: [],
    priority: "SOFT",
    title: "철분 흡수 최적화 조합",
    tags: ["철분", "비타민C", "흡수", "시너지", "소고기", "브로콜리"],
    content: `
[철분(Fe) 흡수 최적화 - 권장 조합]
- 비헴철(식물성 철분)은 비타민 C와 함께 섭취 시 흡수율 최대 3배 증가
- 권장 조합 예시: 소고기 + 브로콜리, 소고기 + 사과, 시금치 + 비타민C 풍부 채소
- 칼슘(Ca)은 철분과 흡수 경로가 동일하여 서로 경쟁 → 철분 풍부 식단에 치즈/우유 과다 배제
- 피티산(Phytate) 주의: 현미·콩류는 반드시 12시간 이상 불리거나 발아 후 사용
    `.trim(),
  },
  {
    type: "nutrition",
    stages: [],
    priority: "SOFT",
    title: "지용성 비타민 흡수 최적화",
    tags: ["비타민A", "베타카로틴", "당근", "지용성", "오일"],
    content: `
[지용성 비타민 (A, D, E, K) 흡수 최적화]
- 당근의 베타카로틴은 지용성 → 식물성 오일(현미유, 올리브유) 한 방울과 함께 조리 시 흡수율 극대화
- 조리 팁: 당근은 기름에 살짝 볶거나, 오일 한 방울을 넣고 찌기
- 시금치·브로콜리의 비타민 K도 동일하게 오일과 함께 섭취 권장
    `.trim(),
  },

  // ════════════════════════════════════════════════════════════════
  // 3. 독성학적 안전 제약 (Hard Constraints - 절대 금지)
  // ════════════════════════════════════════════════════════════════
  {
    type: "hard_constraint",
    stages: ["EARLY", "MID", "LATE", "COMPLETE"],
    priority: "HARD",
    title: "꿀 절대 금지 (보툴리누스균)",
    tags: ["꿀", "보툴리누스", "금지", "12개월미만"],
    content: `
[꿀 - HARD CONSTRAINT - 12개월 미만 절대 금지]
- 이유: Clostridium botulinum(보툴리누스균) 포자는 열처리로도 제거 불가
- 12개월 미만 영아에게 꿀(가공·천연 모두) 절대 사용 금지
- 위반 감지 시: 레시피 즉시 반려, 대체 감미료(과일 퓨레 등) 제안
    `.trim(),
  },
  {
    type: "hard_constraint",
    stages: ["EARLY"],
    priority: "HARD",
    title: "초기 질산염 채소 섭취 제한",
    tags: ["질산염", "시금치", "당근", "비트", "배추", "초기", "청색증"],
    content: `
[질산염(Nitrate) 함량 채소 - HARD CONSTRAINT - 초기(6개월 미만)]
- 대상 채소: 시금치, 당근, 비트, 배추
- 위험: 질산염 과다 → 메트헤모글로빈혈증(청색증) 유발
- 규칙: 초기 이유식에서 위 채소 비중은 전체 식재료의 20% 초과 금지
- 당근의 경우 소량(5~10g) 사용 시 허용, 단독 주재료로 사용 금지
    `.trim(),
  },
  {
    type: "hard_constraint",
    stages: ["EARLY", "MID", "LATE"],
    priority: "HARD",
    title: "알레르기 유발 식품 도입 순서 원칙",
    tags: ["알레르기", "달걀", "우유", "밀", "땅콩", "새우", "게", "도입순서"],
    content: `
[알레르기 유발 식품 도입 원칙 - HARD CONSTRAINT]
- 9대 알레르기 식품: 달걀(흰자), 우유, 밀, 땅콩, 게, 새우, 복숭아, 견과류, 대두
- 규칙: 신규 식재료 도입 시 반드시 3일간 단독 테스트 후 혼합
- 레시피 생성 시: 알레르기 식품을 새로 도입하는 경우 단독 메뉴로만 구성
- 사용자가 알레르기로 등록한 식재료는 모든 레시피에서 완전 배제 (파생 식재료 포함)
  예시: "달걀" 알레르기 → 달걀, 마요네즈, 달걀이 들어간 빵 전부 금지
    `.trim(),
  },
  {
    type: "hard_constraint",
    stages: ["EARLY", "MID", "LATE", "COMPLETE"],
    priority: "HARD",
    title: "기타 절대 금지 식품 목록",
    tags: ["금지", "생우유", "가공육", "짠음식", "설탕"],
    content: `
[절대 금지 식품 목록 - HARD CONSTRAINT (전 단계)]
- 생우유: 12개월 미만 금지 (신장 부담, 소화 장애)
- 가공육(햄, 소시지, 베이컨): 나트륨·방부제 과다
- 꿀: 12개월 미만 전면 금지 (보툴리누스)
- 과다 소금·설탕: 이유식 전 단계에서 무염·무가당 원칙
- 견과류 통째: 질식 위험 (완료기에도 반드시 분쇄 후 사용)
- 날것의 해산물·육류: 식중독 위험
    `.trim(),
  },

  // ════════════════════════════════════════════════════════════════
  // 4. 식재료 상호작용 금지/제한 (Negative Compatibility)
  // ════════════════════════════════════════════════════════════════
  {
    type: "soft_constraint",
    stages: [],
    priority: "HARD",
    title: "칼슘-수산 결합 금지 (두부+시금치)",
    tags: ["두부", "멸치", "시금치", "수산", "칼슘", "요로결석"],
    content: `
[칼슘-수산 상호작용 - HARD CONSTRAINT]
- 금지 조합: 두부/멸치(고칼슘) + 시금치(수산 함유)
- 원인: 수산(Oxalic acid)과 칼슘이 결합 → 수산칼슘 형성
- 결과: 칼슘 흡수율 저하 + 영아의 경우 소화 부담, 요로결석 위험
- 판정: 동일 레시피 내 조합 금지, Judge가 반드시 차단
    `.trim(),
  },
  {
    type: "soft_constraint",
    stages: [],
    priority: "SOFT",
    title: "미역-파 칼슘 흡수 방해",
    tags: ["미역", "파", "칼슘", "흡수방해"],
    content: `
[미역-파 상호작용 - SOFT CONSTRAINT]
- 지양 조합: 미역/김(고칼슘) + 파(유황·인 성분)
- 원인: 파의 유황·인이 미역의 칼슘 흡수 방해
- 가이드라인: 동일 식단 내 동시 사용 지양, 불가피한 경우 파 사용량 최소화
    `.trim(),
  },
  {
    type: "soft_constraint",
    stages: [],
    priority: "SOFT",
    title: "당근/오이 - 비타민C 채소 생식 조합 주의",
    tags: ["당근", "오이", "아스코르비나아제", "비타민C", "무", "배추"],
    content: `
[아스코르비나아제 효소 - SOFT CONSTRAINT]
- 지양 조합 (생식 시): 당근/오이 + 무/배추 등 비타민C 풍부 채소
- 원인: 당근·오이의 아스코르비나아제 효소가 비타민C 파괴
- 예외: 가열 조리 시 효소가 파괴되므로 허용
- 이유식은 대부분 가열 조리 → SOFT 처리, Judge는 생식 레시피에만 경고
    `.trim(),
  },
  {
    type: "soft_constraint",
    stages: [],
    priority: "HARD",
    title: "철분 식품 - 탄닌 결합 금지",
    tags: ["철분", "탄닌", "녹차", "홍차", "간", "소고기"],
    content: `
[철분-탄닌 상호작용 - HARD CONSTRAINT]
- 금지 조합: 간/육류(철분 풍부) + 녹차/홍차(탄닌)
- 원인: 탄닌이 철분과 결합하여 불용성 화합물 형성 → 흡수 차단
- 결과: 철분 결핍 위험 증가
- 규칙: 철분 풍부 식단 후 1시간 이내 탄닌 음료 제공 금지 (레시피 notes에 명시)
    `.trim(),
  },
  {
    type: "soft_constraint",
    stages: ["EARLY", "MID"],
    priority: "SOFT",
    title: "소고기-고구마 소화 부담",
    tags: ["소고기", "고구마", "소화", "위산"],
    content: `
[소고기-고구마 소화 간섭 - SOFT CONSTRAINT (초기/중기)]
- 지양 조합: 소고기 + 고구마 (초기·중기 한정)
- 원인: 두 식재료 소화에 필요한 위산 농도가 달라 소화 시간 장기화
- 가이드라인: 후기·완료기 이후 제한적 허용, 초기·중기는 분리 제공 권장
    `.trim(),
  },
  {
    type: "soft_constraint",
    stages: [],
    priority: "HARD",
    title: "토마토-설탕 비타민B1 파괴",
    tags: ["토마토", "설탕", "비타민B1"],
    content: `
[토마토-설탕 상호작용 - HARD CONSTRAINT]
- 금지 조합: 토마토 + 설탕
- 원인: 설탕 대사 시 토마토의 비타민 B1이 모두 소모됨 → 비타민 B1 흡수율 0
- 가이드라인: 토마토 조리 시 설탕 사용 금지, 단맛 필요 시 과일 퓨레로 대체
    `.trim(),
  },
  {
    type: "soft_constraint",
    stages: [],
    priority: "SOFT",
    title: "우유-설탕 비타민B1 흡수 방해",
    tags: ["우유", "설탕", "비타민B1", "간식"],
    content: `
[우유-설탕 상호작용 - SOFT CONSTRAINT]
- 지양 조합: 우유 + 설탕
- 원인: 설탕이 우유 속 비타민 B1 흡수 방해
- 가이드라인: 돌 이후 간식 제공 시 주의, 무가당 원칙 유지
    `.trim(),
  },

  // ════════════════════════════════════════════════════════════════
  // 5. 조리법 화학 (Food Chemistry) — 영양 손실 최소화
  // ════════════════════════════════════════════════════════════════
  {
    type: "cooking",
    stages: [],
    priority: "SOFT",
    title: "수용성 비타민 손실 최소화 조리법",
    tags: ["비타민C", "비타민B", "수용성", "찌기", "삶기", "육수"],
    content: `
[수용성 비타민 (B, C) 손실 최소화]
- 원칙: 삶기(Boiling)보다 찌기(Steaming) 우선 권장
  → 삶기 시 비타민 C 최대 50% 손실, 찌기 시 15% 이하
- 육수 사용 시: 삶은 물에 수용성 비타민이 용출되므로 반드시 육수를 요리에 포함
- 조리 팁 예시: "브로콜리는 끓는 물에 1분만 데치거나 스팀으로 2분 쪄주세요"
- 레시피 steps 생성 시 위 원칙 반영 필수
    `.trim(),
  },
];

// ─────────────────────────────────────────────────────────────────
async function seed() {
  const col = db.collection("knowledgeBase");
  const now = new Date().toISOString();

  // 기존 데이터 삭제 (재실행 시 중복 방지)
  console.log("기존 knowledgeBase 초기화 중...");
  const existing = await col.get();
  const deleteBatch = db.batch();
  existing.forEach((doc) => deleteBatch.delete(doc.ref));
  await deleteBatch.commit();

  // 새 데이터 삽입
  console.log(`${KNOWLEDGE_BASE.length}개 청크 삽입 중...`);
  const insertBatch = db.batch();
  KNOWLEDGE_BASE.forEach((item) => {
    insertBatch.set(col.doc(), { ...item, createdAt: now });
  });
  await insertBatch.commit();

  console.log("✅ knowledgeBase 시드 완료!");
  console.log("\n📊 삽입 현황:");
  const typeCounts = {};
  KNOWLEDGE_BASE.forEach((item) => {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
  });
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}개`);
  });

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ 시드 오류:", err);
  process.exit(1);
});
