import { useState, useEffect } from "react"
import { signOut } from "firebase/auth"
import { collection, getDocs, query, where } from "firebase/firestore"
import { auth, db } from "../firebase"
import useAuth from "../hooks/useAuth"

function getCurrentMonth(birthDate) {
  const birth = new Date(birthDate)
  const now = new Date()
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

function getStageLabel(months) {
  if (months < 7) return "초기 4~6개월"
  if (months < 10) return "중기 7~9개월"
  if (months < 13) return "후기 10~12개월"
  return "완료기 13개월~"
}

function HomePage({ onNavigate, baby }) {
  const { user } = useAuth()
  const [urgentCount, setUrgentCount] = useState(0)

  useEffect(() => {
    if (user) checkUrgentIngredients()
  }, [user])

  const checkUrgentIngredients = async () => {
    try {
      const q = query(
        collection(db, "ingredients"),
        where("userId", "==", user.uid),
        where("status", "==", "ACTIVE")
      )
      const snapshot = await getDocs(q)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      let count = 0
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        const expiry = new Date(data.expiryDate)
        expiry.setHours(0, 0, 0, 0)
        const dday = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
        if (dday <= 2) count++
      })
      setUrgentCount(count)
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("로그아웃 실패:", error)
    }
  }

  const months = baby ? getCurrentMonth(baby.birthDate) : null

  return (
    <div className="min-h-screen" style={{ background: "#FFF9F5" }}>
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#3A9B97" }}>
          <img src="/logo.png" alt="얌얌" className="w-8 h-8" /> 얌얌
        </h1>
        <button
          onClick={handleLogout}
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: "#FFE0E6", color: "#FF8FAB" }}
        >
          {user?.displayName?.charAt(0)}
        </button>
      </header>

      {/* 인사말 + 아기 프로필/냉장고 아이콘 */}
      <div className="px-5 pb-2">
        {baby ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold leading-snug" style={{ color: "#3D3D3D" }}>
                {baby.name}의 식사 도우미 🌱
              </p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-bold"
                style={{ background: "#E8F5E9", color: "#4CAF50" }}>
                {getStageLabel(months)}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onNavigate("babyProfile")}
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                style={{ background: "#FFE0E6" }}>
                👶
              </button>
              <button onClick={() => onNavigate("ingredients")}
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl relative"
                style={{ background: "#FFF8E1" }}>
                🧊
                {urgentCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: "#FF6B6B" }}>
                    {urgentCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold leading-snug" style={{ color: "#3D3D3D" }}>
              <span style={{ color: "#FF8FAB" }}>{user?.displayName}</span>님,<br />
              아기 프로필을 먼저 등록해주세요 👶
            </p>
            <button onClick={() => onNavigate("babyProfile")}
              className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
              style={{ background: "#FFE0E6" }}>
              👶
            </button>
          </div>
        )}
      </div>

      {/* 아기 성장 일러스트 */}
      <div className="px-5 py-4">
        <div className="rounded-3xl py-6 flex flex-col items-center" style={{ background: "linear-gradient(180deg, #FFF0E8 0%, #FFE0E6 100%)" }}>
          <div style={{ fontSize: months != null ? (months < 7 ? 60 : months < 10 ? 75 : months < 13 ? 90 : 100) : 70 }}
            className="transition-all duration-500">
            {months != null ? (
              baby?.gender === "female"
                ? (months < 7 ? "👶" : months < 10 ? "👧" : months < 13 ? "👧" : "👩")
                : (months < 7 ? "👶" : months < 10 ? "👦" : months < 13 ? "👦" : "🧑")
            ) : "👶"}
          </div>
          <p className="mt-2 text-sm font-bold" style={{ color: "#FF8FAB" }}>
            {baby ? `${months}개월 · ${getStageLabel(months)}` : "아기를 등록해주세요"}
          </p>
          {baby && (
            <p className="mt-1 text-xs" style={{ color: "#FFB084" }}>
              {months < 7 ? "음.. 이게 뭐지? 냠냠 첫 맛!" :
               months < 10 ? "이것도 맛있고 저것도 맛있어!" :
               months < 13 ? "나 이제 잘 먹을 수 있다구요!" :
               "숟가락도 내가 들 수 있어요!"}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {/* 주간 식단표 */}
        <button onClick={() => onNavigate("mealSchedule")}
          className="flex items-center justify-between px-5 py-5 rounded-2xl w-full"
          style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <p className="text-2xl font-bold" style={{ color: "#3D3D3D" }}>우리 아기 식단표</p>
          </div>
          <span style={{ color: "#FFB8C9", fontSize: 24 }}>›</span>
        </button>

        {/* 식사 일기 */}
        <button onClick={() => onNavigate("mealLog")}
          className="flex items-center justify-between px-5 py-5 rounded-2xl w-full"
          style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📖</span>
            <p className="text-2xl font-bold" style={{ color: "#3D3D3D" }}>식사 일기</p>
          </div>
          <span style={{ color: "#FFB8C9", fontSize: 24 }}>›</span>
        </button>
      </div>

      {/* 이유식 재료 스토리 */}
      <div className="px-5 mt-5 mb-8">
        <p className="mb-3 text-sm font-bold" style={{ color: "#bbb" }}>이유식 재료 구경하기</p>
        <div className="flex gap-4 overflow-x-auto pb-3 px-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
          {[
            { emoji: "🥩", name: "소고기", desc: "철분 가득 첫 고기", link: "https://link.coupang.com/a/REPLACE_소고기" },
            { emoji: "🥕", name: "당근", desc: "달콤한 베타카로틴", link: "https://link.coupang.com/a/REPLACE_당근" },
            { emoji: "🥔", name: "감자", desc: "부드러운 첫 탄수화물", link: "https://link.coupang.com/a/REPLACE_감자" },
            { emoji: "🧈", name: "두부", desc: "고소한 식물성 단백질", link: "https://link.coupang.com/a/REPLACE_두부" },
            { emoji: "🌾", name: "쌀가루", desc: "이유식의 기본", link: "https://link.coupang.com/a/REPLACE_쌀가루" },
            { emoji: "🍚", name: "쌀", desc: "우리 아기 든든한 한끼", link: "https://link.coupang.com/a/REPLACE_쌀" },
            { emoji: "🥣", name: "오트밀", desc: "식이섬유 풍부한 곡물", link: "https://link.coupang.com/a/REPLACE_오트밀" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex flex-col items-center"
              style={{ width: 68 }}
            >
              <div
                className="rounded-full flex items-center justify-center text-xl mb-1"
                style={{
                  width: 56, height: 56,
                  background: "linear-gradient(135deg, #FFE0E6, #FFF8E1)",
                  border: "2.5px solid #FF8FAB",
                  boxSizing: "border-box"
                }}
              >
                {item.emoji}
              </div>
              <p className="text-xs font-bold truncate w-full text-center" style={{ color: "#3D3D3D" }}>
                {item.name}
              </p>
              <p className="text-[10px] truncate w-full text-center" style={{ color: "#aaa" }}>
                {item.desc}
              </p>
            </a>
          ))}
        </div>
        <p className="text-[10px] mt-1" style={{ color: "#ccc" }}>
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다
        </p>
      </div>
    </div>
  )
}

export default HomePage
