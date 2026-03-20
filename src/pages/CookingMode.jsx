import { useState, useEffect, useRef } from "react"

function CookingMode({ recipe, onBack }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [timer, setTimer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)

  const steps = recipe.steps || []
  const totalSteps = steps.length
  const step = steps[currentStep]

  const speak = (text) => {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "ko-KR"
    utter.rate = 0.9
    window.speechSynthesis.speak(utter)
  }

  useEffect(() => {
    if (step) {
      speak(`${currentStep + 1}단계. ${step.text}`)
      if (step.timerSec > 0) {
        setTimer(step.timerSec)
        setTimeLeft(step.timerSec)
        setTimerRunning(false)
      } else {
        setTimer(null)
        setTimeLeft(0)
        setTimerRunning(false)
      }
    }
    return () => window.speechSynthesis.cancel()
  }, [currentStep])

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setTimerRunning(false)
            speak("타이머가 완료되었습니다!")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "ko-KR"
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()

      if (transcript.includes("다음")) goNext()
      else if (transcript.includes("이전")) goPrev()
      else if (transcript.includes("반복")) speak(`${currentStep + 1}단계. ${step.text}`)
      else if (transcript.includes("타이머")) startTimer()
      else if (transcript.includes("처음")) setCurrentStep(0)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => {
      if (isListening) recognition.start()
    }

    recognitionRef.current = recognition
  }, [currentStep, isListening])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
      speak("음성 인식을 시작합니다. 다음, 이전, 반복, 타이머 라고 말해보세요")
    }
  }

  const goNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(prev => prev + 1)
    else speak("모든 단계가 완료되었습니다! 맛있게 먹여주세요!")
  }

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  const startTimer = () => {
    if (timer > 0) {
      setTimeLeft(timer)
      setTimerRunning(true)
      speak(`${formatTime(timer)} 타이머를 시작합니다`)
    }
  }

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m > 0 ? `${m}분 ` : ""}${s > 0 ? `${s}초` : ""}`
  }

  const formatDisplay = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#3D3D3D" }}>
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <button
          onClick={() => { window.speechSynthesis.cancel(); recognitionRef.current?.stop(); onBack() }}
          className="text-base font-bold"
          style={{ color: "#A8D8B9" }}
        >
          ← 종료
        </button>
        <h2 className="text-base font-bold" style={{ color: "#fff" }}>{recipe.title}</h2>
        <div className="text-sm" style={{ color: "#888" }}>{currentStep + 1} / {totalSteps}</div>
      </header>

      <div className="mx-5 mb-6 h-1.5 rounded-full" style={{ background: "#555" }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "#FF8FAB" }}
        />
      </div>

      <div className="flex-1 px-5 flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-4">
            <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: "#FF8FAB", color: "#fff" }}>
              {currentStep + 1}단계
            </span>
          </div>

          <p className="text-2xl font-bold leading-relaxed mb-8" style={{ color: "#fff" }}>
            {step?.text}
          </p>

          {timer > 0 && (
            <div className="mb-8">
              <div
                className="inline-flex flex-col items-center px-8 py-5 rounded-2xl cursor-pointer"
                style={{ background: timerRunning ? "#FF8FAB" : "#555" }}
                onClick={timerRunning ? () => { clearInterval(timerRef.current); setTimerRunning(false) } : startTimer}
              >
                <p className="text-4xl font-bold font-mono" style={{ color: "#fff" }}>
                  {formatDisplay(timeLeft)}
                </p>
                <p className="text-sm mt-1" style={{ color: timerRunning ? "rgba(255,255,255,0.7)" : "#888" }}>
                  {timerRunning ? "탭하여 정지" : "탭하여 시작"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pb-10">
          <div className="flex justify-center mb-6">
            <button
              onClick={toggleListening}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-bold"
              style={{
                background: isListening ? "#FF8FAB" : "#555",
                color: isListening ? "#fff" : "#aaa"
              }}
            >
              <span>{isListening ? "🎙" : "🎤"}</span>
              <span>{isListening ? "음성 인식 중..." : "음성 인식 시작"}</span>
            </button>
          </div>

          {isListening && (
            <div className="flex justify-center gap-3 mb-6 flex-wrap">
              {["다음", "이전", "반복", "타이머"].map(cmd => (
                <span key={cmd} className="text-sm px-3 py-1 rounded-full" style={{ background: "#555", color: "#aaa" }}>
                  "{cmd}"
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={goPrev}
              disabled={currentStep === 0}
              className="flex-1 py-4 rounded-2xl text-base font-bold"
              style={{
                background: currentStep === 0 ? "#444" : "#555",
                color: currentStep === 0 ? "#666" : "#fff"
              }}
            >
              ← 이전
            </button>
            <button
              onClick={goNext}
              className="py-4 rounded-2xl text-base font-bold"
              style={{
                background: "#FF8FAB",
                color: "#fff",
                flex: 2
              }}
            >
              {currentStep === totalSteps - 1 ? "🎉 완성!" : "다음 →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookingMode
