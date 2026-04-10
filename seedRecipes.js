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
  // ========================================
  // === 초기 (EARLY) 4~6개월 - 17개 ===
  // ========================================
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
  {
    title: "당근미음",
    description: "베타카로틴 풍부한 당근 미음",
    stage: "EARLY",
    cookingTime: 25,
    likeCount: 40,
    ingredients: [
      { name: "당근", amount: "30", unit: "g" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "당근을 깨끗이 씻어 껍질을 벗기고 얇게 썰어주세요", timerSec: 0 },
      { text: "쌀을 30분 이상 불려 곱게 갈아주세요", timerSec: 1800 },
      { text: "당근을 푹 삶아 믹서에 곱게 갈아주세요", timerSec: 600 },
      { text: "갈은 쌀과 당근, 물을 넣고 약불에서 저어가며 끓여주세요", timerSec: 600 },
      { text: "체에 걸러 부드러운 미음으로 완성해주세요", timerSec: 0 }
    ],
    tags: ["당근", "미음", "베타카로틴"],
    source: "DB"
  },
  {
    title: "배미음",
    description: "수분 가득 달콤한 배 미음",
    stage: "EARLY",
    cookingTime: 20,
    likeCount: 36,
    ingredients: [
      { name: "배", amount: "1/4", unit: "개" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "배 껍질을 벗기고 씨를 제거해주세요", timerSec: 0 },
      { text: "쌀을 불려 곱게 갈아주세요", timerSec: 0 },
      { text: "배를 강판에 곱게 갈아주세요", timerSec: 0 },
      { text: "갈은 쌀과 물을 넣고 끓이다 갈은 배를 넣어주세요", timerSec: 600 },
      { text: "체에 걸러 완성해주세요", timerSec: 0 }
    ],
    tags: ["배", "미음", "수분"],
    source: "DB"
  },
  {
    title: "브로콜리미음",
    description: "비타민C 풍부한 브로콜리 미음",
    stage: "EARLY",
    cookingTime: 25,
    likeCount: 34,
    ingredients: [
      { name: "브로콜리", amount: "30", unit: "g" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "브로콜리를 작은 송이로 떼어 소금물에 담가 세척해주세요", timerSec: 300 },
      { text: "쌀을 불려 곱게 갈아주세요", timerSec: 0 },
      { text: "브로콜리를 끓는 물에 데쳐 믹서에 곱게 갈아주세요", timerSec: 120 },
      { text: "갈은 쌀과 브로콜리, 물을 넣고 약불에서 끓여주세요", timerSec: 600 },
      { text: "체에 걸러 부드럽게 완성해주세요", timerSec: 0 }
    ],
    tags: ["브로콜리", "미음", "비타민"],
    source: "DB"
  },
  {
    title: "양배추미음",
    description: "위에 좋은 양배추로 만든 순한 미음",
    stage: "EARLY",
    cookingTime: 25,
    likeCount: 32,
    ingredients: [
      { name: "양배추", amount: "30", unit: "g" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "양배추를 깨끗이 씻어 잘게 썰어주세요", timerSec: 0 },
      { text: "쌀을 불려 곱게 갈아주세요", timerSec: 0 },
      { text: "양배추를 푹 삶아 믹서에 곱게 갈아주세요", timerSec: 600 },
      { text: "갈은 쌀과 양배추, 물을 넣고 약불에서 끓여주세요", timerSec: 600 },
      { text: "체에 걸러 완성해주세요", timerSec: 0 }
    ],
    tags: ["양배추", "미음", "소화"],
    source: "DB"
  },
  {
    title: "오이미음",
    description: "시원하고 순한 오이 미음",
    stage: "EARLY",
    cookingTime: 20,
    likeCount: 28,
    ingredients: [
      { name: "오이", amount: "1/3", unit: "개" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "오이 껍질을 벗기고 씨를 제거해주세요", timerSec: 0 },
      { text: "쌀을 불려 곱게 갈아주세요", timerSec: 0 },
      { text: "오이를 강판에 곱게 갈아주세요", timerSec: 0 },
      { text: "갈은 쌀과 물을 넣고 끓이다 오이를 넣어주세요", timerSec: 600 },
      { text: "체에 걸러 완성해주세요", timerSec: 0 }
    ],
    tags: ["오이", "미음", "시원한"],
    source: "DB"
  },
  {
    title: "애호박미음",
    description: "소화가 잘 되는 부드러운 애호박 미음",
    stage: "EARLY",
    cookingTime: 25,
    likeCount: 39,
    ingredients: [
      { name: "애호박", amount: "30", unit: "g" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "애호박 껍질을 벗기고 씨를 제거해주세요", timerSec: 0 },
      { text: "쌀을 불려 곱게 갈아주세요", timerSec: 0 },
      { text: "애호박을 푹 삶아 믹서에 곱게 갈아주세요", timerSec: 600 },
      { text: "갈은 쌀과 애호박, 물을 넣고 약불에서 끓여주세요", timerSec: 600 },
      { text: "체에 걸러 완성해주세요", timerSec: 0 }
    ],
    tags: ["애호박", "미음", "소화"],
    source: "DB"
  },
  {
    title: "바나나미음",
    description: "칼륨 풍부한 달콤한 바나나 미음",
    stage: "EARLY",
    cookingTime: 15,
    likeCount: 44,
    ingredients: [
      { name: "바나나", amount: "1/3", unit: "개" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "쌀을 불려 곱게 갈아주세요", timerSec: 0 },
      { text: "바나나를 포크로 으깬 뒤 믹서에 곱게 갈아주세요", timerSec: 0 },
      { text: "갈은 쌀과 물을 넣고 끓여주세요", timerSec: 600 },
      { text: "바나나를 넣고 저어가며 1분 더 끓여 완성해주세요", timerSec: 60 }
    ],
    tags: ["바나나", "미음", "칼륨"],
    source: "DB"
  },
  {
    title: "찹쌀미음",
    description: "찰기 있는 고소한 찹쌀 미음",
    stage: "EARLY",
    cookingTime: 30,
    likeCount: 33,
    ingredients: [
      { name: "찹쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "찹쌀을 깨끗이 씻어 1시간 이상 불려주세요", timerSec: 3600 },
      { text: "불린 찹쌀을 믹서에 곱게 갈아주세요", timerSec: 0 },
      { text: "냄비에 갈은 찹쌀과 물을 넣고 약불에서 저어가며 끓여주세요", timerSec: 900 },
      { text: "체에 걸러 부드러운 미음으로 완성해주세요", timerSec: 0 }
    ],
    tags: ["찹쌀", "미음", "고소한"],
    source: "DB"
  },
  {
    title: "비타민쌀미음",
    description: "비타민쌀로 만든 영양 가득 미음",
    stage: "EARLY",
    cookingTime: 30,
    likeCount: 30,
    ingredients: [
      { name: "비타민쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "비타민쌀을 깨끗이 씻어 30분 이상 불려주세요", timerSec: 1800 },
      { text: "불린 쌀을 믹서에 곱게 갈아주세요", timerSec: 0 },
      { text: "냄비에 갈은 쌀과 물을 넣고 약불에서 저어가며 끓여주세요", timerSec: 900 },
      { text: "체에 걸러 완성해주세요", timerSec: 0 }
    ],
    tags: ["비타민쌀", "미음", "영양"],
    source: "DB"
  },
  {
    title: "청경채미음",
    description: "칼슘이 풍부한 청경채 미음",
    stage: "EARLY",
    cookingTime: 25,
    likeCount: 27,
    ingredients: [
      { name: "청경채", amount: "20", unit: "g" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "청경채를 깨끗이 씻어 잎만 준비해주세요", timerSec: 0 },
      { text: "쌀을 불려 곱게 갈아주세요", timerSec: 0 },
      { text: "청경채를 끓는 물에 데쳐 믹서에 곱게 갈아주세요", timerSec: 60 },
      { text: "갈은 쌀과 청경채, 물을 넣고 약불에서 끓여주세요", timerSec: 600 },
      { text: "체에 걸러 완성해주세요", timerSec: 0 }
    ],
    tags: ["청경채", "미음", "칼슘"],
    source: "DB"
  },
  {
    title: "소고기미음",
    description: "철분 보충에 좋은 소고기 미음",
    stage: "EARLY",
    cookingTime: 35,
    likeCount: 52,
    ingredients: [
      { name: "소고기", amount: "15", unit: "g" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 찬물에 담가 핏물을 빼주세요", timerSec: 1800 },
      { text: "쌀을 불려 곱게 갈아주세요", timerSec: 0 },
      { text: "소고기를 삶아서 믹서에 곱게 갈아주세요", timerSec: 600 },
      { text: "갈은 쌀과 소고기, 물을 넣고 약불에서 끓여주세요", timerSec: 600 },
      { text: "체에 걸러 부드러운 미음으로 완성해주세요", timerSec: 0 }
    ],
    tags: ["소고기", "미음", "철분"],
    source: "DB"
  },
  {
    title: "콜리플라워미음",
    description: "비타민K 풍부한 콜리플라워 미음",
    stage: "EARLY",
    cookingTime: 25,
    likeCount: 25,
    ingredients: [
      { name: "콜리플라워", amount: "30", unit: "g" },
      { name: "쌀", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "콜리플라워를 작은 송이로 떼어 깨끗이 씻어주세요", timerSec: 0 },
      { text: "쌀을 불려 곱게 갈아주세요", timerSec: 0 },
      { text: "콜리플라워를 푹 삶아 믹서에 곱게 갈아주세요", timerSec: 600 },
      { text: "갈은 쌀과 콜리플라워, 물을 넣고 약불에서 끓여주세요", timerSec: 600 },
      { text: "체에 걸러 완성해주세요", timerSec: 0 }
    ],
    tags: ["콜리플라워", "미음", "비타민K"],
    source: "DB"
  },

  // ========================================
  // === 중기 (MID) 7~9개월 - 17개 ===
  // ========================================
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
  {
    title: "소고기감자죽",
    description: "든든한 소고기와 감자의 조합",
    stage: "MID",
    cookingTime: 35,
    likeCount: 55,
    ingredients: [
      { name: "소고기", amount: "20", unit: "g" },
      { name: "감자", amount: "30", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 찬물에 담가 핏물을 빼주세요", timerSec: 1800 },
      { text: "감자를 깨끗이 씻어 껍질을 벗기고 잘게 다져주세요", timerSec: 0 },
      { text: "소고기를 삶아 잘게 다져주세요", timerSec: 600 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "소고기와 감자를 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["소고기", "감자", "철분", "죽"],
    source: "DB"
  },
  {
    title: "닭고기채소죽",
    description: "닭고기와 여러 채소가 어우러진 죽",
    stage: "MID",
    cookingTime: 30,
    likeCount: 46,
    ingredients: [
      { name: "닭고기", amount: "20", unit: "g" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["닭고기"],
    steps: [
      { text: "닭고기를 삶아 잘게 다져주세요", timerSec: 600 },
      { text: "당근과 양파를 곱게 다져주세요", timerSec: 0 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "닭고기와 채소를 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["닭고기", "채소", "단백질", "죽"],
    source: "DB"
  },
  {
    title: "소고기애호박죽",
    description: "소고기와 부드러운 애호박의 죽",
    stage: "MID",
    cookingTime: 30,
    likeCount: 50,
    ingredients: [
      { name: "소고기", amount: "20", unit: "g" },
      { name: "애호박", amount: "20", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 찬물에 담가 핏물을 빼고 삶아 잘게 다져주세요", timerSec: 2400 },
      { text: "애호박 껍질을 벗기고 곱게 다져주세요", timerSec: 0 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "소고기와 애호박을 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["소고기", "애호박", "철분", "죽"],
    source: "DB"
  },
  {
    title: "소고기미역죽",
    description: "철분과 미네랄이 풍부한 소고기미역죽",
    stage: "MID",
    cookingTime: 35,
    likeCount: 44,
    ingredients: [
      { name: "소고기", amount: "20", unit: "g" },
      { name: "미역", amount: "3", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "미역을 물에 불려 잘게 다져주세요", timerSec: 600 },
      { text: "소고기를 핏물 빼고 삶아 잘게 다져주세요", timerSec: 2400 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "소고기와 미역을 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["소고기", "미역", "철분", "미네랄", "죽"],
    source: "DB"
  },
  {
    title: "닭고기고구마죽",
    description: "달콤한 고구마와 닭고기의 영양 죽",
    stage: "MID",
    cookingTime: 30,
    likeCount: 43,
    ingredients: [
      { name: "닭고기", amount: "20", unit: "g" },
      { name: "고구마", amount: "30", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["닭고기"],
    steps: [
      { text: "닭고기를 삶아 잘게 다져주세요", timerSec: 600 },
      { text: "고구마를 쪄서 으깬 뒤 잘게 다져주세요", timerSec: 600 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "닭고기와 고구마를 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["닭고기", "고구마", "단백질", "죽"],
    source: "DB"
  },
  {
    title: "소고기양배추죽",
    description: "소화에 좋은 양배추와 소고기의 죽",
    stage: "MID",
    cookingTime: 30,
    likeCount: 38,
    ingredients: [
      { name: "소고기", amount: "20", unit: "g" },
      { name: "양배추", amount: "15", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 핏물 빼고 삶아 잘게 다져주세요", timerSec: 2400 },
      { text: "양배추를 데쳐 곱게 다져주세요", timerSec: 60 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "소고기와 양배추를 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["소고기", "양배추", "소화", "죽"],
    source: "DB"
  },
  {
    title: "연어감자죽",
    description: "오메가3 풍부한 연어와 감자의 죽",
    stage: "MID",
    cookingTime: 30,
    likeCount: 47,
    ingredients: [
      { name: "연어", amount: "20", unit: "g" },
      { name: "감자", amount: "25", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "연어를 끓는 물에 삶아 가시를 제거하고 잘게 부셔주세요", timerSec: 300 },
      { text: "감자를 껍질 벗기고 잘게 다져주세요", timerSec: 0 },
      { text: "불린 쌀을 갈아 물, 감자와 함께 끓여주세요", timerSec: 600 },
      { text: "연어를 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["연어", "감자", "오메가3", "죽"],
    source: "DB"
  },
  {
    title: "소고기비트죽",
    description: "철분 가득한 비트와 소고기의 죽",
    stage: "MID",
    cookingTime: 35,
    likeCount: 35,
    ingredients: [
      { name: "소고기", amount: "20", unit: "g" },
      { name: "비트", amount: "15", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 핏물 빼고 삶아 잘게 다져주세요", timerSec: 2400 },
      { text: "비트를 삶아 곱게 다져주세요", timerSec: 600 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "소고기와 비트를 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["소고기", "비트", "철분", "죽"],
    source: "DB"
  },
  {
    title: "닭고기단호박죽",
    description: "달콤한 단호박과 닭고기의 영양 죽",
    stage: "MID",
    cookingTime: 30,
    likeCount: 49,
    ingredients: [
      { name: "닭고기", amount: "20", unit: "g" },
      { name: "단호박", amount: "30", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["닭고기"],
    steps: [
      { text: "닭고기를 삶아 잘게 다져주세요", timerSec: 600 },
      { text: "단호박을 쪄서 으깨주세요", timerSec: 600 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "닭고기와 단호박을 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["닭고기", "단호박", "단백질", "죽"],
    source: "DB"
  },
  {
    title: "소고기시금치죽",
    description: "철분 듬뿍 소고기와 시금치의 죽",
    stage: "MID",
    cookingTime: 30,
    likeCount: 42,
    ingredients: [
      { name: "소고기", amount: "20", unit: "g" },
      { name: "시금치", amount: "10", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 핏물 빼고 삶아 잘게 다져주세요", timerSec: 2400 },
      { text: "시금치를 데쳐 잘게 다져주세요", timerSec: 30 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "소고기와 시금치를 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["소고기", "시금치", "철분", "죽"],
    source: "DB"
  },
  {
    title: "두부당근죽",
    description: "부드러운 두부와 당근의 영양 죽",
    stage: "MID",
    cookingTime: 25,
    likeCount: 37,
    ingredients: [
      { name: "두부", amount: "30", unit: "g" },
      { name: "당근", amount: "15", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["대두"],
    steps: [
      { text: "두부를 으깨주세요", timerSec: 0 },
      { text: "당근을 곱게 다져주세요", timerSec: 0 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "두부와 당근을 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["두부", "당근", "단백질", "죽"],
    source: "DB"
  },
  {
    title: "소고기무죽",
    description: "소화에 좋은 무와 소고기의 죽",
    stage: "MID",
    cookingTime: 35,
    likeCount: 33,
    ingredients: [
      { name: "소고기", amount: "20", unit: "g" },
      { name: "무", amount: "20", unit: "g" },
      { name: "쌀", amount: "2", unit: "큰술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 핏물 빼고 삶아 잘게 다져주세요", timerSec: 2400 },
      { text: "무를 곱게 다져주세요", timerSec: 0 },
      { text: "불린 쌀을 갈아 물과 함께 끓여주세요", timerSec: 600 },
      { text: "소고기와 무를 넣고 약불에서 저어가며 완성해주세요", timerSec: 300 }
    ],
    tags: ["소고기", "무", "소화", "죽"],
    source: "DB"
  },

  // ========================================
  // === 후기 (LATE) 10~12개월 - 16개 ===
  // ========================================
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
  {
    title: "연어채소진밥",
    description: "오메가3 풍부한 연어와 채소의 진밥",
    stage: "LATE",
    cookingTime: 25,
    likeCount: 46,
    ingredients: [
      { name: "연어", amount: "25", unit: "g" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "브로콜리", amount: "15", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "연어를 삶아 가시를 제거하고 잘게 부셔주세요", timerSec: 300 },
      { text: "양파와 브로콜리를 잘게 다져주세요", timerSec: 0 },
      { text: "냄비에 채소를 볶다가 밥과 물을 넣어주세요", timerSec: 120 },
      { text: "연어를 넣고 약불에서 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["연어", "채소", "진밥", "오메가3"],
    source: "DB"
  },
  {
    title: "소고기표고버섯진밥",
    description: "감칠맛 나는 표고버섯과 소고기의 진밥",
    stage: "LATE",
    cookingTime: 30,
    likeCount: 41,
    ingredients: [
      { name: "소고기", amount: "25", unit: "g" },
      { name: "표고버섯", amount: "1", unit: "개" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "150", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 잘게 다져주세요", timerSec: 0 },
      { text: "표고버섯과 당근을 곱게 다져주세요", timerSec: 0 },
      { text: "냄비에 소고기를 볶다가 버섯과 당근을 넣어주세요", timerSec: 180 },
      { text: "밥과 물을 넣고 약불에서 끓여주세요", timerSec: 600 },
      { text: "밥알이 부드러워지면 완성해주세요", timerSec: 0 }
    ],
    tags: ["소고기", "표고버섯", "진밥", "감칠맛"],
    source: "DB"
  },
  {
    title: "닭고기양배추진밥",
    description: "닭고기와 양배추로 만든 순한 진밥",
    stage: "LATE",
    cookingTime: 25,
    likeCount: 37,
    ingredients: [
      { name: "닭고기", amount: "25", unit: "g" },
      { name: "양배추", amount: "15", unit: "g" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: ["닭고기"],
    steps: [
      { text: "닭고기를 삶아 잘게 찢어주세요", timerSec: 600 },
      { text: "양배추와 양파를 잘게 다져주세요", timerSec: 0 },
      { text: "냄비에 채소를 볶다가 밥과 물을 넣어주세요", timerSec: 120 },
      { text: "닭고기를 넣고 약불에서 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["닭고기", "양배추", "진밥"],
    source: "DB"
  },
  {
    title: "소고기콩나물진밥",
    description: "아삭한 콩나물과 소고기의 진밥",
    stage: "LATE",
    cookingTime: 25,
    likeCount: 34,
    ingredients: [
      { name: "소고기", amount: "25", unit: "g" },
      { name: "콩나물", amount: "20", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "150", unit: "ml" }
    ],
    allergens: ["소고기", "대두"],
    steps: [
      { text: "소고기를 잘게 다져주세요", timerSec: 0 },
      { text: "콩나물을 깨끗이 씻어 잘게 잘라주세요", timerSec: 0 },
      { text: "냄비에 소고기를 볶다가 콩나물을 넣어주세요", timerSec: 180 },
      { text: "밥과 물을 넣고 약불에서 끓여 완성해주세요", timerSec: 600 }
    ],
    tags: ["소고기", "콩나물", "진밥"],
    source: "DB"
  },
  {
    title: "두부채소진밥",
    description: "두부와 여러 채소로 만든 부드러운 진밥",
    stage: "LATE",
    cookingTime: 20,
    likeCount: 33,
    ingredients: [
      { name: "두부", amount: "40", unit: "g" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "애호박", amount: "15", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: ["대두"],
    steps: [
      { text: "두부를 작게 깍둑 썰어주세요", timerSec: 0 },
      { text: "당근과 애호박을 잘게 다져주세요", timerSec: 0 },
      { text: "냄비에 채소를 볶다가 두부를 넣어주세요", timerSec: 120 },
      { text: "밥과 물을 넣고 약불에서 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["두부", "채소", "진밥", "단백질"],
    source: "DB"
  },
  {
    title: "소고기비타민진밥",
    description: "비타민쌀로 만든 영양 소고기 진밥",
    stage: "LATE",
    cookingTime: 30,
    likeCount: 31,
    ingredients: [
      { name: "소고기", amount: "25", unit: "g" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "비타민쌀밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "150", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 잘게 다져주세요", timerSec: 0 },
      { text: "당근을 곱게 다져주세요", timerSec: 0 },
      { text: "냄비에 소고기를 볶다가 당근을 넣어주세요", timerSec: 180 },
      { text: "비타민쌀밥과 물을 넣고 약불에서 끓여 완성해주세요", timerSec: 600 }
    ],
    tags: ["소고기", "비타민쌀", "진밥", "영양"],
    source: "DB"
  },
  {
    title: "닭고기감자진밥",
    description: "닭고기와 감자로 만든 든든한 진밥",
    stage: "LATE",
    cookingTime: 25,
    likeCount: 39,
    ingredients: [
      { name: "닭고기", amount: "25", unit: "g" },
      { name: "감자", amount: "25", unit: "g" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: ["닭고기"],
    steps: [
      { text: "닭고기를 삶아 잘게 찢어주세요", timerSec: 600 },
      { text: "감자와 양파를 잘게 다져주세요", timerSec: 0 },
      { text: "냄비에 감자와 양파를 볶다가 밥과 물을 넣어주세요", timerSec: 180 },
      { text: "닭고기를 넣고 약불에서 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["닭고기", "감자", "진밥"],
    source: "DB"
  },
  {
    title: "소고기브로콜리진밥",
    description: "소고기와 브로콜리로 만든 철분 진밥",
    stage: "LATE",
    cookingTime: 25,
    likeCount: 42,
    ingredients: [
      { name: "소고기", amount: "25", unit: "g" },
      { name: "브로콜리", amount: "20", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 잘게 다져주세요", timerSec: 0 },
      { text: "브로콜리를 데쳐 잘게 다져주세요", timerSec: 60 },
      { text: "냄비에 소고기를 볶다가 밥과 물을 넣어주세요", timerSec: 180 },
      { text: "브로콜리를 넣고 약불에서 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["소고기", "브로콜리", "진밥", "철분"],
    source: "DB"
  },
  {
    title: "참치감자진밥",
    description: "참치와 감자로 만든 고소한 진밥",
    stage: "LATE",
    cookingTime: 20,
    likeCount: 36,
    ingredients: [
      { name: "참치", amount: "20", unit: "g" },
      { name: "감자", amount: "25", unit: "g" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: [],
    steps: [
      { text: "참치캔의 기름을 빼고 잘게 부셔주세요", timerSec: 0 },
      { text: "감자와 양파를 잘게 다져주세요", timerSec: 0 },
      { text: "냄비에 감자와 양파를 볶다가 밥과 물을 넣어주세요", timerSec: 180 },
      { text: "참치를 넣고 약불에서 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["참치", "감자", "진밥", "고소한"],
    source: "DB"
  },
  {
    title: "달걀치즈진밥",
    description: "칼슘 풍부한 달걀과 치즈의 진밥",
    stage: "LATE",
    cookingTime: 20,
    likeCount: 48,
    ingredients: [
      { name: "달걀", amount: "1", unit: "개" },
      { name: "아기치즈", amount: "1", unit: "장" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: ["계란", "우유"],
    steps: [
      { text: "양파를 잘게 다져주세요", timerSec: 0 },
      { text: "달걀을 풀어주세요", timerSec: 0 },
      { text: "냄비에 양파를 볶다가 밥과 물을 넣고 끓여주세요", timerSec: 300 },
      { text: "달걀물을 넣고 저어주세요", timerSec: 60 },
      { text: "아기치즈를 잘게 찢어 넣고 녹여 완성해주세요", timerSec: 60 }
    ],
    tags: ["달걀", "치즈", "진밥", "칼슘"],
    source: "DB"
  },
  {
    title: "소고기파프리카진밥",
    description: "비타민C 풍부한 파프리카와 소고기의 진밥",
    stage: "LATE",
    cookingTime: 25,
    likeCount: 32,
    ingredients: [
      { name: "소고기", amount: "25", unit: "g" },
      { name: "파프리카", amount: "20", unit: "g" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "밥", amount: "1/3", unit: "공기" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기를 잘게 다져주세요", timerSec: 0 },
      { text: "파프리카와 양파를 잘게 다져주세요", timerSec: 0 },
      { text: "냄비에 소고기를 볶다가 채소를 넣어주세요", timerSec: 180 },
      { text: "밥과 물을 넣고 약불에서 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["소고기", "파프리카", "진밥", "비타민C"],
    source: "DB"
  },

  // ========================================
  // === 완료기 (COMPLETE) 13개월~ - 16개 ===
  // ========================================
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
    title: "아기된장국",
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
    title: "아기미역국",
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
  },
  {
    title: "소고기카레밥",
    description: "아기용 순한 카레로 만든 카레밥",
    stage: "COMPLETE",
    cookingTime: 30,
    likeCount: 56,
    ingredients: [
      { name: "소고기", amount: "30", unit: "g" },
      { name: "감자", amount: "30", unit: "g" },
      { name: "당근", amount: "15", unit: "g" },
      { name: "양파", amount: "15", unit: "g" },
      { name: "아기카레분말", amount: "1", unit: "큰술" },
      { name: "물", amount: "200", unit: "ml" },
      { name: "밥", amount: "1/2", unit: "공기" }
    ],
    allergens: ["소고기"],
    steps: [
      { text: "소고기, 감자, 당근, 양파를 작게 깍둑 썰어주세요", timerSec: 0 },
      { text: "냄비에 소고기를 볶다가 채소를 넣어주세요", timerSec: 180 },
      { text: "물을 넣고 채소가 부드러워질 때까지 끓여주세요", timerSec: 600 },
      { text: "아기카레분말을 넣고 저어가며 걸쭉하게 끓여주세요", timerSec: 180 },
      { text: "밥 위에 카레를 얹어 완성해주세요", timerSec: 0 }
    ],
    tags: ["소고기", "카레", "감자", "완료기"],
    source: "DB"
  },
  {
    title: "치즈달걀볶음밥",
    description: "고소한 치즈와 달걀의 볶음밥",
    stage: "COMPLETE",
    cookingTime: 15,
    likeCount: 58,
    ingredients: [
      { name: "달걀", amount: "1", unit: "개" },
      { name: "아기치즈", amount: "1", unit: "장" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "밥", amount: "1/2", unit: "공기" },
      { name: "식용유", amount: "약간", unit: "" }
    ],
    allergens: ["계란", "우유"],
    steps: [
      { text: "양파를 잘게 다져주세요", timerSec: 0 },
      { text: "달걀을 풀어주세요", timerSec: 0 },
      { text: "팬에 기름을 두르고 달걀을 스크램블 해주세요", timerSec: 60 },
      { text: "양파와 밥을 넣고 함께 볶아주세요", timerSec: 180 },
      { text: "아기치즈를 잘게 찢어 넣고 녹여 완성해주세요", timerSec: 60 }
    ],
    tags: ["달걀", "치즈", "볶음밥", "칼슘"],
    source: "DB"
  },
  {
    title: "닭고기채소덮밥",
    description: "닭고기와 채소를 올린 영양 덮밥",
    stage: "COMPLETE",
    cookingTime: 25,
    likeCount: 45,
    ingredients: [
      { name: "닭고기", amount: "40", unit: "g" },
      { name: "애호박", amount: "20", unit: "g" },
      { name: "당근", amount: "15", unit: "g" },
      { name: "간장", amount: "1/4", unit: "작은술" },
      { name: "밥", amount: "1/2", unit: "공기" },
      { name: "물", amount: "50", unit: "ml" }
    ],
    allergens: ["닭고기", "대두"],
    steps: [
      { text: "닭고기를 잘게 다져주세요", timerSec: 0 },
      { text: "애호박과 당근을 작게 깍둑 썰어주세요", timerSec: 0 },
      { text: "팬에 닭고기를 볶다가 채소를 넣어주세요", timerSec: 180 },
      { text: "물과 간장을 넣고 졸여주세요", timerSec: 180 },
      { text: "밥 위에 얹어 완성해주세요", timerSec: 0 }
    ],
    tags: ["닭고기", "채소", "덮밥", "완료기"],
    source: "DB"
  },
  {
    title: "두부스테이크",
    description: "바삭하게 구운 아기용 두부 스테이크",
    stage: "COMPLETE",
    cookingTime: 15,
    likeCount: 51,
    ingredients: [
      { name: "두부", amount: "100", unit: "g" },
      { name: "달걀", amount: "1", unit: "개" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "식용유", amount: "약간", unit: "" }
    ],
    allergens: ["대두", "계란"],
    steps: [
      { text: "두부를 으깨고 당근을 곱게 다져주세요", timerSec: 0 },
      { text: "으깬 두부에 달걀과 당근을 넣고 섞어주세요", timerSec: 0 },
      { text: "동그란 모양으로 빚어주세요", timerSec: 0 },
      { text: "팬에 기름을 두르고 앞뒤로 노릇하게 구워주세요", timerSec: 360 }
    ],
    tags: ["두부", "스테이크", "단백질", "핑거푸드"],
    source: "DB"
  },
  {
    title: "아기잡채밥",
    description: "당면 없이 만든 아기용 잡채밥",
    stage: "COMPLETE",
    cookingTime: 25,
    likeCount: 43,
    ingredients: [
      { name: "소고기", amount: "30", unit: "g" },
      { name: "시금치", amount: "15", unit: "g" },
      { name: "당근", amount: "15", unit: "g" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "간장", amount: "1/4", unit: "작은술" },
      { name: "참기름", amount: "약간", unit: "" },
      { name: "밥", amount: "1/2", unit: "공기" }
    ],
    allergens: ["소고기", "대두"],
    steps: [
      { text: "소고기를 잘게 다져 간장에 재워주세요", timerSec: 300 },
      { text: "시금치를 데쳐 잘게 썰고, 당근과 양파를 다져주세요", timerSec: 0 },
      { text: "팬에 소고기를 볶다가 채소를 넣어주세요", timerSec: 180 },
      { text: "밥을 넣고 참기름을 두르고 섞어 완성해주세요", timerSec: 120 }
    ],
    tags: ["소고기", "잡채밥", "시금치", "완료기"],
    source: "DB"
  },
  {
    title: "소고기감자조림",
    description: "달콤 짭조름한 아기 소고기감자조림",
    stage: "COMPLETE",
    cookingTime: 25,
    likeCount: 40,
    ingredients: [
      { name: "소고기", amount: "40", unit: "g" },
      { name: "감자", amount: "50", unit: "g" },
      { name: "간장", amount: "1/2", unit: "작은술" },
      { name: "물", amount: "100", unit: "ml" }
    ],
    allergens: ["소고기", "대두"],
    steps: [
      { text: "소고기를 한입 크기로 잘라주세요", timerSec: 0 },
      { text: "감자를 작게 깍둑 썰어주세요", timerSec: 0 },
      { text: "냄비에 소고기를 볶다가 감자와 물을 넣어주세요", timerSec: 180 },
      { text: "간장을 넣고 약불에서 감자가 익을 때까지 조려주세요", timerSec: 600 }
    ],
    tags: ["소고기", "감자", "조림", "반찬"],
    source: "DB"
  },
  {
    title: "닭고기미트볼",
    description: "한입 크기 아기용 닭고기 미트볼",
    stage: "COMPLETE",
    cookingTime: 25,
    likeCount: 54,
    ingredients: [
      { name: "닭고기(다진것)", amount: "80", unit: "g" },
      { name: "양파", amount: "15", unit: "g" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "달걀", amount: "1/2", unit: "개" },
      { name: "식용유", amount: "약간", unit: "" }
    ],
    allergens: ["닭고기", "계란"],
    steps: [
      { text: "양파와 당근을 곱게 다져주세요", timerSec: 0 },
      { text: "다진 닭고기에 채소와 달걀을 넣고 잘 섞어주세요", timerSec: 0 },
      { text: "한입 크기로 동글동글하게 빚어주세요", timerSec: 0 },
      { text: "팬에 기름을 두르고 굴려가며 골고루 익혀주세요", timerSec: 480 }
    ],
    tags: ["닭고기", "미트볼", "핑거푸드", "단백질"],
    source: "DB"
  },
  {
    title: "연어주먹밥",
    description: "오메가3 풍부한 아기 연어 주먹밥",
    stage: "COMPLETE",
    cookingTime: 15,
    likeCount: 50,
    ingredients: [
      { name: "연어", amount: "30", unit: "g" },
      { name: "밥", amount: "1/2", unit: "공기" },
      { name: "참기름", amount: "약간", unit: "" },
      { name: "깨", amount: "약간", unit: "" }
    ],
    allergens: [],
    steps: [
      { text: "연어를 삶아 가시를 제거하고 잘게 부셔주세요", timerSec: 300 },
      { text: "밥에 연어와 참기름, 깨를 넣고 골고루 섞어주세요", timerSec: 0 },
      { text: "한입 크기로 동글동글 주먹밥을 만들어주세요", timerSec: 0 }
    ],
    tags: ["연어", "주먹밥", "오메가3", "핑거푸드"],
    source: "DB"
  },
  {
    title: "아기수제비",
    description: "부드러운 아기 맞춤 수제비",
    stage: "COMPLETE",
    cookingTime: 30,
    likeCount: 38,
    ingredients: [
      { name: "밀가루", amount: "50", unit: "g" },
      { name: "감자", amount: "30", unit: "g" },
      { name: "애호박", amount: "20", unit: "g" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["밀"],
    steps: [
      { text: "밀가루에 물을 넣고 반죽하여 30분 휴지해주세요", timerSec: 1800 },
      { text: "감자, 애호박, 당근을 작게 썰어주세요", timerSec: 0 },
      { text: "냄비에 물과 감자를 넣고 끓여주세요", timerSec: 300 },
      { text: "반죽을 얇게 뜯어 넣고 채소를 넣어주세요", timerSec: 0 },
      { text: "수제비가 떠오르면 2분 더 끓여 완성해주세요", timerSec: 300 }
    ],
    tags: ["수제비", "밀가루", "채소", "국"],
    source: "DB"
  },
  {
    title: "소고기우동",
    description: "부드러운 면발의 아기 소고기 우동",
    stage: "COMPLETE",
    cookingTime: 20,
    likeCount: 47,
    ingredients: [
      { name: "아기우동면", amount: "50", unit: "g" },
      { name: "소고기", amount: "30", unit: "g" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "애호박", amount: "15", unit: "g" },
      { name: "간장", amount: "1/4", unit: "작은술" },
      { name: "물", amount: "300", unit: "ml" }
    ],
    allergens: ["소고기", "밀", "대두"],
    steps: [
      { text: "우동면을 삶아 짧게 잘라주세요", timerSec: 300 },
      { text: "소고기와 채소를 잘게 다져주세요", timerSec: 0 },
      { text: "냄비에 소고기를 볶다가 물과 채소를 넣어주세요", timerSec: 180 },
      { text: "간장으로 살짝 간하고 면을 넣어 완성해주세요", timerSec: 120 }
    ],
    tags: ["소고기", "우동", "면", "완료기"],
    source: "DB"
  },
  {
    title: "새우볶음밥",
    description: "새우의 감칠맛이 가득한 볶음밥",
    stage: "COMPLETE",
    cookingTime: 15,
    likeCount: 44,
    ingredients: [
      { name: "새우", amount: "30", unit: "g" },
      { name: "달걀", amount: "1", unit: "개" },
      { name: "양파", amount: "10", unit: "g" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "밥", amount: "1/2", unit: "공기" },
      { name: "식용유", amount: "약간", unit: "" }
    ],
    allergens: ["새우", "계란"],
    steps: [
      { text: "새우 껍질을 벗기고 내장을 제거한 뒤 잘게 다져주세요", timerSec: 0 },
      { text: "양파와 당근을 잘게 다져주세요", timerSec: 0 },
      { text: "팬에 기름을 두르고 달걀을 스크램블 해주세요", timerSec: 60 },
      { text: "새우와 채소를 넣고 볶아주세요", timerSec: 120 },
      { text: "밥을 넣고 잘 섞어 볶아 완성해주세요", timerSec: 180 }
    ],
    tags: ["새우", "볶음밥", "달걀", "완료기"],
    source: "DB"
  },

  // ========================================
  // === 간식/핑거푸드 (SNACK) - 12개 ===
  // ========================================
  {
    title: "아기과자",
    description: "밀가루와 버터로 만든 간단한 아기 과자",
    stage: "SNACK",
    cookingTime: 30,
    likeCount: 60,
    ingredients: [
      { name: "밀가루", amount: "50", unit: "g" },
      { name: "버터", amount: "10", unit: "g" },
      { name: "달걀노른자", amount: "1", unit: "개분" }
    ],
    allergens: ["밀", "계란", "우유"],
    steps: [
      { text: "밀가루에 녹인 버터와 달걀노른자를 넣고 반죽해주세요", timerSec: 0 },
      { text: "반죽을 밀대로 얇게 밀어주세요", timerSec: 0 },
      { text: "쿠키틀로 모양을 찍어주세요", timerSec: 0 },
      { text: "170도로 예열한 오븐에서 12분 구워주세요", timerSec: 720 },
      { text: "식힌 후 완성해주세요", timerSec: 0 }
    ],
    tags: ["과자", "간식", "밀가루", "핑거푸드"],
    source: "DB"
  },
  {
    title: "고구마스틱",
    description: "오븐에 구운 바삭한 고구마 스틱",
    stage: "SNACK",
    cookingTime: 35,
    likeCount: 55,
    ingredients: [
      { name: "고구마", amount: "1", unit: "개" },
      { name: "올리브오일", amount: "약간", unit: "" }
    ],
    allergens: [],
    steps: [
      { text: "고구마를 깨끗이 씻어 껍질을 벗기고 스틱 모양으로 잘라주세요", timerSec: 0 },
      { text: "올리브오일을 살짝 발라주세요", timerSec: 0 },
      { text: "180도로 예열한 오븐에서 25분 구워주세요", timerSec: 1500 },
      { text: "식힌 후 완성해주세요", timerSec: 0 }
    ],
    tags: ["고구마", "스틱", "간식", "핑거푸드"],
    source: "DB"
  },
  {
    title: "바나나팬케이크",
    description: "바나나로 만든 달콤한 아기 팬케이크",
    stage: "SNACK",
    cookingTime: 15,
    likeCount: 63,
    ingredients: [
      { name: "바나나", amount: "1", unit: "개" },
      { name: "달걀", amount: "1", unit: "개" },
      { name: "밀가루", amount: "2", unit: "큰술" },
      { name: "식용유", amount: "약간", unit: "" }
    ],
    allergens: ["계란", "밀"],
    steps: [
      { text: "바나나를 포크로 으깨주세요", timerSec: 0 },
      { text: "으깬 바나나에 달걀과 밀가루를 넣고 섞어주세요", timerSec: 0 },
      { text: "팬에 기름을 두르고 반죽을 작게 떠서 올려주세요", timerSec: 0 },
      { text: "약불에서 앞뒤로 노릇하게 구워주세요", timerSec: 240 }
    ],
    tags: ["바나나", "팬케이크", "간식", "핑거푸드"],
    source: "DB"
  },
  {
    title: "감자치즈볼",
    description: "감자와 치즈로 만든 고소한 간식",
    stage: "SNACK",
    cookingTime: 25,
    likeCount: 52,
    ingredients: [
      { name: "감자", amount: "1", unit: "개" },
      { name: "아기치즈", amount: "1", unit: "장" },
      { name: "식용유", amount: "약간", unit: "" }
    ],
    allergens: ["우유"],
    steps: [
      { text: "감자를 삶아 으깨주세요", timerSec: 900 },
      { text: "아기치즈를 잘게 찢어 으깬 감자에 넣고 섞어주세요", timerSec: 0 },
      { text: "한입 크기로 동글동글 빚어주세요", timerSec: 0 },
      { text: "팬에 기름을 두르고 굴려가며 노릇하게 구워주세요", timerSec: 300 }
    ],
    tags: ["감자", "치즈", "간식", "핑거푸드"],
    source: "DB"
  },
  {
    title: "두부너겟",
    description: "부드러운 두부로 만든 건강한 너겟",
    stage: "SNACK",
    cookingTime: 20,
    likeCount: 48,
    ingredients: [
      { name: "두부", amount: "100", unit: "g" },
      { name: "당근", amount: "10", unit: "g" },
      { name: "달걀", amount: "1/2", unit: "개" },
      { name: "빵가루", amount: "2", unit: "큰술" },
      { name: "식용유", amount: "약간", unit: "" }
    ],
    allergens: ["대두", "계란", "밀"],
    steps: [
      { text: "두부를 으깨고 물기를 짜주세요", timerSec: 0 },
      { text: "당근을 곱게 다져 두부에 달걀과 함께 섞어주세요", timerSec: 0 },
      { text: "한입 크기로 만들어 빵가루를 묻혀주세요", timerSec: 0 },
      { text: "팬에 기름을 두르고 앞뒤로 노릇하게 구워주세요", timerSec: 360 }
    ],
    tags: ["두부", "너겟", "간식", "핑거푸드"],
    source: "DB"
  },
  {
    title: "아기떡",
    description: "쌀가루로 만든 부드러운 아기 떡",
    stage: "SNACK",
    cookingTime: 25,
    likeCount: 39,
    ingredients: [
      { name: "쌀가루", amount: "50", unit: "g" },
      { name: "단호박", amount: "30", unit: "g" },
      { name: "물", amount: "2", unit: "큰술" }
    ],
    allergens: [],
    steps: [
      { text: "단호박을 쪄서 으깨주세요", timerSec: 600 },
      { text: "쌀가루에 으깬 단호박과 물을 넣고 반죽해주세요", timerSec: 0 },
      { text: "한입 크기로 빚어주세요", timerSec: 0 },
      { text: "찜기에서 15분 쪄주세요", timerSec: 900 },
      { text: "식힌 후 완성해주세요", timerSec: 0 }
    ],
    tags: ["떡", "쌀가루", "단호박", "간식"],
    source: "DB"
  },
  {
    title: "채소머핀",
    description: "채소가 들어간 건강한 아기 머핀",
    stage: "SNACK",
    cookingTime: 30,
    likeCount: 42,
    ingredients: [
      { name: "밀가루", amount: "50", unit: "g" },
      { name: "달걀", amount: "1", unit: "개" },
      { name: "당근", amount: "15", unit: "g" },
      { name: "시금치", amount: "10", unit: "g" },
      { name: "우유", amount: "30", unit: "ml" },
      { name: "버터", amount: "10", unit: "g" }
    ],
    allergens: ["밀", "계란", "우유"],
    steps: [
      { text: "당근을 곱게 갈고 시금치를 데쳐 잘게 다져주세요", timerSec: 0 },
      { text: "달걀, 우유, 녹인 버터를 잘 섞어주세요", timerSec: 0 },
      { text: "밀가루와 채소를 넣고 골고루 섞어주세요", timerSec: 0 },
      { text: "머핀틀에 반죽을 나눠 담아주세요", timerSec: 0 },
      { text: "170도로 예열한 오븐에서 15분 구워주세요", timerSec: 900 }
    ],
    tags: ["머핀", "채소", "간식", "당근"],
    source: "DB"
  },
  {
    title: "고구마볼",
    description: "달콤한 고구마로 만든 동그란 간식",
    stage: "SNACK",
    cookingTime: 25,
    likeCount: 46,
    ingredients: [
      { name: "고구마", amount: "1", unit: "개" },
      { name: "쌀가루", amount: "1", unit: "큰술" },
      { name: "식용유", amount: "약간", unit: "" }
    ],
    allergens: [],
    steps: [
      { text: "고구마를 쪄서 으깨주세요", timerSec: 900 },
      { text: "으깬 고구마에 쌀가루를 넣고 반죽해주세요", timerSec: 0 },
      { text: "한입 크기로 동글동글 빚어주세요", timerSec: 0 },
      { text: "팬에 기름을 살짝 두르고 굴려가며 구워주세요", timerSec: 300 }
    ],
    tags: ["고구마", "볼", "간식", "핑거푸드"],
    source: "DB"
  },
  {
    title: "단호박경단",
    description: "예쁜 노란색 단호박 경단",
    stage: "SNACK",
    cookingTime: 30,
    likeCount: 41,
    ingredients: [
      { name: "찹쌀가루", amount: "50", unit: "g" },
      { name: "단호박", amount: "40", unit: "g" },
      { name: "물", amount: "1", unit: "큰술" }
    ],
    allergens: [],
    steps: [
      { text: "단호박을 쪄서 곱게 으깨주세요", timerSec: 600 },
      { text: "찹쌀가루에 으깬 단호박과 물을 넣고 반죽해주세요", timerSec: 0 },
      { text: "한입 크기로 동글동글 빚어주세요", timerSec: 0 },
      { text: "끓는 물에 넣고 떠오르면 1분 더 삶아주세요", timerSec: 300 },
      { text: "찬물에 헹궈 완성해주세요", timerSec: 0 }
    ],
    tags: ["단호박", "경단", "간식", "찹쌀"],
    source: "DB"
  },
  {
    title: "사과칩",
    description: "오븐에 구운 바삭한 사과칩",
    stage: "SNACK",
    cookingTime: 60,
    likeCount: 37,
    ingredients: [
      { name: "사과", amount: "1", unit: "개" }
    ],
    allergens: [],
    steps: [
      { text: "사과를 깨끗이 씻어 씨를 제거하고 아주 얇게 슬라이스해주세요", timerSec: 0 },
      { text: "오븐 트레이에 겹치지 않게 펼쳐주세요", timerSec: 0 },
      { text: "100도로 예열한 오븐에서 50분 구워주세요", timerSec: 3000 },
      { text: "완전히 식혀 바삭해지면 완성해주세요", timerSec: 0 }
    ],
    tags: ["사과", "칩", "간식", "무설탕"],
    source: "DB"
  },
  {
    title: "바나나오트밀쿠키",
    description: "바나나와 오트밀로 만든 건강 쿠키",
    stage: "SNACK",
    cookingTime: 25,
    likeCount: 50,
    ingredients: [
      { name: "바나나", amount: "1", unit: "개" },
      { name: "오트밀", amount: "50", unit: "g" },
      { name: "달걀", amount: "1/2", unit: "개" }
    ],
    allergens: ["계란"],
    steps: [
      { text: "바나나를 포크로 곱게 으깨주세요", timerSec: 0 },
      { text: "오트밀과 달걀을 넣고 골고루 섞어주세요", timerSec: 0 },
      { text: "한 스푼씩 떠서 오븐 트레이에 납작하게 올려주세요", timerSec: 0 },
      { text: "170도로 예열한 오븐에서 15분 구워주세요", timerSec: 900 },
      { text: "식힌 후 완성해주세요", timerSec: 0 }
    ],
    tags: ["바나나", "오트밀", "쿠키", "간식"],
    source: "DB"
  },
  {
    title: "치즈스틱",
    description: "고소한 치즈가 쭉 늘어나는 치즈스틱",
    stage: "SNACK",
    cookingTime: 20,
    likeCount: 57,
    ingredients: [
      { name: "모짜렐라치즈", amount: "50", unit: "g" },
      { name: "밀가루", amount: "2", unit: "큰술" },
      { name: "달걀", amount: "1", unit: "개" },
      { name: "빵가루", amount: "3", unit: "큰술" },
      { name: "식용유", amount: "약간", unit: "" }
    ],
    allergens: ["우유", "밀", "계란"],
    steps: [
      { text: "모짜렐라치즈를 스틱 모양으로 잘라주세요", timerSec: 0 },
      { text: "밀가루, 풀어놓은 달걀, 빵가루 순서로 옷을 입혀주세요", timerSec: 0 },
      { text: "냉동실에서 10분 굳혀주세요", timerSec: 600 },
      { text: "팬에 기름을 넉넉히 두르고 노릇하게 튀겨주세요", timerSec: 180 }
    ],
    tags: ["치즈", "스틱", "간식", "핑거푸드"],
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
  console.log(`  - 간식(SNACK): ${recipes.filter(r => r.stage === "SNACK").length}개`);
  process.exit(0);
}

seed().catch(console.error);
