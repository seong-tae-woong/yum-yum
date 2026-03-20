import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "../firebase"

function LoginPage() {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("로그인 실패:", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "#FFF9F5" }}>
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="얌얌" className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-5xl font-bold" style={{ color: "#FF8FAB" }}>얌얌</h1>
        <p className="text-lg mt-3" style={{ color: "#A8D8B9" }}>우리가 만드는 맛있는 이야기 👶</p>
      </div>

      <div className="rounded-3xl shadow-md p-8 w-full max-w-sm" style={{ background: "#fff" }}>
        <h2 className="text-xl font-bold text-center mb-6" style={{ color: "#3D3D3D" }}>시작하기</h2>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border rounded-xl py-3 px-4 hover:bg-gray-50 transition"
          style={{ borderColor: "#eee" }}
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
          <span className="text-base" style={{ color: "#3D3D3D" }}>Google로 계속하기</span>
        </button>

        <p className="text-center text-xs mt-6" style={{ color: "#bbb" }}>
          가입하면 서비스 이용약관에 동의하는 것으로 간주됩니다
        </p>
      </div>
    </div>
  )
}

export default LoginPage
