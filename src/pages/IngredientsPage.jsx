import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from "firebase/firestore"
import { db } from "../firebase"
import useAuth from "../hooks/useAuth"

const CATEGORIES = ["채소", "육류", "해산물", "유제품", "곡류", "양념", "기타"]
const UNITS = ["개", "g", "kg", "ml", "L", "봉", "팩", "묶음"]

const DEFAULT_EXPIRY = {
  "채소": 5, "육류": 3, "해산물": 2, "유제품": 7, "곡류": 30, "양념": 90, "기타": 7
}

function getDday(expiryDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

function DdayBadge({ dday }) {
  if (dday < 0) return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FFEBEE", color: "#D32F2F" }}>만료</span>
  if (dday === 0) return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FFEBEE", color: "#D32F2F" }}>D-Day</span>
  if (dday <= 2) return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FFF0E8", color: "#FF8FAB" }}>D-{dday}</span>
  return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#F3F4F6", color: "#666" }}>D-{dday}</span>
}

function IngredientsPage({ onBack }) {
  const { user } = useAuth()
  const [ingredients, setIngredients] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: "", quantity: "", unit: "개", category: "채소", expiryDate: ""
  })
  const [editForm, setEditForm] = useState({
    name: "", quantity: "", unit: "개", category: "채소", expiryDate: ""
  })

  const getDefaultExpiry = (category) => {
    const days = DEFAULT_EXPIRY[category] || 7
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split("T")[0]
  }

  useEffect(() => {
    if (user) fetchIngredients()
  }, [user])

  const fetchIngredients = async () => {
    try {
      const q = query(
        collection(db, "ingredients"),
        where("userId", "==", user.uid),
        where("status", "==", "ACTIVE")
      )
      const snapshot = await getDocs(q)
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      items.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      setIngredients(items)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!form.name.trim()) return
    try {
      await addDoc(collection(db, "ingredients"), {
        ...form,
        userId: user.uid,
        status: "ACTIVE",
        source: "MANUAL",
        addedAt: new Date().toISOString()
      })
      setForm({ name: "", quantity: "", unit: "개", category: "채소", expiryDate: "" })
      setShowAdd(false)
      fetchIngredients()
    } catch (e) {
      console.error(e)
    }
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      expiryDate: item.expiryDate
    })
  }

  const handleEditSave = async () => {
    if (!editForm.name.trim()) return
    try {
      await updateDoc(doc(db, "ingredients", editItem.id), {
        name: editForm.name,
        quantity: editForm.quantity,
        unit: editForm.unit,
        category: editForm.category,
        expiryDate: editForm.expiryDate
      })
      setEditItem(null)
      fetchIngredients()
    } catch (e) {
      console.error(e)
    }
  }

  const handleConsume = async (id) => {
    try {
      await updateDoc(doc(db, "ingredients", id), { status: "CONSUMED" })
      setIngredients(prev => prev.filter(i => i.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const urgent = ingredients.filter(i => getDday(i.expiryDate) <= 2)
  const normal = ingredients.filter(i => getDday(i.expiryDate) > 2)

  return (
    <div className="min-h-screen" style={{ background: "#FFF9F5" }}>
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={onBack} className="text-base font-bold" style={{ color: "#A8D8B9" }}>← 뒤로</button>
        <h2 className="text-lg font-bold" style={{ color: "#3D3D3D" }}>🧊 냉장고 관리</h2>
        <button
          onClick={() => { setShowAdd(true); setForm(f => ({ ...f, expiryDate: getDefaultExpiry(f.category) })) }}
          className="text-base font-bold"
          style={{ color: "#FF8FAB" }}
        >
          + 추가
        </button>
      </header>

      <div className="px-5">
        {loading ? (
          <p className="text-center py-10 text-base" style={{ color: "#bbb" }}>불러오는 중...</p>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🧊</p>
            <p className="text-base" style={{ color: "#bbb" }}>등록된 재료가 없어요</p>
            <p className="text-sm mt-1" style={{ color: "#ccc" }}>+ 추가 버튼으로 재료를 등록해보세요</p>
          </div>
        ) : (
          <>
            {urgent.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-bold mb-2" style={{ color: "#FF8FAB" }}>⚠️ 소비기한 임박</p>
                <div className="flex flex-col gap-2">
                  {urgent.map(item => (
                    <IngredientCard key={item.id} item={item} onEdit={handleEdit} onConsume={handleConsume} />
                  ))}
                </div>
              </div>
            )}
            {normal.length > 0 && (
              <div>
                <p className="text-sm font-bold mb-2" style={{ color: "#bbb" }}>보관 중</p>
                <div className="flex flex-col gap-2">
                  {normal.map(item => (
                    <IngredientCard key={item.id} item={item} onEdit={handleEdit} onConsume={handleConsume} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 재료 추가 모달 */}
      {showAdd && (
        <div className="fixed inset-0 flex items-end justify-center z-50" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="w-full max-w-lg rounded-t-3xl p-6" style={{ background: "#fff" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: "#3D3D3D" }}>🥕 재료 추가</h3>
              <button onClick={() => setShowAdd(false)} style={{ color: "#aaa" }}>✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <input
                placeholder="재료 이름 (예: 두부)"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-base outline-none"
                style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
              />
              <div className="flex gap-2">
                <input
                  placeholder="수량"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="flex-1 px-4 py-3 rounded-xl text-base outline-none"
                  style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
                />
                <select
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  className="px-3 py-3 rounded-xl text-base outline-none"
                  style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
                >
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value, expiryDate: getDefaultExpiry(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl text-base outline-none"
                style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <div>
                <p className="text-xs mb-1" style={{ color: "#aaa" }}>소비기한</p>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-3 rounded-xl text-base font-bold mt-1"
                style={{ background: "#FF8FAB", color: "#fff" }}
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 재료 수정 모달 */}
      {editItem && (
        <div className="fixed inset-0 flex items-end justify-center z-50" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="w-full max-w-lg rounded-t-3xl p-6" style={{ background: "#fff" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: "#3D3D3D" }}>{editItem.name} 수정</h3>
              <button onClick={() => setEditItem(null)} style={{ color: "#aaa" }}>✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <input
                placeholder="재료 이름"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-base outline-none"
                style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
              />
              <div className="flex gap-2">
                <input
                  placeholder="수량"
                  value={editForm.quantity}
                  onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))}
                  className="flex-1 px-4 py-3 rounded-xl text-base outline-none"
                  style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
                />
                <select
                  value={editForm.unit}
                  onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))}
                  className="px-3 py-3 rounded-xl text-base outline-none"
                  style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
                >
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <select
                value={editForm.category}
                onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-base outline-none"
                style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <div>
                <p className="text-xs mb-1" style={{ color: "#aaa" }}>소비기한</p>
                <input
                  type="date"
                  value={editForm.expiryDate}
                  onChange={e => setEditForm(f => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style={{ background: "#FFF9F5", border: "1px solid #FFE0E6", color: "#3D3D3D" }}
                />
              </div>
              <button
                onClick={handleEditSave}
                className="w-full py-3 rounded-xl text-base font-bold mt-1"
                style={{ background: "#FF8FAB", color: "#fff" }}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function IngredientCard({ item, onEdit, onConsume }) {
  const dday = getDday(item.expiryDate)
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: "#fff" }}>
      <div>
        <p className="text-base font-bold" style={{ color: "#3D3D3D" }}>{item.name}</p>
        <p className="text-xs mt-0.5" style={{ color: "#bbb" }}>
          {item.quantity}{item.unit} · {item.category}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <DdayBadge dday={dday} />
        <button
          onClick={() => onEdit(item)}
          className="text-xs px-2 py-1 rounded-lg font-bold"
          style={{ background: "#FFF9F5", color: "#666" }}
        >
          수정
        </button>
        <button
          onClick={() => onConsume(item.id)}
          className="text-xs px-2 py-1 rounded-lg font-bold"
          style={{ background: "#E8F5E9", color: "#388E3C" }}
        >
          소진
        </button>
      </div>
    </div>
  )
}

export default IngredientsPage
