# 얌얌 (YumYum) - AI 이유식 도우미 앱

> 아기의 성장 단계에 맞는 식단을 AI가 자동으로 생성해주는 이유식 관리 앱

🌐 **서비스 URL**: https://yum-yum-e7940.web.app

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 🍼 아기 프로필 | 아기 이름, 생년월일, 알레르기 등록 |
| 📅 AI 식단표 | Gemini AI가 성장 단계별 맞춤 식단 자동 생성 |
| 👩‍🍳 요리 모드 | 단계별 조리법 안내 + 음성 TTS + 타이머 |
| 🔄 개별 메뉴 변경 | 마음에 안 드는 메뉴를 AI로 즉시 교체 |
| 🛒 장보기 목록 | 식단 기반 자동 생성, 냉장고로 바로 추가 |
| 🧊 냉장고 관리 | 재료 등록, 소비기한 D-day 알림 |
| 📓 식사 일기 | 아침/점심/저녁별 식사 기록 |

---

## 기술 스택

```
Frontend:  React 19 + Vite 8 + Tailwind CSS 4
Backend:   Firebase Cloud Functions (Node.js 22, 2nd Gen)
Database:  Firebase Firestore
Auth:      Firebase Authentication (Google 로그인)
Hosting:   Firebase Hosting
AI:        Google Gemini 2.0 Flash + RAG (Firestore 기반 지식 DB)
CI/CD:     GitHub Actions (master push → 자동 Firebase 배포)
```

---

## 프로젝트 구조

```
yum-yum/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx          # 구글 로그인
│   │   ├── HomePage.jsx           # 메인 대시보드
│   │   ├── BabyProfilePage.jsx    # 아기 프로필 관리
│   │   ├── MealSchedulePage.jsx   # AI 식단표 (핵심 기능)
│   │   ├── CookingMode.jsx        # 요리 모드 (TTS, 타이머)
│   │   ├── IngredientsPage.jsx    # 냉장고 재료 관리
│   │   ├── MealLogPage.jsx        # 식사 일기
│   │   └── RecipePage.jsx         # 레시피 페이지
│   ├── hooks/
│   │   └── useAuth.js             # Firebase Auth 커스텀 훅
│   ├── firebase.js                # Firebase 초기화 및 export
│   ├── App.jsx                    # 라우팅 (state 기반)
│   └── main.jsx
│
├── functions/
│   ├── index.js                   # Cloud Function: AI 식단 생성 (Gemini)
│   └── rag.js                     # RAG 모듈: Firestore 지식 DB 검색
│
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions 자동 배포
│
├── seedKnowledgeBase.cjs          # Firestore 이유식 지식 DB 초기 데이터
├── firebase.json                  # Firebase 설정
├── firestore.indexes.json         # Firestore 인덱스
└── .gitignore
```

---

## AI 아키텍처

### Gemini 2.0 Flash + RAG

- **AI 모델**: Google Gemini 2.0 Flash (REST API 직접 호출)
- **RAG**: Firestore `knowledgeBase` 컬렉션에서 이유식 단계별 가이드라인 검색
  - 태그 기반 재료 매칭으로 관련 지식 검색
  - HARD 규칙 (알레르기, 금지 재료) / SOFT 규칙 (권장 사항) 분리
- **LLM-as-a-Judge**: 생성 결과 자동 검증 후 실패 시 1회 재시도
- **Few-Shot**: 식단표/단일 메뉴별 포맷 예시 제공

```
사용자 요청
    ↓
RAG: Firestore에서 단계별 가이드라인 검색
    ↓
Gemini 2.0 Flash로 식단 생성
    ↓
Judge: 알레르기/단계 적합성 검증
    ↓ (실패 시 재시도)
최종 식단 반환
```

---

## CI/CD (자동 배포)

`master` 브랜치에 push되면 GitHub Actions가 자동으로 Firebase에 배포합니다.

```
git push origin master
    ↓
GitHub Actions 트리거
    ↓
npm install → npm run build → firebase deploy
    ↓
https://yum-yum-e7940.web.app 자동 반영 (약 2~3분)
```

### GitHub Secrets 설정 (최초 1회)

| Secret 이름 | 설명 |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase 서비스 계정 키 JSON |

---

## 로컬 개발 환경 설정

