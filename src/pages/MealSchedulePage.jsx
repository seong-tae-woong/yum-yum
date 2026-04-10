import { useState, useEffect } from "react"
import { collection, getDocs, query, where, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db, auth } from "../firebase"
import useAuth from "../hooks/useAuth"
import CookingMode from "./CookingMode"

const FUNCTION_URL = "https://generatemealschedule-kkg6se7orq-du.a.run.app"

const STAGE_CONFIG = {
  EARLY: { mealsPerDay: 1, label: "초기 (4~6개월)", desc: "하루 1회, 부드러운 미음/퓨레", slots: ["아침"] },
  MID: { mealsPerDay: 2, label: "중기 (7~9개월)", desc: "하루 2회, 다진 이유식", slots: ["아침", "저녁"] },
  LATE: { mealsPerDay: 3, label: "후기 (10~12개월)", desc: "하루 3회, 무른밥 이유식", slots: ["아침", "점심", "저녁"] },
  COMPLETE: { mealsPerDay: 3, label: "완료기 (13개월~)", desc: "하루 3회, 진밥/일반식", slots: ["아침", "점심", "저녁"] }
}

const SLOT_COLORS = { "아침": "#FFD166", "점심": "#A8D8B9", "저녁": "#FF8FAB" }

function getStage(months) {
  if (months < 7) return "EARLY"
  if (months < 10) return "MID"
  if (months < 13) return "LATE"
  return "COMPLETE"
}

function fmt(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function MealCard({ meal }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2">
      <button onClick={() => setOpen(!open)} className="w-full text-left flex items-center gap-2 py-1.5">
        <span className="px-1.5 py-0.5 rounded text-xs font-bold text-white shrink-0"
          style={{ background: SLOT_COLORS[meal.slot] || "#aaa", fontSize: "10px" }}>{meal.slot}</span>
        <span className="text-sm font-bold flex-1" style={{ color: "#3D3D3D" }}>{meal.recipeTitle}</span>
        <span className="text-xs" style={{ color: "#ccc" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="ml-8 mt-1 mb-2 p-3 rounded-xl" style={{ background: "#FFF9F5" }}>
          {meal.reason && (
            <p className="text-xs mb-2" style={{ color: "#888" }}>💡 {meal.reason}</p>
          )}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-bold mb-1" style={{ color: "#FF8FAB" }}>🥕 재료</p>
              <div className="flex flex-wrap gap-1">
                {meal.ingredients.map((ing, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: "#FFE8ED", color: "#555" }}>
                    {ing.name} {ing.amount}{ing.unit}
                  </span>
                ))}
              </div>
            </div>
          )}
          {meal.steps && meal.steps.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: "#A8D8B9" }}>👩‍🍳 조리법</p>
              {meal.steps.map((step, i) => (
                <div key={i} className="flex gap-2 mb-1">
                  <span className="text-xs font-bold shrink-0" style={{ color: "#A8D8B9" }}>{i + 1}.</span>
                  <p className="text-xs" style={{ color: "#555" }}>{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MealSchedulePage({ onBack, baby }) {
  const { user } = useAuth()
  const [view, setView] = useState("main") // main | generate | loading
  const [calMonth, setCalMonth] = useState(new Date())
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [selectedDate, setSelectedDate] = useState(null) // 캘린더에서 선택한 날짜
  const [cookingMeal, setCookingMeal] = useState(null) // 요리 모드 진입 시 meal 데이터
  const [changingMeal, setChangingMeal] = useState(null) // 변경 중인 meal { mealIndex, slot, date }
  const [changePrompt, setChangePrompt] = useState("") // 변경 시 사용자 요청
  const [changeLoading, setChangeLoading] = useState(false)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  const babyMonths = baby ? (
    (new Date().getFullYear() - new Date(baby.birthDate).getFullYear()) * 12
    + (new Date().getMonth() - new Date(baby.birthDate).getMonth())
  ) : 0
  const babyStage = baby ? getStage(babyMonths) : "EARLY"
  const config = STAGE_CONFIG[babyStage]

  // 모든 스케줄을 날짜별로 합치기
  const allDayMap = {} // { "2026-04-10": { day: "금", date: "2026-04-10", meals: [...], scheduleId: "xxx" } }
  const allShoppingList = []
  schedules.forEach(sch => {
    (sch.schedule || []).forEach(d => {
      allDayMap[d.date] = { ...d, scheduleId: sch.id }
    })
    ;(sch.shoppingList || []).forEach(item => {
      if (!allShoppingList.find(i => i.name === item.name)) allShoppingList.push(item)
    })
  })
  const allDays = Object.values(allDayMap).sort((a, b) => a.date.localeCompare(b.date))
  const hasSchedules = allDays.length > 0

  // DB에서 저장된 식단표 불러오기
  useEffect(() => {
    if (user) loadSchedules()
  }, [user])

  const loadSchedules = async () => {
    setDataLoading(true)
    try {
      const q = query(
        collection(db, "mealSchedules"),
        where("userId", "==", user.uid)
      )
      const snapshot = await getDocs(q)
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      setSchedules(items)
    } catch (e) {
      console.error(e)
    } finally {
      setDataLoading(false)
    }
  }

  // 기존 식단이 있는 날짜 Set
  const existingMealDates = new Set()
  schedules.forEach(sch => {
    (sch.schedule || []).forEach(d => { if (d.date) existingMealDates.add(d.date) })
  })

  // 생성 모드 달력 데이터
  const year = calMonth.getFullYear()
  const month = calMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const handleDateClick = (day) => {
    if (!day) return
    const dateStr = fmt(new Date(year, month, day))
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr)
      setEndDate(null)
    } else {
      if (dateStr < startDate) {
        setEndDate(startDate)
        setStartDate(dateStr)
      } else {
        setEndDate(dateStr)
      }
    }
  }

  const isInRange = (day) => {
    if (!day || !startDate) return false
    const dateStr = fmt(new Date(year, month, day))
    if (!endDate) return dateStr === startDate
    return dateStr >= startDate && dateStr <= endDate
  }

  const isStart = (day) => day && startDate === fmt(new Date(year, month, day))
  const isEnd = (day) => day && endDate === fmt(new Date(year, month, day))

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      setError("시작일과 종료일을 모두 선택해주세요.")
      return
    }

    setView("loading")
    setLoading(true)
    setError(null)

    try {
      let fridgeIngredients = []
      try {
        const ingQuery = query(
          collection(db, "ingredients"),
          where("userId", "==", user.uid),
          where("status", "==", "ACTIVE")
        )
        const ingSnapshot = await getDocs(ingQuery)
        fridgeIngredients = ingSnapshot.docs.map(doc => {
          const d = doc.data()
          return { name: d.name, quantity: d.quantity, unit: d.unit, expiryDate: d.expiryDate }
        })
      } catch (e) {
        console.log("냉장고 재료 조회 실패 (무시):", e)
      }

      const babyAllergies = baby?.allergies || []
      const idToken = await auth.currentUser.getIdToken()

      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({
          babyName: baby?.name || "우리 아기",
          stage: babyStage,
          stageLabel: config.label,
          mealsPerDay: config.mealsPerDay,
          allergies: babyAllergies,
          fridgeIngredients,
          startDate,
          endDate,
          comment
        })
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      // 기존 스케줄에서 겹치는 날짜만 제거 (나머지 유지)
      for (const sch of schedules) {
        if (sch.startDate <= endDate && sch.endDate >= startDate) {
          try {
            // 겹치지 않는 날짜만 남기기
            const remainingDays = (sch.schedule || []).filter(d => d.date < startDate || d.date > endDate)

            if (remainingDays.length === 0) {
              // 전부 겹치면 삭제
              await deleteDoc(doc(db, "mealSchedules", sch.id))
            } else {
              // 남은 날짜로 범위 재계산
              const dates = remainingDays.map(d => d.date).sort()
              await updateDoc(doc(db, "mealSchedules", sch.id), {
                schedule: remainingDays,
                startDate: dates[0],
                endDate: dates[dates.length - 1]
              })
            }
          } catch (e) {
            console.error("기존 스케줄 수정 실패:", e)
          }
        }
      }

      // 새 식단 저장
      await addDoc(collection(db, "mealSchedules"), {
        userId: user.uid,
        babyId: baby?.id || null,
        stage: babyStage,
        startDate,
        endDate,
        comment: comment || "",
        schedule: data.schedule || [],
        shoppingList: data.shoppingList || [],
        tips: data.tips || "",
        createdAt: new Date().toISOString()
      })

      await loadSchedules()
      setView("main")
      setStartDate(null)
      setEndDate(null)
      setComment("")
    } catch (e) {
      console.error("MealSchedule error:", e)
      setError(e.message)
      setView("generate")
    } finally {
      setLoading(false)
    }
  }

  // 개별 메뉴 변경 함수
  const handleChangeMeal = async () => {
    if (!changingMeal) return
    const targetSchedule = schedules.find(s => s.id === changingMeal.scheduleId)
    if (!targetSchedule) return
    setChangeLoading(true)

    try {
      const idToken = await auth.currentUser.getIdToken()
      const babyAllergies = baby?.allergies || []

      // 현재 식단의 해당 날짜 다른 메뉴 목록 (중복 방지용)
      const dayData = (targetSchedule.schedule || []).find(d => d.date === changingMeal.date)
      const otherMeals = (dayData?.meals || [])
        .filter((_, i) => i !== changingMeal.mealIndex)
        .map(m => m.recipeTitle)

      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({
          mode: "singleMeal",
          stage: babyStage,
          stageLabel: config.label,
          allergies: babyAllergies,
          slot: changingMeal.slot,
          otherMeals,
          userPrompt: changePrompt || ""
        })
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      const newMeal = {
        slot: changingMeal.slot,
        recipeTitle: data.recipeTitle,
        ingredients: data.ingredients || [],
        steps: data.steps || [],
        reason: data.reason || ""
      }

      if (!newMeal.recipeTitle) throw new Error("AI 응답 파싱 실패")

      // 스케줄 업데이트
      const updatedSchedule = (targetSchedule.schedule || []).map(d => {
        if (d.date !== changingMeal.date) return d
        const updatedMeals = (d.meals || []).map((meal, i) => {
          if (i === changingMeal.mealIndex) return newMeal
          return meal
        })
        return { ...d, meals: updatedMeals }
      })

      // Firestore 업데이트
      const docRef = doc(db, "mealSchedules", targetSchedule.id)
      await updateDoc(docRef, { schedule: updatedSchedule })

      // 로컬 상태 업데이트
      setSchedules(prev => prev.map(s => s.id === targetSchedule.id ? { ...s, schedule: updatedSchedule } : s))
      setChangingMeal(null)
      setChangePrompt("")
    } catch (e) {
      console.error("메뉴 변경 실패:", e)
      alert("메뉴 변경에 실패했어요. 다시 시도해주세요.")
    } finally {
      setChangeLoading(false)
    }
  }

  // ===== 요리 모드 =====
  if (cookingMeal) {
    // CookingMode가 기대하는 형태로 변환
    const cookingRecipe = {
      title: cookingMeal.recipeTitle,
      steps: (cookingMeal.steps || []).map(s => ({
        text: typeof s === "string" ? s : s.text || "",
        timerSec: typeof s === "object" ? (s.timerSec || 0) : 0
      }))
    }
    // steps가 비어있으면 재료 기반으로 기본 단계 생성
    if (cookingRecipe.steps.length === 0 && cookingMeal.ingredients?.length > 0) {
      cookingRecipe.steps = [
        { text: `재료를 준비합니다: ${cookingMeal.ingredients.map(i => i.name).join(", ")}`, timerSec: 0 },
        { text: "재료를 손질하고 조리합니다.", timerSec: 0 },
        { text: "완성! 아기에게 맛있게 먹여주세요.", timerSec: 0 }
      ]
    }
    return <CookingMode recipe={cookingRecipe} onBack={() => setCookingMeal(null)} />
  }

  // ===== 로딩 화면 =====
  if (view === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#FFF9F5" }}>
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce">👩‍🍳</div>
          <p className="text-xl font-bold mb-2" style={{ color: "#3D3D3D" }}>AI 영양사가 식단표를 만들고 있어요</p>
          <p className="text-sm mb-2" style={{ color: "#aaa" }}>{startDate} ~ {endDate}</p>
          <p className="text-sm mb-6" style={{ color: "#aaa" }}>아기에게 딱 맞는 레시피를 만드는 중...</p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-3 h-3 rounded-full animate-pulse"
                style={{ background: "#FF8FAB", animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ===== 장보기 목록 =====
  if (showShoppingList && allShoppingList.length > 0) {
    const shoppingList = allShoppingList
    const grouped = {}
    ;(shoppingList || []).forEach(item => {
      const cat = item.category || "기타"
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(item)
    })

    return (
      <div className="min-h-screen pb-10" style={{ background: "#FFF9F5" }}>
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <button onClick={() => setShowShoppingList(false)} className="text-2xl" style={{ color: "#FF8FAB" }}>←</button>
          <p className="text-lg font-bold" style={{ color: "#3D3D3D" }}>장보기 목록</p>
          <div className="w-8" />
        </div>
        {shoppingList && shoppingList.length > 0 ? (
          <div className="px-5 flex flex-col gap-4">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <p className="text-sm font-bold mb-3" style={{ color: "#FF8FAB" }}>{category}</p>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "#f5f5f5" }}>
                    <div className="flex items-center gap-2">
                      <span>🛒</span>
                      <span className="text-sm font-bold" style={{ color: "#3D3D3D" }}>{item.name}</span>
                    </div>
                    <span className="text-sm" style={{ color: "#aaa" }}>{item.amount}{item.unit}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-5 p-8 rounded-2xl text-center" style={{ background: "#fff" }}>
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-lg font-bold" style={{ color: "#3D3D3D" }}>추가 구매할 재료가 없어요!</p>
          </div>
        )}
      </div>
    )
  }

  // ===== 생성 모드 =====
  if (view === "generate") {
    return (
      <div className="min-h-screen pb-10" style={{ background: "#FFF9F5" }}>
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <button onClick={() => { setView("main"); setStartDate(null); setEndDate(null); setError(null) }}
            className="text-2xl" style={{ color: "#FF8FAB" }}>←</button>
          <p className="text-lg font-bold" style={{ color: "#3D3D3D" }}>식단표 만들기</p>
          <div className="w-8" />
        </div>

        {/* 안내 */}
        <div className="mx-5 mb-3 p-3 rounded-xl" style={{ background: "#FFF0F3" }}>
          <p className="text-sm font-bold" style={{ color: "#FF8FAB" }}>
            {!startDate ? "📅 시작일을 선택하세요" : !endDate ? "📅 종료일을 선택하세요" : `✅ ${startDate} ~ ${endDate}`}
          </p>
        </div>

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={() => setCalMonth(new Date(year, month - 1))} className="text-xl" style={{ color: "#FF8FAB" }}>‹</button>
          <p className="text-base font-bold" style={{ color: "#3D3D3D" }}>{year}년 {month + 1}월</p>
          <button onClick={() => setCalMonth(new Date(year, month + 1))} className="text-xl" style={{ color: "#FF8FAB" }}>›</button>
        </div>

        {/* 달력 */}
        <div className="mx-5 rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["일", "월", "화", "수", "목", "금", "토"].map(d => (
              <div key={d} className="text-center text-xs font-bold py-1"
                style={{ color: d === "일" ? "#FF8FAB" : d === "토" ? "#5B9BD5" : "#aaa" }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={idx} />
              const inRange = isInRange(day)
              const dateStr = fmt(new Date(year, month, day))
              const isToday = dateStr === fmt(new Date())
              const hasMeal = existingMealDates.has(dateStr)
              return (
                <button key={idx} onClick={() => handleDateClick(day)}
                  className="rounded-lg p-1 min-h-[52px] flex flex-col items-center justify-center"
                  style={{
                    background: inRange ? "#FFD1DC" : hasMeal ? "#E8F5E9" : isToday ? "#FFF0F3" : "transparent",
                    border: isStart(day) || isEnd(day) ? "2px solid #FF8FAB" : hasMeal ? "1px solid #A8D8B9" : "1px solid transparent"
                  }}>
                  <span className="text-xs font-bold" style={{
                    color: inRange ? "#fff" : hasMeal ? "#2E7D32" : isToday ? "#FF8FAB" : new Date(year, month, day).getDay() === 0 ? "#FF8FAB" : "#3D3D3D"
                  }}>{day}</span>
                  {hasMeal && !inRange && (
                    <span style={{ fontSize: "7px", color: "#4CAF50" }}>식단있음</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 코멘트 + 생성 버튼 */}
        {startDate && endDate && (
          <div className="mx-5 mt-4">
            <div className="rounded-2xl p-4 mb-3" style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p className="text-sm font-bold mb-2" style={{ color: "#3D3D3D" }}>💬 요청사항 (선택)</p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="예: 소고기 위주로 만들어줘, 간단한 메뉴로 부탁해"
                className="w-full p-3 rounded-xl text-sm resize-none"
                rows={2}
                style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
              />
            </div>

            <button onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 rounded-2xl text-lg font-bold text-white"
              style={{ background: loading ? "#ddd" : "#FF8FAB", boxShadow: "0 4px 12px rgba(255,143,171,0.4)" }}>
              🪄 식단표 생성하기
            </button>
          </div>
        )}

        {error && (
          <div className="mx-5 mt-3 p-3 rounded-xl text-center" style={{ background: "#FFEBEE" }}>
            <p className="text-sm" style={{ color: "#D32F2F" }}>{error}</p>
          </div>
        )}
      </div>
    )
  }

  // ===== 메인: 식단표 통합 뷰 =====
  return (
    <div className="min-h-screen pb-10" style={{ background: "#FFF9F5" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={onBack} className="text-2xl" style={{ color: "#FF8FAB" }}>←</button>
        <p className="text-lg font-bold" style={{ color: "#3D3D3D" }}>식단표</p>
        <div className="flex items-center gap-2">
          {hasSchedules && (
            <button onClick={() => setShowShoppingList(true)}
              className="text-sm font-bold" style={{ color: "#A8D8B9" }}>
              🛒 장보기
            </button>
          )}
          <button onClick={() => setView("generate")}
            className="text-sm font-bold px-2.5 py-1 rounded-full text-white"
            style={{ background: "#FF8FAB" }}>
            + 새 식단표
          </button>
        </div>
      </div>

      {dataLoading ? (
        <div className="text-center py-20">
          <p className="text-sm" style={{ color: "#aaa" }}>불러오는 중...</p>
        </div>
      ) : !hasSchedules ? (
        <div className="px-5">
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-lg font-bold mb-2" style={{ color: "#3D3D3D" }}>아직 식단표가 없어요</p>
            <p className="text-sm mb-6" style={{ color: "#aaa" }}>AI 영양사가 아기에게 맞는 식단을 만들어줄게요</p>
            <button onClick={() => setView("generate")}
              className="px-6 py-3 rounded-2xl text-base font-bold text-white"
              style={{ background: "#FF8FAB", boxShadow: "0 4px 12px rgba(255,143,171,0.4)" }}>
              🪄 식단표 만들기
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button onClick={() => setCalMonth(new Date(year, month - 1))} className="text-xl" style={{ color: "#FF8FAB" }}>‹</button>
            <p className="text-base font-bold" style={{ color: "#3D3D3D" }}>{year}년 {month + 1}월</p>
            <button onClick={() => setCalMonth(new Date(year, month + 1))} className="text-xl" style={{ color: "#FF8FAB" }}>›</button>
          </div>

          {/* 통합 달력 */}
          <div className="px-5">
            <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["일", "월", "화", "수", "목", "금", "토"].map(d => (
                  <div key={d} className="text-center text-xs font-bold py-1"
                    style={{ color: d === "일" ? "#FF8FAB" : d === "토" ? "#5B9BD5" : "#aaa" }}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={idx} />
                  const dateStr = fmt(new Date(year, month, day))
                  const dayData = allDayMap[dateStr]
                  const isSelected = selectedDate === dateStr
                  const isToday = dateStr === fmt(new Date())
                  return (
                    <button key={idx} onClick={() => {
                      if (dayData) setSelectedDate(isSelected ? null : dateStr)
                    }}
                      className="rounded-lg p-1 min-h-[70px] text-left"
                      style={{
                        background: isSelected ? "#FF8FAB" : dayData ? "#FFF0F3" : isToday ? "#FFF8F0" : "transparent",
                        border: isSelected ? "2px solid #FF6B8A" : dayData ? "1px solid #FFD1DC" : "1px solid transparent",
                        cursor: dayData ? "pointer" : "default"
                      }}>
                      <p className="text-xs text-center font-bold mb-0.5" style={{ color: isSelected ? "#fff" : dayData ? "#3D3D3D" : isToday ? "#FF8FAB" : "#ddd" }}>{day}</p>
                      {dayData && (dayData.meals || []).map((meal, mi) => (
                        <div key={mi} className="rounded px-0.5 py-0.5 mb-0.5 overflow-hidden" style={{ background: isSelected ? "rgba(255,255,255,0.3)" : `${SLOT_COLORS[meal.slot]}30` }}>
                          <p className="text-center truncate" style={{ fontSize: "9px", color: isSelected ? "#fff" : "#555", lineHeight: "1.3" }}>
                            {meal.recipeTitle}
                          </p>
                        </div>
                      ))}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 선택된 날짜 상세 */}
          {selectedDate && (() => {
            const dayData = allDayMap[selectedDate]
            if (!dayData) return null
            return (
              <div className="px-5 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold text-white"
                      style={{ background: ["토", "일"].includes(dayData.day) ? "#FFD166" : "#A8D8B9" }}>
                      {dayData.day}
                    </span>
                    <span className="text-sm font-bold" style={{ color: "#3D3D3D" }}>{dayData.date}</span>
                  </div>
                  <button onClick={() => setSelectedDate(null)}
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: "#FFF0F3", color: "#FF8FAB" }}>
                    ✕ 닫기
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {(dayData.meals || []).map((meal, mi) => (
                    <div key={mi} className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 rounded text-xs font-bold text-white shrink-0"
                            style={{ background: SLOT_COLORS[meal.slot] || "#aaa" }}>{meal.slot}</span>
                          <span className="text-base font-bold truncate" style={{ color: "#3D3D3D" }}>{meal.recipeTitle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {meal.steps && meal.steps.length > 0 && (
                            <button onClick={() => setCookingMeal(meal)}
                              className="px-2.5 py-1.5 rounded-full text-xs font-bold text-white"
                              style={{ background: "#FF8FAB" }}>
                              👩‍🍳 요리
                            </button>
                          )}
                          <button onClick={() => { setChangingMeal({ mealIndex: mi, slot: meal.slot, date: dayData.date, scheduleId: dayData.scheduleId }); setChangePrompt("") }}
                            className="px-2.5 py-1.5 rounded-full text-xs font-bold"
                            style={{ background: "#FFF0F3", color: "#FF8FAB", border: "1px solid #FFD1DC" }}>
                            🔄 변경
                          </button>
                        </div>
                      </div>

                      {meal.reason && (
                        <p className="text-xs mb-3 px-2 py-1.5 rounded-lg" style={{ background: "#FFF9F5", color: "#888" }}>
                          💡 {meal.reason}
                        </p>
                      )}

                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-bold mb-2" style={{ color: "#FF8FAB" }}>🥕 재료</p>
                          <div className="flex flex-wrap gap-1.5">
                            {meal.ingredients.map((ing, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-full text-xs"
                                style={{ background: "#FFE8ED", color: "#555" }}>
                                {ing.name} {ing.amount}{ing.unit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {meal.steps && meal.steps.length > 0 && (
                        <div>
                          <p className="text-xs font-bold mb-2" style={{ color: "#A8D8B9" }}>👩‍🍳 조리법</p>
                          <div className="flex flex-col gap-1.5">
                            {meal.steps.map((step, i) => (
                              <div key={i} className="flex gap-2 items-start">
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                  style={{ background: "#A8D8B9" }}>{i + 1}</span>
                                <p className="text-sm pt-0.5" style={{ color: "#555" }}>{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

        </>
      )}

      {/* 메뉴 변경 모달 */}
      {changingMeal && (
        <div className="fixed inset-0 flex items-end justify-center z-50" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="w-full max-w-lg rounded-t-3xl p-6" style={{ background: "#fff", maxHeight: "70vh" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "#3D3D3D" }}>
                🔄 {changingMeal.slot} 메뉴 변경
              </h3>
              <button onClick={() => { setChangingMeal(null); setChangePrompt("") }}
                style={{ color: "#aaa", fontSize: 18 }}>✕</button>
            </div>

            <p className="text-xs mb-4" style={{ color: "#aaa" }}>
              {changingMeal.date} {changingMeal.slot} 메뉴를 AI가 새로 만들어줘요
            </p>

            {/* 빠른 선택 태그 */}
            <div className="mb-3">
              <p className="text-xs font-bold mb-2" style={{ color: "#888" }}>빠른 선택</p>
              <div className="flex flex-wrap gap-2">
                {["단백질 풍부한", "간편한", "채소 위주", "부드러운", "새로운 재료로", "철분 풍부한", "달콤한"].map(tag => (
                  <button key={tag}
                    onClick={() => setChangePrompt(prev => prev.includes(tag) ? prev.replace(tag, "").trim() : (prev + " " + tag).trim())}
                    className="px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      background: changePrompt.includes(tag) ? "#FF8FAB" : "#FFF0F3",
                      color: changePrompt.includes(tag) ? "#fff" : "#FF8FAB",
                      border: changePrompt.includes(tag) ? "none" : "1px solid #FFD1DC"
                    }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 직접 입력 */}
            <div className="mb-4">
              <p className="text-xs font-bold mb-2" style={{ color: "#888" }}>직접 입력 (선택)</p>
              <textarea
                value={changePrompt}
                onChange={e => setChangePrompt(e.target.value)}
                placeholder="예: 소고기로 만들어줘, 10분 안에 만들 수 있는 걸로"
                className="w-full p-3 rounded-xl text-sm resize-none"
                rows={2}
                style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
              />
            </div>

            <button onClick={handleChangeMeal}
              disabled={changeLoading}
              className="w-full py-3.5 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2"
              style={{ background: changeLoading ? "#ddd" : "#FF8FAB" }}>
              {changeLoading ? (
                <>
                  <span className="animate-spin">⏳</span> AI가 새 메뉴를 만드는 중...
                </>
              ) : (
                "🪄 새 메뉴 만들기"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MealSchedulePage
