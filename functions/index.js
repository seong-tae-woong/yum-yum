import { onRequest } from "firebase-functions/v2/https"
import { defineSecret } from "firebase-functions/params"
import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import Anthropic from "@anthropic-ai/sdk"

initializeApp()
const claudeApiKey = defineSecret("CLAUDE_API_KEY")
const firestore = getFirestore()

export const generateMealSchedule = onRequest(
  { secrets: [claudeApiKey], region: "asia-northeast3", timeoutSeconds: 120, cors: true, invoker: "public" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" })
      return
    }

    // Firebase Auth 토큰 검증
    const authHeader = req.headers.authorization || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null
    if (!token) {
      res.status(401).json({ error: "로그인이 필요합니다." })
      return
    }

    let uid
    try {
      const decoded = await getAuth().verifyIdToken(token)
      uid = decoded.uid
    } catch (e) {
      res.status(401).json({ error: "인증이 유효하지 않습니다." })
      return
    }

    // 하루 5회 제한 체크
    const today = new Date().toISOString().split("T")[0]
    const usageRef = firestore.collection("apiUsage").doc(`${uid}_${today}`)
    const usageDoc = await usageRef.get()
    const currentCount = usageDoc.exists ? usageDoc.data().count : 0

    if (currentCount >= 5) {
      res.status(429).json({ error: "오늘 식단표 생성 횟수(5회)를 모두 사용했어요. 내일 다시 시도해주세요!" })
      return
    }

    const { babyName, stage, stageLabel, mealsPerDay, allergies, fridgeIngredients, startDate, endDate, comment, mode, slot, otherMeals, userPrompt } = req.body

    // ===== 단일 메뉴 변경 모드 =====
    if (mode === "singleMeal") {
      if (!stage || !slot) {
        res.status(400).json({ error: "필수 데이터가 누락되었습니다." })
        return
      }

      const stageGuide = {
        EARLY: "미음, 퓨레 형태. 아주 부드럽고 묽게.",
        MID: "다진 이유식, 죽 형태. 2~3가지 재료 조합.",
        LATE: "무른밥 이유식. 다진 반찬. 다양한 재료.",
        COMPLETE: "진밥/일반식. 어른 식사와 비슷하지만 간을 약하게."
      }

      const allergyText = allergies && allergies.length > 0 ? allergies.join(", ") : "없음"
      const otherText = otherMeals && otherMeals.length > 0 ? otherMeals.join(", ") : "없음"
      const userReq = userPrompt ? `\n\n사용자 요청: ${userPrompt}` : ""

      const singlePrompt = `당신은 이유식 전문 영양사입니다.

아기 정보:
- 단계: ${stage} (${stageLabel})
- 알레르기: ${allergyText}

이유식 단계 가이드: ${stageGuide[stage] || stageGuide.LATE}

${slot} 메뉴를 새로 1개만 만들어주세요.

같은 날 다른 끼니 메뉴: ${otherText}
(위 메뉴와 겹치지 않게 해주세요)${userReq}

규칙:
1. 아기의 이유식 단계에 적합한 레시피를 만들어주세요
2. 재료와 간단한 조리법(3~4단계)을 포함하세요
3. 알레르기 재료는 절대 사용하지 마세요

반드시 아래 JSON 형식으로만 응답하세요:
{
  "recipeTitle": "레시피 제목",
  "ingredients": [{ "name": "재료명", "amount": "수량", "unit": "단위" }],
  "steps": ["1단계 설명", "2단계 설명", "3단계 설명"],
  "reason": "추천 이유 한줄"
}`

      try {
        const client = new Anthropic({ apiKey: claudeApiKey.value() })
        const message = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          messages: [{ role: "user", content: singlePrompt }]
        })

        const text = message.content[0].text
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error("JSON not found")
        const result = JSON.parse(jsonMatch[0])

        // 사용량 카운트 (단일 변경도 카운트)
        await usageRef.set({ count: currentCount + 1, updatedAt: new Date().toISOString() }, { merge: true })

        res.json(result)
      } catch (e) {
        console.error("Single meal error:", e)
        res.status(500).json({ error: "메뉴 생성에 실패했습니다." })
      }
      return
    }

    // ===== 전체 식단 생성 모드 =====
    if (!stage || !startDate || !endDate) {
      res.status(400).json({ error: "필수 데이터가 누락되었습니다." })
      return
    }

    // 날짜 범위 계산
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dayCount = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1

    if (dayCount < 1 || dayCount > 14) {
      res.status(400).json({ error: "기간은 1일~14일 사이로 선택해주세요." })
      return
    }

    const dates = []
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"]
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      dates.push({ date: d.toISOString().split("T")[0], day: dayNames[d.getDay()] })
    }

    const mealSlots = {
      EARLY: ["아침"],
      MID: ["아침", "저녁"],
      LATE: ["아침", "점심", "저녁"],
      COMPLETE: ["아침", "점심", "저녁"]
    }

    const fridgeText = fridgeIngredients && fridgeIngredients.length > 0
      ? fridgeIngredients.map(ing => `- ${ing.name} (${ing.quantity}${ing.unit}, 유통기한: ${ing.expiryDate})`).join("\n")
      : "- 냉장고에 재료가 없습니다"

    const allergyText = allergies && allergies.length > 0
      ? allergies.join(", ")
      : "없음"

    const slots = mealSlots[stage] || ["아침", "점심", "저녁"]

    const dateListText = dates.map(d => `${d.date} (${d.day})`).join(", ")

    const commentText = comment && comment.trim()
      ? `\n\n사용자 요청사항:\n${comment.trim()}`
      : ""

    const stageGuide = {
      EARLY: "미음, 퓨레 형태. 쌀미음, 감자퓨레, 고구마퓨레, 애호박미음, 브로콜리퓨레 등. 한 가지 재료씩 시작. 아주 부드럽고 묽게.",
      MID: "다진 이유식. 죽 형태. 소고기죽, 닭가슴살야채죽, 연두부달걀죽, 시금치감자죽 등. 2~3가지 재료 조합. 약간의 알갱이 가능.",
      LATE: "무른밥 이유식. 진밥에 다진 반찬. 소고기무른밥, 연어야채밥, 닭고기채소볶음밥, 두부스테이크 등. 다양한 재료 조합. 손으로 잡아먹는 핑거푸드도 가능.",
      COMPLETE: "진밥/일반식에 가까운 유아식. 소고기덮밥, 치즈오므라이스, 닭가슴살볶음밥, 미니햄버그스테이크 등. 어른 식사와 비슷하지만 간을 약하게."
    }

    const prompt = `당신은 이유식 전문 영양사입니다. 아기에게 맞는 새로운 레시피를 직접 만들어주세요.

아기 정보:
- 이름: ${babyName || "우리 아기"}
- 단계: ${stage} (${stageLabel})
- 알레르기: ${allergyText}
- 하루 식사 횟수: ${mealsPerDay}회
- 끼니: ${slots.join(", ")}

이유식 단계 가이드:
${stageGuide[stage] || stageGuide.LATE}

냉장고 재료 (유통기한):
${fridgeText}

위 정보를 바탕으로 아래 기간의 이유식 식단표를 직접 창작해주세요.
기간: ${dateListText} (총 ${dayCount}일)${commentText}

규칙:
1. 아기의 이유식 단계에 적합한 새로운 레시피를 직접 만들어주세요
2. 각 레시피에 재료와 간단한 조리법(3~4단계)을 포함하세요
3. 냉장고에 있는 재료를 우선 활용하세요 (유통기한 임박 순)
4. 알레르기 재료는 절대 사용하지 마세요
5. 같은 재료를 여러 끼니에 활용해도 되지만, 매 끼니 레시피 이름과 조리법은 다르게 만들어주세요
6. 다양한 재료 조합과 영양 균형을 고려하되, 냉장고 재료는 여러 끼니에 걸쳐 반복 사용해도 됩니다
7. 장보기 목록은 냉장고에 없는 재료만 포함하세요
8. 레시피 이름은 아기 엄마가 이해하기 쉽게 지어주세요

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:
{
  "schedule": [
    {
      "day": "${dates[0].day}",
      "date": "${dates[0].date}",
      "meals": [
        {
          "slot": "아침",
          "recipeTitle": "레시피 제목",
          "ingredients": [
            { "name": "재료명", "amount": "수량", "unit": "단위" }
          ],
          "steps": ["1단계 설명", "2단계 설명", "3단계 설명"],
          "reason": "선택 이유 한줄"
        }
      ]
    }
  ],
  "shoppingList": [
    { "name": "재료명", "amount": "수량", "unit": "단위", "category": "채소/육류/해산물/유제품/곡류/양념/기타" }
  ],
  "tips": "이번 식단 영양 팁 한 줄"
}`

    try {
      const client = new Anthropic({ apiKey: claudeApiKey.value() })

      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }]
      })

      const responseText = message.content[0].text.trim()

      let parsed
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText)

      // 사용 횟수 증가
      await usageRef.set({ count: currentCount + 1, updatedAt: new Date().toISOString() }, { merge: true })

      res.status(200).json(parsed)
    } catch (e) {
      console.error("Claude API error:", e)
      res.status(500).json({ error: "AI 응답 생성에 실패했습니다." })
    }
  }
)
