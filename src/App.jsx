import { useState, useEffect } from "react"
import { collection, getDocs, query } from "firebase/firestore"
import { db } from "./firebase"
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import BabyProfilePage from "./pages/BabyProfilePage"
import IngredientsPage from "./pages/IngredientsPage"
import RecipePage from "./pages/RecipePage"
import MealLogPage from "./pages/MealLogPage"
import MealSchedulePage from "./pages/MealSchedulePage"
import useAuth from "./hooks/useAuth"

function App() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState("home")
  const [baby, setBaby] = useState(null)
  const [babyLoading, setBabyLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBabyProfile()
    } else {
      setBaby(null)
      setBabyLoading(false)
    }
  }, [user])

  const loadBabyProfile = async () => {
    setBabyLoading(true)
    try {
      const q = query(collection(db, "users", user.uid, "babies"))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        setBaby({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() })
      } else {
        setBaby(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setBabyLoading(false)
    }
  }

  if (loading || (user && babyLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFF9F5" }}>
        <div className="text-center">
          <img src="/logo.png" alt="얌얌" className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <p className="text-lg font-bold" style={{ color: "#FF8FAB" }}>얌얌</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  if (page === "babyProfile") {
    return (
      <BabyProfilePage
        onComplete={() => { loadBabyProfile(); setPage("home") }}
      />
    )
  }

  if (page === "ingredients") return <IngredientsPage onBack={() => setPage("home")} />
  if (page === "recipe") return <RecipePage onBack={() => setPage("home")} baby={baby} />
  if (page === "mealLog") return <MealLogPage onBack={() => setPage("home")} baby={baby} />
  if (page === "mealSchedule") return <MealSchedulePage onBack={() => setPage("home")} baby={baby} />

  return <HomePage onNavigate={setPage} baby={baby} />
}

export default App
