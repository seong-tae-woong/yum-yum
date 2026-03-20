import { useState, useEffect } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../firebase"
import useAuth from "../hooks/useAuth"
import CookingMode from "./CookingMode"

const STAGE_LABELS = {
  ALL: "전체",
  EARLY: "초기",
  MID: "중기",
  LATE: "후기",
  COMPLETE: "완료기"
}

function getStage(months) {
  if (months < 7) return "EARLY"
  if (months < 10) return "MID"
  if (months < 13) return "LATE"
  return "COMPLETE"
}

function RecipePage({ onBack, baby }) {
  const { user } = useAuth()
  const [tab, setTab] = useState("recommend")
  const [ingredients, setIngredients] = useState([])
  const [allRecipes, setAllRecipes] = useState([])
  const [selected, setSelected] = useState([])
  const [recommendResults, setRecommendResults] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState("ALL")
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeRecipe, setActiveRecipe] = useState(null)

  const babyStage = baby ? getStage(
    (new Date().getFullYear() - new Date(baby.birthDate).getFullYear()) * 12
    + (new Date().getMonth() - new Date(baby.birthDate).getMonth())
  ) : null

  const babyAllergies = baby?.allergies || []

  useEffect(() => {
    if (user) {
      fetchIngredients()
      fetchAllRecipes()
    }
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
      setIngredients(items)
      setSelected(items.map(i => i.name))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchAllRecipes = async () => {
    try {
      const snapshot = await getDocs(collection(db, "recipes"))
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      items.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      setAllRecipes(items)
    } catch (e) {
      console.error(e)
    }
  }

  const filterByAllergens = (recipes) => {
    if (babyAllergies.length === 0) return recipes
    return recipes.filter(recipe => {
      const recipeAllergens = recipe.allergens || []
      return !recipeAllergens.some(a => babyAllergies.includes(a))
    })
  }

  const handleRecommend = async () => {
    if (selected.length === 0) return
    setLoading(true)
    setSearched(true)
    try {
      let filtered = allRecipes
      if (babyStage) {
        filtered = filtered.filter(r => r.stage === babyStage)
      }
      filtered = filterByAllergens(filtered)

      const matched = filtered
        .map(recipe => {
          const recipeIngs = (recipe.ingredients || []).map(i => typeof i === "string" ? i : i.name)
          const matchCount = recipeIngs.filter(ing =>
            selected.some(sel => ing.includes(sel) || sel.includes(ing))
          ).length
          return { ...recipe, matchCount }
        })
        .filter(r => r.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount || (b.likeCount || 0) - (a.likeCount || 0))
      setRecommendResults(matched)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleIngredient = (name) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const getSearchResults = () => {
    let results = allRecipes
    if (stageFilter !== "ALL") {
      results = results.filter(r => r.stage === stageFilter)
    }
    results = filterByAllergens(results)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      results = results.filter(recipe => {
        const ings = (recipe.ingredients || []).map(i => typeof i === "string" ? i : i.name)
        return (
          recipe.title?.toLowerCase().includes(q) ||
          ings.some(ing => ing.toLowerCase().includes(q)) ||
          (recipe.tags || []).some(t => t.toLowerCase().includes(q))
        )
      })
    }
    return results
  }

  const searchResults = getSearchResults()

  if (activeRecipe) {
    return <RecipeDetail recipe={activeRecipe} onBack={() => setActiveRecipe(null)} babyAllergies={babyAllergies} />
  }

  return (
    <div className="min-h-screen" style={{ background: "#FFF9F5" }}>
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={onBack} className="text-base font-bold" style={{ color: "#A8D8B9" }}>← 뒤로</button>
        <h2 className="text-lg font-bold" style={{ color: "#3D3D3D" }}>🥣 이유식 레시피</h2>
        <div className="w-10" />
      </header>

      {/* 아기 월령 배지 */}
      {baby && (
        <div className="px-5 mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-bold"
            style={{ background: "#FFE0E6", color: "#FF8FAB" }}>
            {baby.name} · {STAGE_LABELS[babyStage]} 단계
          </span>
        </div>
      )}

      {/* 탭 */}
      <div className="mx-5 mb-4 flex rounded-xl p-1" style={{ background: "#FFE0E6" }}>
        <button
          onClick={() => setTab("recommend")}
          className="flex-1 py-2 rounded-lg text-base font-bold transition"
          style={{
            background: tab === "recommend" ? "#fff" : "transparent",
            color: tab === "recommend" ? "#FF8FAB" : "#FFB8C9"
          }}
        >
          추천
        </button>
        <button
          onClick={() => setTab("search")}
          className="flex-1 py-2 rounded-lg text-base font-bold transition"
          style={{
            background: tab === "search" ? "#fff" : "transparent",
            color: tab === "search" ? "#FF8FAB" : "#FFB8C9"
          }}
        >
          검색
        </button>
      </div>

      {/* 추천 탭 */}
      {tab === "recommend" && (
        <div className="px-5">
          <p className="text-sm font-bold mb-3" style={{ color: "#bbb" }}>
            사용할 재료 선택
          </p>
          {ingredients.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-base" style={{ color: "#bbb" }}>냉장고에 재료를 먼저 등록해주세요</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {ingredients.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleIngredient(item.name)}
                  className="px-3 py-2 rounded-full text-sm font-bold transition"
                  style={{
                    background: selected.includes(item.name) ? "#FF8FAB" : "#fff",
                    color: selected.includes(item.name) ? "#fff" : "#3D3D3D",
                    border: selected.includes(item.name) ? "none" : "1px solid #FFE0E6"
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleRecommend}
            disabled={selected.length === 0 || loading}
            className="w-full py-3 rounded-xl text-base font-bold mb-5"
            style={{
              background: selected.length > 0 ? "#FF8FAB" : "#f3f4f6",
              color: selected.length > 0 ? "#fff" : "#bbb"
            }}
          >
            {loading ? "찾는 중..." : "레시피 추천받기 🍳"}
          </button>

          {searched && (
            <>
              <p className="text-sm font-bold mb-3" style={{ color: "#bbb" }}>
                추천 레시피 {recommendResults.length}개
              </p>
              {recommendResults.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">🍽</p>
                  <p className="text-base" style={{ color: "#bbb" }}>매칭되는 레시피가 없어요</p>
                  <p className="text-xs mt-1" style={{ color: "#ccc" }}>검색 탭에서 직접 찾아보세요</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pb-6">
                  {recommendResults.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setActiveRecipe(recipe)} showMatch babyAllergies={babyAllergies} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 검색 탭 */}
      {tab === "search" && (
        <div className="px-5">
          {/* 단계 필터 */}
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {Object.entries(STAGE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStageFilter(key)}
                className="px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap"
                style={{
                  background: stageFilter === key ? "#A8D8B9" : "#fff",
                  color: stageFilter === key ? "#fff" : "#3D3D3D",
                  border: stageFilter === key ? "none" : "1px solid #E8F5E9"
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4" style={{ background: "#fff", border: "1px solid #FFE0E6" }}>
            <span>🔍</span>
            <input
              placeholder="레시피 이름, 재료, 태그로 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 text-base outline-none"
              style={{ background: "transparent", color: "#3D3D3D" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ color: "#ccc", fontSize: 14 }}>✕</button>
            )}
          </div>
          <p className="text-sm font-bold mb-3" style={{ color: "#bbb" }}>
            {searchQuery ? `"${searchQuery}" 검색 결과 ${searchResults.length}개` : `전체 레시피 ${searchResults.length}개`}
          </p>
          {searchResults.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-base" style={{ color: "#bbb" }}>검색 결과가 없어요</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-6">
              {searchResults.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setActiveRecipe(recipe)} babyAllergies={babyAllergies} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RecipeCard({ recipe, onClick, showMatch, babyAllergies }) {
  const stageColors = {
    EARLY: { bg: "#E3F2FD", color: "#1976D2", label: "초기" },
    MID: { bg: "#E8F5E9", color: "#388E3C", label: "중기" },
    LATE: { bg: "#FFF8E1", color: "#F57F17", label: "후기" },
    COMPLETE: { bg: "#FCE4EC", color: "#C2185B", label: "완료기" }
  }
  const stage = stageColors[recipe.stage]
  const hasAllergen = (recipe.allergens || []).some(a => babyAllergies?.includes(a))

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between px-4 py-4 rounded-2xl text-left w-full"
      style={{ background: "#fff", opacity: hasAllergen ? 0.5 : 1 }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-base font-bold" style={{ color: "#3D3D3D" }}>{recipe.title}</p>
          {stage && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: stage.bg, color: stage.color }}>
              {stage.label}
            </span>
          )}
          {showMatch && recipe.matchCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FFE0E6", color: "#FF8FAB" }}>
              재료 {recipe.matchCount}개 일치
            </span>
          )}
          {hasAllergen && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#FFEBEE", color: "#D32F2F" }}>
              ⚠️ 알레르기
            </span>
          )}
        </div>
        <p className="text-xs mb-2" style={{ color: "#bbb" }}>{recipe.description}</p>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "#bbb" }}>❤️ {recipe.likeCount || 0}</span>
          <span className="text-xs" style={{ color: "#bbb" }}>🕐 {recipe.cookingTime || 0}분</span>
          {(recipe.tags || []).length > 0 && (
            <span className="text-xs" style={{ color: "#A8D8B9" }}>#{recipe.tags[0]}</span>
          )}
        </div>
      </div>
      <span style={{ color: "#FFB8C9", fontSize: 20 }}>›</span>
    </button>
  )
}

function RecipeDetail({ recipe, onBack, babyAllergies }) {
  const [cookingMode, setCookingMode] = useState(false)

  if (cookingMode) {
    return <CookingMode recipe={recipe} onBack={() => setCookingMode(false)} />
  }

  const stageLabels = { EARLY: "초기 4~6개월", MID: "중기 7~9개월", LATE: "후기 10~12개월", COMPLETE: "완료기 13개월~" }

  return (
    <div className="min-h-screen" style={{ background: "#FFF9F5" }}>
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={onBack} className="text-base font-bold" style={{ color: "#A8D8B9" }}>← 뒤로</button>
        <h2 className="text-lg font-bold" style={{ color: "#3D3D3D" }}>{recipe.title}</h2>
        <div className="w-10" />
      </header>
      <div className="px-5">
        <div className="p-4 rounded-2xl mb-4" style={{ background: "#fff" }}>
          <p className="text-base mb-3" style={{ color: "#666" }}>{recipe.description}</p>
          <div className="flex gap-3 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "#FFE0E6", color: "#FF8FAB" }}>
              {stageLabels[recipe.stage] || ""}
            </span>
            <span className="text-xs" style={{ color: "#bbb" }}>❤️ {recipe.likeCount || 0}</span>
            <span className="text-xs" style={{ color: "#bbb" }}>🕐 {recipe.cookingTime || 0}분</span>
          </div>
          {(recipe.tags || []).length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {recipe.tags.map((tag, i) => (
                <span key={i} className="text-xs" style={{ color: "#A8D8B9" }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* 알레르기 경고 */}
        {(recipe.allergens || []).length > 0 && (
          <div className="p-3 rounded-xl mb-4" style={{ background: "#FFF3E0" }}>
            <p className="text-sm font-bold" style={{ color: "#E65100" }}>
              ⚠️ 알레르기 주의: {recipe.allergens.join(", ")}
            </p>
          </div>
        )}

        <p className="text-sm font-bold mb-2" style={{ color: "#bbb" }}>재료</p>
        <div className="p-4 rounded-2xl mb-4" style={{ background: "#fff" }}>
          <div className="flex flex-wrap gap-2">
            {(recipe.ingredients || []).map((ing, i) => {
              const ingName = typeof ing === "string" ? ing : ing.name
              const ingAmount = typeof ing === "string" ? "" : `${ing.amount}${ing.unit}`
              const isAllergen = babyAllergies?.includes(ingName)
              return (
                <span key={i} className="text-sm px-3 py-1.5 rounded-full font-bold"
                  style={{
                    background: isAllergen ? "#FFEBEE" : "#FFF9F5",
                    color: isAllergen ? "#D32F2F" : "#3D3D3D"
                  }}>
                  {ingName} {ingAmount && <span style={{ color: "#bbb" }}>{ingAmount}</span>}
                </span>
              )
            })}
          </div>
        </div>

        <p className="text-sm font-bold mb-2" style={{ color: "#bbb" }}>조리 순서</p>
        <div className="flex flex-col gap-2 mb-6">
          {(recipe.steps || []).map((step, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-2xl" style={{ background: "#fff" }}>
              <span className="text-base font-bold flex-shrink-0" style={{ color: "#FF8FAB" }}>{i + 1}</span>
              <div>
                <p className="text-base" style={{ color: "#3D3D3D" }}>{step.text}</p>
                {step.timerSec > 0 && (
                  <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full" style={{ background: "#E3F2FD", color: "#1976D2" }}>
                    ⏱ {Math.floor(step.timerSec / 60)}분 {step.timerSec % 60 > 0 ? `${step.timerSec % 60}초` : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setCookingMode(true)}
          className="w-full py-4 rounded-2xl text-lg font-bold mb-8 flex items-center justify-center gap-2"
          style={{ background: "#FF8FAB", color: "#fff" }}
        >
          <span>▶</span>
          <span>요리 모드 시작</span>
        </button>
      </div>
    </div>
  )
}

export default RecipePage
