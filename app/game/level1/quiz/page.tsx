"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function Level1Quiz() {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [quizCompleted, setQuizCompleted] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [])

  const fetchQuiz = async () => {
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send recent code context from localStorage if present
        body: JSON.stringify({
          level: 1,
          player_code: localStorage.getItem("ss_level1_generated_code") ?? "",
        }),
      })
      const data = await response.json()
      if (Array.isArray(data?.questions)) {
        setQuestions(data.questions as QuizQuestion[])
      } else {
        setQuestions([])
      }
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch quiz:", error)
      setQuestions([])
      setLoading(false)
    }
  }

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return
    setSelectedAnswer(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !questions) return
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer
    if (isCorrect) {
      setScore(score + 1)
    }
    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (!questions) return
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleRetry = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setQuizCompleted(false)
    fetchQuiz()
  }

  const handleGoToNextLevel = () => {
    router.push("/game/Level2")
  }

  const handleBackToLevel = () => {
    router.push("/game/level1")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐚</div>
          <p className="text-white text-2xl font-bold">Generating your quiz...</p>
          <p className="text-cyan-100 mt-2">The seahorse is preparing questions!</p>
        </div>
      </div>
    )
  }

  if (quizCompleted && questions) {
    const percentage = (score / questions.length) * 100
    const passed = percentage >= 60

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border-4 border-cyan-500">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {passed ? "🎉" : "🌊"}
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
              {passed ? "Amazing Work!" : "Keep Swimming!"}
            </h1>
            <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl p-6 mb-6">
              <p className="text-5xl font-bold text-blue-600 mb-2">
                {score}/{questions.length}
              </p>
              <p className="text-gray-600">Correct Answers</p>
              <p className="text-2xl font-bold text-cyan-600 mt-2">{percentage.toFixed(0)}%</p>
            </div>

            {passed ? (
              <p className="text-gray-700 mb-6">
                🐚 Excellent! You've mastered the basics. Ready for the next level?
              </p>
            ) : (
              <p className="text-gray-700 mb-6">
                🌊 Don't give up! Try the level again to learn more, then retake the quiz!
              </p>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleBackToLevel}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all"
              >
                ↩ Back to Level
              </button>
              <button
                onClick={handleRetry}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all"
              >
                🔄 Retry Quiz
              </button>
              {passed && (
                <button
                  onClick={handleGoToNextLevel}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all"
                >
                  ➜ Next Level
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <p className="text-xl text-gray-800">Failed to load quiz. Please try again.</p>
          <button
            onClick={handleBackToLevel}
            className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold"
          >
            Back to Level
          </button>
        </div>
      </div>
    )
  }

  const question = questions![currentQuestion]
  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border-4 border-cyan-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🐚</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Level 1 Quiz</h1>
              <p className="text-sm text-gray-500">Test your coding knowledge!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Question</p>
            <p className="text-2xl font-bold text-cyan-600">
              {currentQuestion + 1}/{questions.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6">
          <p className="text-xl font-semibold text-gray-800">{question.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrectOption = index === question.correctAnswer
            
            let bgColor = "bg-white hover:bg-cyan-50"
            let borderColor = "border-gray-300"
            let textColor = "text-gray-800"

            if (showExplanation) {
              if (isCorrectOption) {
                bgColor = "bg-green-100"
                borderColor = "border-green-500"
                textColor = "text-green-800"
              } else if (isSelected && !isCorrectOption) {
                bgColor = "bg-red-100"
                borderColor = "border-red-500"
                textColor = "text-red-800"
              }
            } else if (isSelected) {
              bgColor = "bg-cyan-100"
              borderColor = "border-cyan-500"
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 rounded-xl border-2 ${bgColor} ${borderColor} transition-all text-left ${
                  showExplanation ? "cursor-default" : "cursor-pointer hover:shadow-md"
                }`}
                disabled={showExplanation}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${textColor}`}>
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className={`${textColor} font-medium`}>{option}</span>
                  {showExplanation && isCorrectOption && <span className="ml-auto text-green-600 text-xl">✓</span>}
                  {showExplanation && isSelected && !isCorrectOption && <span className="ml-auto text-red-600 text-xl">✗</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`rounded-xl p-4 mb-6 ${isCorrect ? "bg-green-50 border-2 border-green-300" : "bg-blue-50 border-2 border-blue-300"}`}>
            <p className="font-semibold text-gray-800 mb-2">
              {isCorrect ? "🎉 Correct!" : "💡 Learning Moment"}
            </p>
            <p className="text-gray-700">{question.explanation}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!showExplanation ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`flex-1 py-3 rounded-full font-semibold shadow-lg transition-all ${
                selectedAnswer === null
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-xl"
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {currentQuestion < questions.length - 1 ? "Next Question →" : "See Results 🎯"}
            </button>
          )}
        </div>

        {/* Score Display */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Current Score: <span className="font-bold text-cyan-600">{score}/{currentQuestion + (showExplanation ? 1 : 0)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

