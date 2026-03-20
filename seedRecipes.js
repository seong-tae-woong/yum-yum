import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBY58u9tj8Fr3AHwGvmlxQPZqXzSOwWjDc",
  authDomain: "yum-yum-e7940.firebaseapp.com",
  projectId: "yum-yum-e7940",
  storageBucket: "yum-yum-e7940.firebasestorage.app",
  messagingSenderId: "496837300420",
  appId: "1:496837300420:web:b2235dad993250e6e77991"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const recipes = [
  // === 초기 (EARLY) 4~6개월 ===
  {
    title: "쌀미음",
    description: "아기의 첫 이유식, 부드러운 쌀미음",
    stage: "EARLY",
    cookingTime: 30,
    likeCount: 58,
    ingredients: [
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "쌀을 30분 이상 불려주세요", timerSec: 1800 },
      { text: "불린 쌀을 믹서에 곱게 갈아주세요", timerSec: 0 },
      { text: "냄비에 갈은 쌀과 물을 넣고 약불에서 저어가며 끓여주세요", timerSec: 900 },
      { text: "체에 걸러 부드러운 미음만 완성해주세요", timerSec: 0 }
    ],
    tags: ["첫이유식", "쌀", "미음"],
    source: "DB"
  },
  {
    title: "감자미음",
    description: "달콤하고 부드러운 감자 미음",
    stage: "EARLY",
    cookingTime: 25,
    likeCount: 42,
    ingredients: [
      { name: "감자", amount: "1/2", unit: "개" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "감자를 깨끗이 씻어 껍질을 벗겨주세요", timerSec: 0 },
      { text: "감자를 얇게 썰어 물에 담가 전분을 빼주세요", timerSec: 600 },
      { text: "냄비에 감자와 물을 넣고 푹 삶아주세요", timerSec: 900 },
      { text: "믹서에 곱게 갈아 체에 걸러 완성해주세요", timerSec: 0 }
    ],
    tags: ["감자", "미음", "첫이유식"],
    source: "DB"
  },
  {
    title: "단호박미음",
    description: "자연의 단맛이 가득한 단호박 미음",
    stage: "EARLY",
    cookingTime: 25,
    likeCount: 51,
    ingredients: [
      { name: "단호박", amount: "50", unit: "g" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "단호박의 씨를 제거하고 껍질을 벗겨주세요", timerSec: 0 },
      { text: "쌀을 30분 불려 곱게 갈아주세요", timerSec: 1800 },
      { text: "단호박을 찜기에 쪄서 으깨주세요", timerSec: 600 },
      { text: "갈은 쌀과 단호박, 물을 넣고 약불에 끓여주세요", timerSec: 600 },
      { text: "체에 걸러 부드럽게 완성해주세요", timerSec: 0 }
    ],
    tags: ["단호박", "미음", "달콤"],
    source: "DB"
  },
  {
    title: "사과미음",
    description: "새콤달콤한 사과로 만든 미음",
    stage: "EARLY",
    cookingTime: 20,
    likeCount: 38,
    ingredients: [
      { name: "사과", amount: "1/4", unit: "개" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "사과 껍질을 벗기고 씨를 제거해주세요", timerSec: 0 },
      { text: "쌀을 불려 곱게 갈아주세요", timerSec: 0 },
      { text: "사과를 강판에 곱게 갈아주세요", timerSec: 0 },
      { text: "갈은 쌀과 물을 넣고 끓이다 사과를 넣어주세요", timerSec: 600 },
      { text: "체에 걸러 완성해주세요", timerSec: 0 }
    ],
    tags: ["사과", "미음", "비타민"],
    source: "DB"
  },
  {
    title: "고구마미음",
    description: "달콤한 고구마로 만든 영양 미음",
    stage: "EARLY",
    cookingTime: 25,
    likeCount: 45,
    ingredients: [
      { name: "고구마", amount: "1/2", unit: "개" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "고구마를 깨끗이 씻어 껍질을 벗겨주세요", timerSec: 0 },
      { text: "고구마를 찜기에서 푹 쪄주세요", timerSec: 900 },
      { text: "쪄진 고구마를 물과 함께 믹서에 곱게 갈아주세요", timerSec: 0 },
      { text: "체에 걸러 부드러운 미음으로 완성해주세요", timerSec: 0 }
    ],
    tags: ["고구마", "미음", "달콤"],
    source: "DB"
  },

  // === 중기 (MID) 7~9개월 ===
  {
    title: "소고기당근죽",
    description: "철분 가득 소고기와 당근의 영양 죽",
    stage: "MID",
    cookingTime: 35,
    likeCount: 67,
    ingredients: [
      { name: "소고기", amount: "20", unit: "g" },
      { name: "당근", amount: "15", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 찬물에 담가 핏물을 빼주세요", timerSec: 1800 },
      { text: "쌀을 불려 믹서에 거칠게 갈아주세요", timerSec: 0 },
      { text: "소고기를 삶아서 잘게 다져주세요", timerSec: 600 },
      { text: "당근을 곱게 다져주세요", timerSec: 0 },
      { text: "냄비에 갈은 쌀과 물을 넣고 끓이다 소고기, 당근 넣어주세요", timerSec: 600 },
      { text: "약불에서 저어가며 5분 더 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["소고기", "철분", "당근", "죽"],
    source: "DB"
  },
  {
    title: "닭고기브로콜리죽",
    description: "고단백 닭고기와 브로콜리의 건강한 죽",
    stage: "MID",
    cookingTime: 30,
    likeCount: 53,
    ingredients: [
      { name: "닭고기", amount: "20", unit: "g" },
      { name: "브로콜리", amount: "15", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["닭고기"],
    steps: [
      { text: "닭고기를 삶아 곱게 다져주세요", timerSec: 600 },
      { text: "브로콜리를 끓는 물에 데쳐 잘게 다져주세요", timerSec: 60 },
      { text: "쌀을 불려 거칠게 갈아주세요", timerSec: 0 },
      { text: "냄비에 갈은 쌀과 물을 넣고 끓여주세요", timerSec: 600 },
      { text: "닭고기와 브로콜리를 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["닭고기", "브로콜리", "단백질", "죽"],
    source: "DB"
  },
  {
    title: "두부시금치죽",
    description: "부드러운 두부와 시금치의 영양 듬뿍 죽",
    stage: "MID",
    cookingTime: 25,
    likeCount: 41,
    ingredients: [
      { name: "두부", amount: "30", unit: "g" },
      { name: "시금치", amount: "10", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["대두"],
    steps: [
      { text: "시금치를 끓는 물에 살짝 데쳐 잘게 다져주세요", timerSec: 30 },
      { text: "두부를 으깨주세요", timerSec: 0 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "두부와 시금치를 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["두부", "시금치", "철분", "죽"],
    source: "DB"
  },
  {
    title: "연두부죽",
    description: "아기가 좋아하는 부드러운 연두부 죽",
    stage: "MID",
    cookingTime: 20,
    likeCount: 36,
    ingredients: [
      { name: "연두부", amount: "50", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "250", unit: "ml" }
    ],
    allergens: ["대두"],
    steps: [
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "연두부를 으깨서 넣어주세요", timerSec: 0 },
      { text: "약불에서 저어가며 5분 더 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["연두부", "단백질", "부드러운", "죽"],
    source: "DB"
  },
  {
    title: "달걀노른자죽",
    description: "영양 가득한 달걀 노른자로 만든 죽",
    stage: "MID",
    cookingTime: 25,
    likeCount: 48,
    ingredients: [
      { name: "달걀", amount: "1", unit: "개" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["계란"],
    steps: [
      { text: "달걀을 삶아 노른자만 분리해주세요", timerSec: 720 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "삶은 노른자를 으깨서 죽에 넣어주세요", timerSec: 0 },
      { text: "약불에서 잘 섞어가며 완성해주세요", timerSec: 180 }
    ],
    tags: ["달걀", "노른자", "영양", "죽"],
    source: "DB"
  },

  // === 후기 (LATE) 10~12개월 ===
  {
    title: "소고기채소진밥",
    description: "소고기와 다양한 채소로 만든 진밥",
    stage: "LATE",
    cookingTime: 30,
    likeCount: 55,
    ingredients: [
      { name: "소고기", amount: "30", unit: "g" },
      { name: "당근", amount: "15", unit: "g" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "애호박", amount: "15", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "150", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 잘게 다져주세요", timerSec: 0 },
      { text: "당근, 양파, 애호박을 잘게 다져주세요", timerSec: 0 },
      { text: "냄비에 소고기를 볶다가 채소를 넣어주세요", timerSec: 180 },
      { text: "밥과 물을 넣고 약불에서 끓여주세요", timerSec: 600 },
      { text: "밥알이 퍼지면 완성해주세요", timerSec: 0 }
    ],
    tags: ["소고기", "채소", "진밥", "철분"],
    source: "DB"
  },
  {
    title: "닭고기무른밥",
    description: "부드러운 닭고기로 만든 무른밥",
    stage: "LATE",
    cookingTime: 30,
    likeCount: 43,
    ingredients: [
      { name: "닭고기", amount: "30", unit: "g" },
      { name: "감자", amount: "20", unit: "g" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "150", unit: "ml" }
    ],
    allergens: ["닭고기"],
    steps: [
      { text: "닭고기를 삶아서 잘게 찢어주세요", timerSec: 600 },
      { text: "감자, 당근을 잘게 다져주세요", timerSec: 0 },
      { text: "냄비에 물, 감자, 당근을 넣고 끓여주세요", timerSec: 300 },
      { text: "밥과 닭고기를 넣고 약불에서 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["닭고기", "무른밥", "감자"],
    source: "DB"
  },
  {
    title: "참치야채진밥",
    description: "참치와 야채가 어우러진 고소한 진밥",
    stage: "LATE",
    cookingTime: 20,
    likeCount: 38,
    ingredients: [
      { name: "참치", amount: "20", unit: "g" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "참치캔의 기름을 빼고 잘게 부셔주세요", timerSec: 0 },
      { text: "양파, 당근을 잘게 다져주세요", timerSec: 0 },
      { text: "냄비에 채소를 볶다가 참치를 넣어주세요", timerSec: 120 },
      { text: "밥과 물을 넣고 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["참치", "야채", "진밥"],
    source: "DB"
  },
  {
    title: "달걀야채진밥",
    description: "달걀과 채소로 만든 영양 진밥",
    stage: "LATE",
    cookingTime: 20,
    likeCount: 40,
    ingredients: [
      { name: "달걀", amount: "1", unit: "개" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "시금치", amount: "10", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: ["계란"],
    steps: [
      { text: "당근을 잘게 다지고 시금치를 데쳐 잘게 썰어주세요", timerSec: 0 },
      { text: "달걀을 풀어주세요", timerSec: 0 },
      { text: "냄비에 밥, 물, 채소를 넣고 끓여주세요", timerSec: 300 },
      { text: "달걀물을 넣고 저어가며 완성해주세요", timerSec: 120 }
    ],
    tags: ["달걀", "채소", "진밥", "시금치"],
    source: "DB"
  },
  {
    title: "소고기무진밥",
    description: "소고기와 무로 만든 소화 잘 되는 진밥",
    stage: "LATE",
    cookingTime: 30,
    likeCount: 35,
    ingredients: [
      { name: "소고기", amount: "25", unit: "g" },
      { name: "무", amount: "20", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "150", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 잘게 다져주세요", timerSec: 0 },
      { text: "무를 곱게 다져주세요", timerSec: 0 },
      { text: "냄비에 소고기를 볶다가 무를 넣어주세요", timerSec: 180 },
      { text: "밥과 물을 넣고 약불에서 끓여 완성해주세요", timerSec: 600 }
    ],
    tags: ["소고기", "무", "진밥", "소화"],
    source: "DB"
  },

  // === 완료기 (COMPLETE) 13개월~ ===
  {
    title: "소고기볶음밥",
    description: "아기도 잘 먹는 고소한 소고기 볶음밥",
    stage: "COMPLETE",
    cookingTime: 20,
    likeCount: 62,
    ingredients: [
      { name: "소고기", amount: "40", unit: "g" },
      { name: "당근", amount: "15", unit: "g" },
      { name: "양파", amount: "15", unit: "g" },
      { name: "밥", amount: "1/2", unit: "공기" },
      { name: "참기름", amount: "약간", unit: "" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기, 당근, 양파를 잘게 다져주세요", timerSec: 0 },
      { text: "팬에 소고기를 먼저 볶아주세요", timerSec: 180 },
      { text: "당근, 양파를 넣고 함께 볶아주세요", timerSec: 120 },
      { text: "밥을 넣고 잘 섞어가며 볶아주세요", timerSec: 180 },
      { text: "참기름을 살짝 넣고 완성해주세요", timerSec: 0 }
    ],
    tags: ["소고기", "볶음밥", "완료기"],
    source: "DB"
  },
  {
    title: "닭고기리조또",
    description: "부드럽고 크리미한 아기 리조또",
    stage: "COMPLETE",
    cookingTime: 25,
    likeCount: 49,
    ingredients: [
      { name: "닭고기", amount: "40", unit: "g" },
      { name: "양파", amount: "15", unit: "g" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "밥", amount: "1/2", unit: "공기" },
      { name: "우유", amount: "50", unit: "ml" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: ["닭고기", "우유"],
    steps: [
      { text: "닭고기를 잘게 다져 볶아주세요", timerSec: 180 },
      { text: "양파, 당근을 다져 함께 볶아주세요", timerSec: 120 },
      { text: "밥과 물을 넣고 끓여주세요", timerSec: 300 },
      { text: "우유를 넣고 약불에서 저어가며 걸쭉하게 완성해주세요", timerSec: 180 }
    ],
    tags: ["닭고기", "리조또", "크리미"],
    source: "DB"
  },
  {
    title: "채소달걀찜",
    description: "폭신폭신 부드러운 채소 달걀찜",
    stage: "COMPLETE",
    cookingTime: 20,
    likeCount: 44,
    ingredients: [
      { name: "달걀", amount: "2", unit: "개" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "시금치", amount: "10", unit: "g" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: ["계란"],
    steps: [
      { text: "달걀을 잘 풀고 물을 넣어 섞어주세요", timerSec: 0 },
      { text: "당근, 시금치를 잘게 다져주세요", timerSec: 0 },
      { text: "달걀물에 채소를 넣고 섞어주세요", timerSec: 0 },
      { text: "그릇에 담아 찜기에서 10분 쪄주세요", timerSec: 600 },
      { text: "뚜껑 열어 완성을 확인해주세요", timerSec: 0 }
    ],
    tags: ["달걀", "채소", "달걀찜", "부드러운"],
    source: "DB"
  },
  {
    title: "아기 된장국",
    description: "간을 줄인 아기 맞춤 된장국",
    stage: "COMPLETE",
    cookingTime: 20,
    likeCount: 37,
    ingredients: [
      { name: "두부", amount: "30", unit: "g" },
      { name: "애호박", amount: "20", unit: "g" },
      { name: "된장", amount: "1/2", unit: "작은술" },
      { name: "물", amount: "250", unit: "ml" }
    ],
    allergens: ["대두"],
    steps: [
      { text: "두부와 애호박을 작은 크기로 썰어주세요", timerSec: 0 },
      { text: "냄비에 물을 끓여주세요", timerSec: 180 },
      { text: "된장을 풀어 넣어주세요", timerSec: 0 },
      { text: "두부와 애호박을 넣고 5분 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["된장국", "두부", "애호박"],
    source: "DB"
  },
  {
    title: "아기 미역국",
    description: "철분과 칼슘이 풍부한 아기 미역국",
    stage: "COMPLETE",
    cookingTime: 30,
    likeCount: 41,
    ingredients: [
      { name: "소고기", amount: "30", unit: "g" },
      { name: "미역", amount: "5", unit: "g" },
      { name: "참기름", amount: "약간", unit: "" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "미역을 물에 불려 잘게 잘라주세요", timerSec: 600 },
      { text: "소고기를 잘게 다져주세요", timerSec: 0 },
      { text: "냄비에 참기름을 두르고 소고기를 볶아주세요", timerSec: 120 },
      { text: "미역을 넣고 함께 볶아주세요", timerSec: 60 },
      { text: "물을 넣고 15분 끓여 완성해주세요", timerSec: 900 }
    ],
    tags: ["미역국", "소고기", "철분", "칼슘"],
    source: "DB"
  }
];

async function seed() {
  // 기존 레시피 삭제
  console.log("🗑️ 기존 레시피 삭제 중...");
  const existing = await getDocs(collection(db, "recipes"));
  for (const d of existing.docs) {
    await deleteDoc(doc(db, "recipes", d.id));
  }
  console.log(`  ${existing.size}개 삭제 완료\n`);

  // 새 레시피 추가
  console.log("🍼 이유식 레시피 추가 시작...");
  for (const recipe of recipes) {
    await addDoc(collection(db, "recipes"), recipe);
    console.log(`  ✅ [${recipe.stage}] "${recipe.title}" 추가 완료`);
  }
  console.log(`\n🎉 총 ${recipes.length}개 이유식 레시피 추가 완료!`);
  console.log(`  - 초기(EARLY): ${recipes.filter(r => r.stage === "EARLY").length}개`);
  console.log(`  - 중기(MID): ${recipes.filter(r => r.stage === "MID").length}개`);
  console.log(`  - 후기(LATE): ${recipes.filter(r => r.stage === "LATE").length}개`);
  console.log(`  - 완료기(COMPLETE): ${recipes.filter(r => r.stage === "COMPLETE").length}개`);
  process.exit(0);
}

seed().catch(console.error);