### 사전 요구사항
- Node.js 22.x
- Firebase CLI (`npm install -g firebase-tools`)
- Google Gemini API 키 ([https://aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### 1. 저장소 클론

```bash
git clone https://github.com/seong-tae-woong/yum-yum.git
cd yum-yum
```

### 2. 프론트엔드 의존성 설치

```bash
npm install
```

### 3. Firebase 프로젝트 연결

> **주의**: 기존 Firebase 프로젝트(`yum-yum-e7940`)에 연결하려면 프로젝트 소유자에게 접근 권한을 요청하세요.

```bash
firebase login
firebase use yum-yum-e7940
```

### 4. Firebase 설정 파일 교체

`src/firebase.js`의 `firebaseConfig`를 본인 프로젝트의 값으로 교체:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 5. Gemini API 키 설정 (Cloud Functions용)

```bash
cd functions
npm install
firebase functions:secrets:set GEMINI_API_KEY
# 프롬프트에 Gemini API 키 입력 (AIza...로 시작하는 값)
```

### 6. 이유식 지식 DB 초기화 (RAG용)

```bash
node seedKnowledgeBase.cjs
```

### 7. 로컬 개발 서버 실행

```bash
# 프론트엔드
npm run dev

# Cloud Functions 에뮬레이터 (별도 터미널)
firebase emulators:start --only functions,firestore
```

---

## 배포

### GitHub Actions 자동 배포 (권장)

`master` 브랜치에 push하면 자동 배포됩니다.

### 수동 배포

```bash
# 전체 배포 (Hosting + Functions + Firestore)
npm run build
firebase deploy --project yum-yum-e7940

# 프론트엔드만
npm run build
firebase deploy --only hosting

# Functions만
firebase deploy --only functions
```

---

## Firestore 데이터 모델

### `babies` 컬렉션
```json
{
  "userId": "Firebase Auth UID",
  "name": "하율",
  "birthDate": "2025-06-01",
  "gender": "female",
  "allergies": ["달걀", "땅콩"],
  "createdAt": "ISO string"
}
```

### `mealSchedules` 컬렉션
```json
{
  "userId": "string",
  "babyId": "string",
  "stage": "EARLY | MID | LATE | COMPLETE",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "comment": "사용자 요청사항",
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "day": "월",
      "meals": [
        {
          "slot": "아침 | 점심 | 저녁",
          "recipeTitle": "소고기감자죽",
          "ingredients": [{ "name": "소고기", "amount": "50", "unit": "g" }],
          "steps": ["소고기를 삶는다", "..."],
          "reason": "AI 추천 이유"
        }
      ]
    }
  ],
  "shoppingList": [{ "name": "당근", "amount": "1", "unit": "개", "category": "채소" }],
  "tips": "영양사 팁",
  "createdAt": "ISO string"
}
```

### `ingredients` 컬렉션 (냉장고)
```json
{
  "userId": "string",
  "name": "소고기",
  "quantity": "200",
  "unit": "g",
  "category": "채소 | 육류 | 해산물 | 유제품 | 곡류 | 양념 | 기타",
  "expiryDate": "YYYY-MM-DD",
  "status": "ACTIVE | CONSUMED",
  "source": "MANUAL | SHOPPING",
  "addedAt": "ISO string"
}
```

### `mealLogs` 컬렉션 (식사 일기)
```json
{
  "userId": "string",
  "babyId": "string",
  "date": "YYYY-MM-DD",
  "slot": "아침 | 점심 | 저녁",
  "menu": "소고기죽",
  "amount": "반 공기",
  "reaction": "잘 먹음",
  "memo": "메모",
  "createdAt": "ISO string"
}
```

### `knowledgeBase` 컬렉션 (RAG 지식 DB)
```json
{
  "stages": ["EARLY", "MID"],
  "priority": "HARD | SOFT",
  "type": "soft_constraint | nutrition | cooking | texture",
  "tags": ["소고기", "철분"],
  "content": "이유식 가이드라인 내용"
}
```

### `apiUsage` 컬렉션 (일일 사용량 제한)
```
Document ID: "{uid}_{YYYY-MM-DD}"
{
  "count": 3,
  "updatedAt": "ISO string"
}
```

---

## Cloud Functions API

### `generateMealSchedule`

- **URL**: `https://generatemealschedule-kkg6se7orq-du.a.run.app`
- **Method**: POST
- **Auth**: `Authorization: Bearer {Firebase ID Token}`
- **제한**: 사용자당 하루 5회

#### 모드 1: 식단표 전체 생성

```json
// Request
{
  "babyName": "하율",
  "stage": "LATE",
  "stageLabel": "후기 (10~12개월)",
  "mealsPerDay": 3,
  "allergies": ["달걀"],
  "fridgeIngredients": [
    { "name": "소고기", "quantity": "200", "unit": "g", "expiryDate": "2026-04-15" }
  ],
  "startDate": "2026-04-10",
  "endDate": "2026-04-16",
  "comment": "소고기 위주로 만들어줘"
}

// Response
{
  "schedule": [...],
  "shoppingList": [...],
  "tips": "..."
}
```

#### 모드 2: 개별 메뉴 변경

```json
// Request
{
  "mode": "singleMeal",
  "stage": "LATE",
  "stageLabel": "후기 (10~12개월)",
  "allergies": [],
  "slot": "아침",
  "otherMeals": ["소고기야채죽", "두부된장국"],
  "userPrompt": "단백질 풍부한"
}

// Response
{
  "recipeTitle": "닭고기브로콜리리조또",
  "ingredients": [{ "name": "닭고기", "amount": "50", "unit": "g" }],
  "steps": ["닭고기를 삶아서 잘게 찢는다", "..."],
  "reason": "단백질이 풍부한 닭고기를 활용한 메뉴입니다"
}
```

---

## 아기 성장 단계

| 단계 | 월령 | 하루 식사 횟수 | 끼니 구성 |
|------|------|----------------|-----------|
| EARLY | 4~6개월 | 1회 | 아침 |
| MID | 7~9개월 | 2회 | 아침, 저녁 |
| LATE | 10~12개월 | 3회 | 아침, 점심, 저녁 |
| COMPLETE | 13개월~ | 3회 | 아침, 점심, 저녁 |

---

## 라우팅 구조

react-router를 사용하지 않고 `App.jsx`에서 `useState`로 화면 전환을 관리합니다.

```jsx
const [page, setPage] = useState("home")

// page 값에 따라 컴포넌트 렌더링
"home"        → HomePage
"login"       → LoginPage
"baby"        → BabyProfilePage
"schedule"    → MealSchedulePage
"ingredients" → IngredientsPage
"meallog"     → MealLogPage
```

---

## 환경 변수 / 시크릿

| 키 | 위치 | 설명 |
|----|------|------|
| `GEMINI_API_KEY` | Firebase Secret Manager | Google Gemini API 키 |
| `FIREBASE_SERVICE_ACCOUNT` | GitHub Secrets | CI/CD 자동 배포용 서비스 계정 키 |
| Firebase Config | `src/firebase.js` | Firebase 프로젝트 설정 |

> `src/firebase.js`의 `apiKey`는 클라이언트용 식별자입니다. Firebase Security Rules로 접근을 제어하므로 코드에 포함되어도 안전합니다.

---

## 개발 시 주의사항

1. **Cloud Functions 배포 시간**: 빌드+배포에 약 2~3분 소요
2. **AI 응답 파싱**: Gemini가 JSON 외 텍스트를 포함할 수 있어 정규식으로 JSON 추출 처리됨 (`functions/index.js` 참고)
3. **Firestore 인덱스**: `mealSchedules` 컬렉션은 `userId + createdAt` 복합 인덱스 필요 (`firestore.indexes.json` 배포 필요)
4. **CORS**: Cloud Functions에 `cors: true` 설정 (프로덕션에서는 도메인 제한 권장)
5. **식단 날짜 겹침 처리**: 새 식단 생성 시 기존 식단의 겹치는 날짜만 삭제하고 나머지는 유지
6. **RAG 지식 DB**: `seedKnowledgeBase.cjs` 실행 시 Firestore `knowledgeBase` 컬렉션에 이유식 가이드라인 데이터가 입력됨

---

## 향후 개발 계획

- [ ] 레시피 벡터 임베딩 기반 RAG 고도화
- [ ] 푸시 알림 (소비기한 임박, 식사 시간 알림)
- [ ] 사진 첨부 식사 일기
- [ ] 영양 성분 분석 리포트
- [ ] 다국어 지원
