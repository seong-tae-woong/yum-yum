# 얌얌 (YumYum) 프로젝트

## 프로젝트 개요
아기의 성장 단계에 맞는 이유식 식단을 AI가 자동으로 생성해주는 웹 앱.

- **서비스 URL**: https://yum-yum-e7940.web.app
- **GitHub**: https://github.com/seong-tae-woong/yum-yum

## 기술 스택
- **Frontend**: React 19 + Vite 8 + Tailwind CSS 4
- **Backend**: Firebase Cloud Functions (Node.js 22, 2nd Gen)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google 로그인)
- **AI**: Google Gemini 2.5 Flash (Vertex AI REST API 직접 호출, 서비스 계정 자동 인증)
- **RAG**: Firestore `knowledgeBase` 컬렉션 + 태그 기반 매칭
- **CI/CD**: GitHub Actions → master push 시 자동 Firebase 배포

## 핵심 파일 구조
```
functions/
  index.js       # AI 식단 생성 Cloud Function (Gemini 호출, Judge 로직)
  rag.js         # RAG 모듈 (Firestore knowledgeBase 검색, 컨텍스트 빌드)
src/
  pages/
    MealSchedulePage.jsx   # AI 식단표 (핵심 UI)
    CookingMode.jsx        # 요리 모드 (TTS, 타이머)
    IngredientsPage.jsx    # 냉장고 관리
    BabyProfilePage.jsx    # 아기 프로필
    MealLogPage.jsx        # 식사 일기
    HomePage.jsx           # 메인 대시보드
    LoginPage.jsx          # 구글 로그인
  hooks/
    useAuth.js             # Firebase Auth 커스텀 훅
  firebase.js              # Firebase 초기화
  App.jsx                  # 라우팅 (react-router 미사용, useState로 page 관리)
.github/workflows/
  deploy.yml               # GitHub Actions 자동 배포
seedKnowledgeBase.cjs      # Firestore 이유식 지식 DB 시드 데이터
```

## AI 아키텍처
1. RAG: `functions/rag.js`에서 Firestore `knowledgeBase` 검색 → 단계별 가이드라인 추출
2. Gemini 2.5 Flash (Vertex AI)로 식단 생성 (temperature: 식단 0.75 / Judge 0.1)
3. LLM-as-a-Judge로 결과 검증 → 실패 시 1회 재시도
4. 사용자당 하루 5회 제한 (`apiUsage` 컬렉션, KST 자정 기준 리셋)

## 시크릿 / 환경 변수
- `GEMINI_API_KEY`: Firebase Secret Manager에 저장되나 현재 미사용 (Vertex AI 서비스 계정 자동 인증으로 전환)
- `FIREBASE_SERVICE_ACCOUNT`: GitHub Secrets (CI/CD 배포용)
- Firebase Config: `src/firebase.js`에 하드코딩 (클라이언트용 식별자, 보안 무관)

## Firestore 컬렉션
- `babies`: 아기 프로필
- `mealSchedules`: AI 생성 식단표
- `ingredients`: 냉장고 재료
- `mealLogs`: 식사 일기
- `knowledgeBase`: RAG 지식 DB (이유식 가이드라인)
- `apiUsage`: 일일 API 사용량 제한

## 보안 규칙
Firestore: 인증된 사용자만 읽기/쓰기 허용
```js
allow read, write: if request.auth != null;
```

## 개발 시 주의사항
- `functions/package.json`에 `@google/generative-ai` 없음 → Fetch API로 직접 REST 호출
- `.firebaserc` gitignore 처리 → 배포 시 `--project yum-yum-e7940` 명시 필요
- `package-lock.json` gitignore 처리 → CI에서 `npm install` 사용 (`npm ci` 불가)
- App.jsx는 react-router 미사용, `useState`로 page 전환 관리
- RAG 지식 DB 초기화: `node seedKnowledgeBase.cjs`

## Vertex AI 설정 (AI 호출 인프라)
- **엔드포인트**: `https://us-central1-aiplatform.googleapis.com/v1/projects/yum-yum-e7940/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent`
- **인증**: Cloud Functions 서비스 계정 자동 인증 (GCE 메타데이터 서버, API 키 불필요)
- **필수 IAM 역할**: `496837300420-compute@developer.gserviceaccount.com`에 `Vertex AI 사용자` 역할 부여
- **필수 API**: Google Cloud 프로젝트에서 Vertex AI API (`aiplatform.googleapis.com`) 활성화 필요
- **Thinking 비활성화**: `thinkingConfig: { thinkingBudget: 0 }` → JSON 파싱 안정성 확보
- **전환 배경**: Generative Language API 무료 쿼터가 billing 연결 시 계정 전체 0으로 설정됨
