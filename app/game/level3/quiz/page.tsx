"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CodeEditor from "@/components/CodeEditor"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function Level3Quiz() {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [codeAnswer, setCodeAnswer] = useState("")
  const [codeCorrect, setCodeCorrect] = useState<boolean | null>(null)

  useEffect(() => {
    if (!localStorage.getItem("ss_level3_generated_code")) {
      const defaultCode = [
        "# Level 3 - example if/else",
        "forwards = 3",
        "if forwards >= 3:",
        "    print(\"move forward\")",
        "    print(\"move forward\")",
        "    print(\"move forward\")",
        "else:",
        "    print(\"Goal not reached yet - keep going!\")",
      ].join("\n")
      try { localStorage.setItem("ss_level3_generated_code", defaultCode) } catch (_) {}
    }
    fetchQuiz()
  }, [])

  const fetchQuiz = async () => {
    const hardcoded: QuizQuestion[] = [
      {
        question: "When is the key collected in Level 3's program?",
        options: [
          "After the first forward",
          "After two forward moves followed by a left",
          "After the final right turn",
          "Only at the door",
        ],
        correctAnswer: 1,
        explanation: "The sequence is F, F, L — the left turn after two forwards triggers key collection.",
      },
      {
        question: "When does the door open?",
        options: [
          "Immediately after a right turn",
          "Only if key_collected is True",
          "After any two forwards",
          "At the start of the program",
        ],
        correctAnswer: 1,
        explanation: "The generator emits an if key_collected: open door ... else: door remains closed.",
      },
      {
        question: "Which sequence completes the level?",
        options: [
          "F, F, L, R, F, F, R",
          "F, L, F, R, F, R, F",
          "F, F, R, L, F, R, F",
          "F, R, F, F, L, R, F",
        ],
        correctAnswer: 0,
        explanation: "Two forwards, then left (collect key), right, two forwards, right into the door.",
      },
    ]
    setQuestions(hardcoded)
    setLoading(false)
  }

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return
    setSelectedAnswer(index)
  }
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !questions) return
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer
    if (isCorrect) setScore((s) => s + 1)
    setShowExplanation(true)
  }
  const handleNextQuestion = () => {
    if (!questions) return
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleBackToLevel = () => router.push("/game/level3")
  const handleGoToNextLevel = () => router.push("/game/level4")

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-b from-sky-400 to-blue-600">Generating your quiz...</div>
  }

  if (quizCompleted) {
    const total = questions ? questions.length : 3
    const passed = (score / total) * 100 >= 60
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border-4 border-cyan-500 text-center">
          <div className="text-6xl mb-4">{passed ? "🎉" : "🌊"}</div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-4">{passed ? "Great job!" : "Keep swimming!"}</h1>
          <p className="text-xl text-gray-700 mb-6">Score: {score}/{total}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleBackToLevel} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold">↩ Back to Level</button>
            {passed && (
              <button onClick={handleGoToNextLevel} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold">➜ Next Level</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const q = questions![currentQuestion]
  const total = questions!.length
  const isCorrect = selectedAnswer === q.correctAnswer

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border-4 border-cyan-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🐚</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Level 3 Quiz</h1>
              <p className="text-sm text-gray-500">Test your coding knowledge!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Question</p>
            <p className="text-2xl font-bold text-cyan-600">{currentQuestion + 1}/{total}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / total) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6">
          <p className="text-xl font-semibold text-gray-800">{q.question}</p>
        </div>

        <div className="space-y-3 mb-6">
          {q.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrectOption = index === q.correctAnswer
            let bgColor = "bg-white hover:bg-cyan-50"
            let borderColor = "border-gray-300"
            let textColor = "text-gray-800"
            if (showExplanation) {
              if (isCorrectOption) { bgColor = "bg-green-100"; borderColor = "border-green-500"; textColor = "text-green-800" }
              else if (isSelected) { bgColor = "bg-red-100"; borderColor = "border-red-500"; textColor = "text-red-800" }
            } else if (isSelected) { bgColor = "bg-cyan-100"; borderColor = "border-cyan-500" }
            return (
              <button key={index} onClick={() => setSelectedAnswer(index)} className={`w-full p-4 rounded-xl border-2 ${bgColor} ${borderColor} transition-all text-left ${showExplanation ? "cursor-default" : "cursor-pointer hover:shadow-md"}`} disabled={showExplanation}>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${textColor}`}>{String.fromCharCode(65 + index)}.</span>
                  <span className={`${textColor} font-medium`}>{option}</span>
                  {showExplanation && isCorrectOption && <span className="ml-auto text-green-600 text-xl">✓</span>}
                  {showExplanation && isSelected && !isCorrectOption && <span className="ml-auto text-red-600 text-xl">✗</span>}
                </div>
              </button>
            )
          })}
        </div>

        {showExplanation && (
          <div className={`rounded-xl p-4 mb-6 ${isCorrect ? "bg-green-50 border-2 border-green-300" : "bg-blue-50 border-2 border-blue-300"}`}>
            <p className="font-semibold text-gray-800 mb-2">{isCorrect ? "🎉 Correct!" : "💡 Learning Moment"}</p>
            <p className="text-gray-700">{q.explanation}</p>
          </div>
        )}

        <div className="flex gap-3">
          {!showExplanation ? (
            <button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className={`flex-1 py-3 rounded-full font-semibold shadow-lg transition-all ${selectedAnswer === null ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-xl"}`}>
              Submit Answer
            </button>
          ) : (
            <button onClick={handleNextQuestion} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all">
              {currentQuestion < total - 1 ? "Next Question →" : "Finish Quiz"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


