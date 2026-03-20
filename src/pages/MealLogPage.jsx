import { useState, useEffect, useRef } from "react"
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "../firebase"
import useAuth from "../hooks/useAuth"
import { saveImage, getImage, fileToBase64 } from "../utils/localImageStore"

const REACTIONS = [
  { value: "LOVE", emoji: "😋", label: "잘먹음" },
  { value: "NORMAL", emoji: "😐", label: "보통" },
  { value: "REJECT", emoji: "😣", label: "거부" },
  { value: "ALLERGY", emoji: "⚠️", label: "알레르기" }
]

const AMOUNTS = [
  { value: "GOOD", label: "잘 먹음", emoji: "🥣" },
  { value: "NORMAL", label: "보통", emoji: "🥄" },
  { value: "LITTLE", label: "조금", emoji: "💧" }
]

function getDateStr(date) {
  return date.toISOString().split("T")[0]
}

function MealLogPage({ onBack, baby }) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(getDateStr(new Date()))
  const [logs, setLogs] = useState([])
  const [logImages, setLogImages] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [form, setForm] = useState({
    recipeTitle: "",
    amount: "GOOD",
    reaction: "LOVE",
    note: ""
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) fetchLogs()
  }, [user])

  // 로그가 바뀔 때마다 로컬 이미지 로드
  useEffect(() => {
    loadLogImages()
  }, [logs])

  const loadLogImages = async () => {
    const images = {}
    for (const log of logs) {
      if (log.hasImage) {
        try {
          const img = await getImage(log.id)
          if (img) images[log.id] = img
        } catch (e) { /* 이미지 없으면 무시 */ }
      }
    }
    setLogImages(images)
  }

  const fetchLogs = async () => {
    try {
      const q = query(
        collection(db, "mealLogs"),
        where("userId", "==", user.uid)
      )
      const snapshot = await getDocs(q)
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      items.sort((a, b) => b.createdAt?.localeCompare(a.createdAt))
      setLogs(items)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const base64 = await fileToBase64(file)
    setImagePreview(base64)
  }

  const handleAdd = async () => {
    if (!form.recipeTitle.trim()) return
    try {
      const docRef = await addDoc(collection(db, "mealLogs"), {
        userId: user.uid,
        babyId: baby?.id || "",
        recipeTitle: form.recipeTitle.trim(),
        date: selectedDate,
        amount: form.amount,
        reaction: form.reaction,
        note: form.note,
        hasImage: !!imagePreview,
        createdAt: new Date().toISOString()
      })

      // 이미지가 있으면 로컬(IndexedDB)에 저장
      if (imagePreview) {
        await saveImage(docRef.id, imagePreview)
      }

      setForm({ recipeTitle: "", amount: "GOOD", reaction: "LOVE", note: "" })
      setImagePreview(null)
      setImageFile(null)
      setShowAdd(false)
      fetchLogs()
    } catch (e) {
      console.error(e)
    }
  }

  const logsForDate = logs.filter(l => l.date === selectedDate)
  const datesWithLogs = [...new Set(logs.map(l => l.date))]

  // 달력 생성
  const year = calendarMonth.getFullYear()
  const month = calendarMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weeks = []
  let days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d)
    if (days.length === 7) { weeks.push(days); days = [] }
  }
  if (days.length > 0) {
    while (days.length < 7) days.push(null)
    weeks.push(days)
  }

  const prevMonth = () => setCalendarMonth(new Date(year, month - 1))
  const nextMonth = () => setCalendarMonth(new Date(year, month + 1))

  return (
    <div className="min-h-screen" style={{ background: "#FFF9F5" }}>
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={onBack} className="text-base font-bold" style={{ color: "#A8D8B9" }}>← 뒤로</button>
        <h2 className="text-lg font-bold" style={{ color: "#3D3D3D" }}>📖 식사 일기</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="text-base font-bold"
          style={{ color: "#FF8FAB" }}
        >
          + 기록
        </button>
      </header>

      {/* 달력 */}
      <div className="mx-5 p-4 rounded-2xl mb-4" style={{ background: "#fff" }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="text-lg font-bold" style={{ color: "#A8D8B9" }}>‹</button>
          <p className="text-base font-bold" style={{ color: "#3D3D3D" }}>
            {year}년 {month + 1}월
          </p>
          <button onClick={nextMonth} className="text-lg font-bold" style={{ color: "#A8D8B9" }}>›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {["일", "월", "화", "수", "목", "금", "토"].map(d => (
            <p key={d} className="text-xs font-bold" style={{ color: "#bbb" }}>{d}</p>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 text-center">
            {week.map((day, di) => {
              if (!day) return <div key={di} />
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const isSelected = dateStr === selectedDate
              const hasLog = datesWithLogs.includes(dateStr)
              const isToday = dateStr === getDateStr(new Date())
              return (
                <button
                  key={di}
                  onClick={() => setSelectedDate(dateStr)}
                  className="w-9 h-9 rounded-full flex flex-col items-center justify-center mx-auto relative"
                  style={{
                    background: isSelected ? "#FF8FAB" : isToday ? "#FFE0E6" : "transparent",
                    color: isSelected ? "#fff" : "#3D3D3D"
                  }}
                >
                  <span className="text-sm font-bold">{day}</span>
                  {hasLog && !isSelected && (
                    <div className="w-1 h-1 rounded-full absolute bottom-0.5" style={{ background: "#FF8FAB" }} />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* 선택한 날짜의 기록 */}
      <div className="px-5">
        <p className="text-sm font-bold mb-3" style={{ color: "#bbb" }}>
          {selectedDate} 기록 {logsForDate.length}개
        </p>
        {loading ? (
          <p className="text-center py-6 text-base" style={{ color: "#bbb" }}>불러오는 중...</p>
        ) : logsForDate.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-base" style={{ color: "#bbb" }}>이날 기록이 없어요</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-3 px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: "#FFE0E6", color: "#FF8FAB" }}
            >
              + 기록 추가하기
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-6">
            {logsForDate.map(log => {
              const reaction = REACTIONS.find(r => r.value === log.reaction)
              const amount = AMOUNTS.find(a => a.value === log.amount)
              const localImg = logImages[log.id]
              return (
                <div key={log.id} className="p-4 rounded-2xl" style={{ background: "#fff" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-base font-bold" style={{ color: "#3D3D3D" }}>{log.recipeTitle}</p>
                    <span className="text-xl">{reaction?.emoji}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "#E8F5E9", color: "#388E3C" }}>
                      {amount?.emoji} {amount?.label}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "#FFE0E6", color: "#FF8FAB" }}>
                      {reaction?.label}
                    </span>
                  </div>
                  {localImg && (
                    <img
                      src={localImg}
                      alt={log.recipeTitle}
                      className="w-full rounded-xl mt-3 object-cover"
                      style={{ maxHeight: 200 }}
                    />
                  )}
                  {log.hasImage && !localImg && (
                    <div className="w-full rounded-xl mt-3 flex items-center justify-center py-6" style={{ background: "#FFF9F5" }}>
                      <p className="text-xs" style={{ color: "#ccc" }}>📷 다른 기기에서 저장된 사진이에요</p>
                    </div>
                  )}
                  {log.note && (
                    <p className="text-sm mt-2" style={{ color: "#999" }}>{log.note}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 기록 추가 모달 */}
      {showAdd && (
        <div className="fixed inset-0 flex items-end justify-center z-50" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 overflow-y-auto" style={{ background: "#fff", maxHeight: "90vh" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: "#3D3D3D" }}>🥣 식사 기록</h3>
              <button onClick={() => { setShowAdd(false); setImagePreview(null); setImageFile(null) }} style={{ color: "#aaa" }}>✕</button>
            </div>

            <p className="text-xs mb-1" style={{ color: "#bbb" }}>날짜: {selectedDate}</p>

            <div className="flex flex-col gap-4 mt-3">
              <input
                placeholder="이유식 이름 (예: 소고기당근죽)"
                value={form.recipeTitle}
                onChange={e => setForm(f => ({ ...f, recipeTitle: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-base outline-none"
                style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
              />

              {/* 사진 첨부 */}
              <div>
                <p className="text-sm font-bold mb-2" style={{ color: "#3D3D3D" }}>사진 (선택)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="w-full rounded-xl object-cover"
                      style={{ maxHeight: 180 }}
                    />
                    <button
                      onClick={() => { setImagePreview(null); setImageFile(null) }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 rounded-xl flex flex-col items-center gap-1"
                    style={{ background: "#FFF9F5", border: "1px dashed #FFB8C9" }}
                  >
                    <span className="text-2xl">📷</span>
                    <span className="text-xs font-bold" style={{ color: "#FF8FAB" }}>사진 추가</span>
                    <span className="text-[10px]" style={{ color: "#ccc" }}>기기에만 저장돼요</span>
                  </button>
                )}
              </div>

              {/* 섭취량 */}
              <div>
                <p className="text-sm font-bold mb-2" style={{ color: "#3D3D3D" }}>섭취량</p>
                <div className="flex gap-2">
                  {AMOUNTS.map(a => (
                    <button
                      key={a.value}
                      onClick={() => setForm(f => ({ ...f, amount: a.value }))}
                      className="flex-1 py-2 rounded-xl text-sm font-bold text-center"
                      style={{
                        background: form.amount === a.value ? "#A8D8B9" : "#FFF9F5",
                        color: form.amount === a.value ? "#fff" : "#3D3D3D",
                        border: form.amount === a.value ? "none" : "1px solid #E8F5E9"
                      }}
                    >
                      {a.emoji} {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 반응 */}
              <div>
                <p className="text-sm font-bold mb-2" style={{ color: "#3D3D3D" }}>아기 반응</p>
                <div className="flex gap-2">
                  {REACTIONS.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setForm(f => ({ ...f, reaction: r.value }))}
                      className="flex-1 py-3 rounded-xl text-center flex flex-col items-center gap-1"
                      style={{
                        background: form.reaction === r.value ? "#FF8FAB" : "#FFF9F5",
                        color: form.reaction === r.value ? "#fff" : "#3D3D3D",
                        border: form.reaction === r.value ? "none" : "1px solid #FFE0E6"
                      }}
                    >
                      <span className="text-xl">{r.emoji}</span>
                      <span className="text-xs font-bold">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 메모 */}
              <textarea
                placeholder="메모 (선택사항)"
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-base outline-none resize-none"
                rows={2}
                style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
              />

              <button
                onClick={handleAdd}
                disabled={!form.recipeTitle.trim()}
                className="w-full py-3 rounded-xl text-base font-bold"
                style={{
                  background: form.recipeTitle.trim() ? "#FF8FAB" : "#f3f4f6",
                  color: form.recipeTitle.trim() ? "#fff" : "#bbb"
                }}
              >
                기록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MealLogPage
