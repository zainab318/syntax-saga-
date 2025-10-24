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

interface CodeQuestion {
  type: 'code'
  question: string
  hint: string
  initialCode: string
  expectedOutput: string
  explanation: string
}

export default function Level2Quiz() {
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
    // Seed localStorage with the latest program code if none exists
    if (!localStorage.getItem("ss_level2_generated_code")) {
      const defaultCode = [
        "steps = 3",
        "turns = 2",
        "",
        "print(\"The seahorse will move forward \" + str(steps) + \" times!\")",
        "",
        "print(\"move forward\")",
        "print(\"move forward\")",
        "print(\"move forward\")",
        "",
        "print(\"coin collected\")",
        "",
        "print(\"The seahorse will turn right \" + str(turns) + \" times!\")",
        "",
        "print(\"turn right\")",
        "print(\"turn right\")",
      ].join("\n")
      try { localStorage.setItem("ss_level2_generated_code", defaultCode) } catch (_) {}
    }
    fetchQuiz()
  }, [])

  const fetchQuiz = async () => {
    try {
      console.log("Fetching quiz for Level 2...")
      const playerCode = localStorage.getItem("ss_level2_generated_code") ?? ""
      console.log("Player code:", playerCode)
      
      // Level 2 specific questions based on the code generator format
      const hardcodedQuestions: QuizQuestion[] = [
        {
          question: "What does the variable 'steps' represent in Level 2?",
          options: [
            "Number of turns",
            "Number of forward moves", 
            "Number of coins collected",
            "Number of seconds to wait"
          ],
          correctAnswer: 1,
          explanation: "The 'steps' variable stores how many times the seahorse will move forward (3 times)"
        },
        {
          question: "What does this code do: print(\"The seahorse will move forward \" + str(steps) + \" times!\")?",
          options: [
            "Moves the seahorse forward",
            "Shows a friendly message with the number of steps",
            "Collects a coin",
            "Turns the seahorse right"
          ],
          correctAnswer: 1,
          explanation: "This creates a friendly message that shows how many times the seahorse will move forward using string concatenation"
        },
        {
          question: "When does the seahorse collect the coin in Level 2?",
          options: [
            "Before moving forward",
            "After the 1st forward move",
            "After the 3rd forward move",
            "After turning right"
          ],
          correctAnswer: 2,
          explanation: "The coin is collected right after the seahorse completes all 3 forward moves"
        }
      ]
      
      setQuestions(hardcodedQuestions)
      console.log("Using hardcoded questions:", hardcodedQuestions.length)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching quiz:", error)
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
      // After 3 MCQs, show code editor question
      if (currentQuestion === questions.length - 1) {
        setCurrentQuestion((q) => q + 1)
        setSelectedAnswer(null)
        setShowExplanation(false)
      } else {
        setQuizCompleted(true)
      }
    }
  }

  const handleCodeComplete = (isCorrect: boolean) => {
    setCodeCorrect(isCorrect)
    if (isCorrect) setScore((s) => s + 1)
    setShowExplanation(true)
  }

  const handleCodeNext = () => {
    setQuizCompleted(true)
  }

  const handleBackToLevel = () => router.push("/game/Level2")
  const handleGoToNextLevel = () => router.push("/game/level3")

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐚</div>
          <p className="text-white text-2xl font-bold">Generating your quiz...</p>
        </div>
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <p className="text-xl text-gray-800">Failed to load quiz. Please try again.</p>
          <button onClick={handleBackToLevel} className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold">
            Back to Level
          </button>
        </div>
      </div>
    )
  }

  if (quizCompleted) {
    const totalQuestions = questions ? questions.length + 1 : 4 // 3 MCQs + 1 code question
    const percentage = (score / totalQuestions) * 100
    const passed = percentage >= 60
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border-4 border-cyan-500">
          <div className="text-center">
            <div className="text-6xl mb-4">{passed ? "🎉" : "🌊"}</div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-4">{passed ? "Great job!" : "Keep swimming!"}</h1>
            <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl p-6 mb-6">
              <p className="text-5xl font-bold text-blue-600 mb-2">{score}/{totalQuestions}</p>
              <p className="text-gray-600">Correct Answers</p>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={handleBackToLevel} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all">
                ↩ Back to Level
              </button>
              {passed && (
                <button onClick={handleGoToNextLevel} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all">
                  ➜ Next Level
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if we're on the code editor question (4th question)
  const isCodeQuestion = questions && currentQuestion === questions.length
  const totalQuestions = questions ? questions.length + 1 : 4

  if (isCodeQuestion) {
    const codeQuestion = {
      question: "🐚 Code Challenge: Create a variable and use string concatenation!",
      hint: "Create a variable called 'steps' with value 3, then use string concatenation to print a message. Example: steps = 3, then print(\"The seahorse will move \" + str(steps) + \" times!\")",
      initialCode: "",
      expectedOutput: "The seahorse will move 3 times!",
      explanation: "Excellent! You used a variable and string concatenation correctly. This is how we create dynamic messages in Python - just like in the Level 2 code generator!"
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl border-4 border-cyan-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🐚</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Level 2 Quiz</h1>
                <p className="text-sm text-gray-500">Code Challenge!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Question</p>
              <p className="text-2xl font-bold text-cyan-600">{currentQuestion + 1}/{totalQuestions}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6">
            <p className="text-xl font-semibold text-gray-800">{codeQuestion.question}</p>
          </div>

          <CodeEditor
            initialCode={codeAnswer}
            onCodeChange={setCodeAnswer}
            hint={codeQuestion.hint}
            expectedOutput={codeQuestion.expectedOutput}
            onComplete={handleCodeComplete}
          />

          {showExplanation && (
            <div className={`rounded-xl p-4 mb-6 ${codeCorrect ? "bg-green-50 border-2 border-green-300" : "bg-blue-50 border-2 border-blue-300"}`}>
              <p className="font-semibold text-gray-800 mb-2">{codeCorrect ? "🎉 Correct!" : "💡 Learning Moment"}</p>
              <p className="text-gray-700">{codeQuestion.explanation}</p>
            </div>
          )}

          <div className="flex gap-3">
            {!showExplanation ? (
              <button 
                onClick={() => setShowExplanation(true)} 
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Check My Code 🐚
              </button>
            ) : (
              <button 
                onClick={handleCodeNext} 
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Complete Quiz 🎯
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border-4 border-cyan-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🐚</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Level 2 Quiz</h1>
              <p className="text-sm text-gray-500">Test your coding knowledge!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Question</p>
            <p className="text-2xl font-bold text-cyan-600">{currentQuestion + 1}/{totalQuestions}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6">
          <p className="text-xl font-semibold text-gray-800">{question.question}</p>
        </div>

        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrectOption = index === question.correctAnswer
            let bgColor = "bg-white hover:bg-cyan-50"
            let borderColor = "border-gray-300"
            let textColor = "text-gray-800"
            if (showExplanation) {
              if (isCorrectOption) { bgColor = "bg-green-100"; borderColor = "border-green-500"; textColor = "text-green-800" }
              else if (isSelected) { bgColor = "bg-red-100"; borderColor = "border-red-500"; textColor = "text-red-800" }
            } else if (isSelected) { bgColor = "bg-cyan-100"; borderColor = "border-cyan-500" }
            return (
              <button key={index} onClick={() => handleAnswerSelect(index)} className={`w-full p-4 rounded-xl border-2 ${bgColor} ${borderColor} transition-all text-left ${showExplanation ? "cursor-default" : "cursor-pointer hover:shadow-md"}`} disabled={showExplanation}>
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
            <p className="text-gray-700">{question.explanation}</p>
          </div>
        )}

        <div className="flex gap-3">
          {!showExplanation ? (
            <button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className={`flex-1 py-3 rounded-full font-semibold shadow-lg transition-all ${selectedAnswer === null ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-xl"}`}>
              Submit Answer
            </button>
          ) : (
            <button onClick={handleNextQuestion} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all">
              {currentQuestion < questions.length - 1 ? "Next Question →" : "Code Challenge 🐚"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


