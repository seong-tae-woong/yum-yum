import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from "firebase/firestore"
import { db } from "../firebase"
import useAuth from "../hooks/useAuth"

const COMMON_ALLERGENS = [
  "계란", "우유", "밀", "대두", "땅콩", "호두",
  "새우", "게", "복숭아", "토마토", "고등어", "돼지고기",
  "소고기", "닭고기", "메밀", "잣"
]

function BabyProfilePage({ onComplete }) {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [allergies, setAllergies] = useState([])
  const [saving, setSaving] = useState(false)
  const [existingBaby, setExistingBaby] = useState(null)

  useEffect(() => {
    if (user) loadExistingBaby()
  }, [user])

  const loadExistingBaby = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "babies"),
      )
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const baby = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
        setExistingBaby(baby)
        setName(baby.name)
        setBirthDate(baby.birthDate)
        setAllergies(baby.allergies || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const toggleAllergy = (item) => {
    setAllergies(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    )
  }

  const handleSave = async () => {
    if (!name.trim() || !birthDate) return
    setSaving(true)
    try {
      const data = {
        name: name.trim(),
        birthDate,
        allergies,
        triedIngredients: existingBaby?.triedIngredients || [],
        createdAt: existingBaby?.createdAt || new Date().toISOString()
      }
      if (existingBaby) {
        await updateDoc(doc(db, "users", user.uid, "babies", existingBaby.id), data)
      } else {
        await addDoc(collection(db, "users", user.uid, "babies"), data)
      }
      onComplete()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const getMonths = () => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    return months
  }

  const getStageLabel = (months) => {
    if (months === null) return ""
    if (months < 4) return "아직 이유식 시작 전이에요"
    if (months < 7) return "🥣 초기 이유식 (4~6개월)"
    if (months < 10) return "🥣 중기 이유식 (7~9개월)"
    if (months < 13) return "🥣 후기 이유식 (10~12개월)"
    return "🥣 완료기 이유식 (13개월~)"
  }

  const months = getMonths()

  return (
    <div className="min-h-screen" style={{ background: "#FFF9F5" }}>
      <header className="flex items-center justify-center px-5 pt-6 pb-4">
        <h2 className="text-xl font-bold" style={{ color: "#FF8FAB" }}>
          👶 아기 프로필 {existingBaby ? "수정" : "등록"}
        </h2>
      </header>

      <div className="px-5">
        <div className="p-5 rounded-3xl mb-4" style={{ background: "#fff" }}>
          <label className="text-sm font-bold mb-2 block" style={{ color: "#3D3D3D" }}>아기 이름</label>
          <input
            placeholder="예: 하늘이"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-base outline-none"
            style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
          />
        </div>

        <div className="p-5 rounded-3xl mb-4" style={{ background: "#fff" }}>
          <label className="text-sm font-bold mb-2 block" style={{ color: "#3D3D3D" }}>생년월일</label>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-base outline-none"
            style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
          />
          {months !== null && (
            <p className="mt-2 text-sm font-bold" style={{ color: "#A8D8B9" }}>
              {getStageLabel(months)}
            </p>
          )}
        </div>

        <div className="p-5 rounded-3xl mb-6" style={{ background: "#fff" }}>
          <label className="text-sm font-bold mb-3 block" style={{ color: "#3D3D3D" }}>
            알레르기 식품 선택 ⚠️
          </label>
          <p className="text-xs mb-3" style={{ color: "#bbb" }}>
            알레르기가 있거나 주의해야 할 식품을 선택해주세요
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGENS.map(item => (
              <button
                key={item}
                onClick={() => toggleAllergy(item)}
                className="px-3 py-2 rounded-full text-sm font-bold transition"
                style={{
                  background: allergies.includes(item) ? "#FF8FAB" : "#FFF9F5",
                  color: allergies.includes(item) ? "#fff" : "#3D3D3D",
                  border: allergies.includes(item) ? "none" : "1px solid #FFE0E6"
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || !birthDate || saving}
          className="w-full py-4 rounded-2xl text-lg font-bold mb-8"
          style={{
            background: name.trim() && birthDate ? "#FF8FAB" : "#f3f4f6",
            color: name.trim() && birthDate ? "#fff" : "#bbb"
          }}
        >
          {saving ? "저장 중..." : existingBaby ? "수정 완료 ✨" : "등록 완료 ✨"}
        </button>
      </div>
    </div>
  )
}

export default BabyProfilePage
