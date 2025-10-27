"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface LevelProgress {
  level1: boolean
  level2: boolean
  level3: boolean
}

export default function LevelsPage() {
  const [user, setUser] = useState({ uid: "demo_user", email: "demo@example.com" })
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<LevelProgress>({
    level1: false,
    level2: false,
    level3: false
  })
  const router = useRouter()

  useEffect(() => {
    // Load user progress from localStorage
    loadUserProgress()
    setLoading(false)
  }, [])

  const loadUserProgress = () => {
    try {
      const savedProgress = localStorage.getItem("syntax_saga_progress")
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress))
      } else {
        // Default: only level 1 is unlocked
        const defaultProgress = { level1: true, level2: false, level3: false }
        setProgress(defaultProgress)
        localStorage.setItem("syntax_saga_progress", JSON.stringify(defaultProgress))
      }
    } catch (error) {
      console.error("Error loading progress:", error)
    }
  }

  const handleLogout = () => {
    // Demo mode - just redirect to home
    router.push("/")
  }

  const updateProgress = (level: keyof LevelProgress) => {
    const newProgress = { ...progress, [level]: true }
    setProgress(newProgress)
    localStorage.setItem("syntax_saga_progress", JSON.stringify(newProgress))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐚</div>
          <p className="text-white text-2xl font-bold">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🐚</span>
              <div>
                <h1 className="text-2xl font-bold text-white">Syntax Saga</h1>
                <p className="text-blue-100">Welcome to your coding adventure!</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Adventure</h2>
          <p className="text-blue-100 text-xl">Complete levels to unlock new challenges!</p>
        </div>

        {/* Levels Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Level 1 */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-blue-300">
            <div className="bg-blue-500 h-2 relative">
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Level 1</h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Beginner
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">First Steps</h4>
              <p className="text-gray-600 mb-6">Learn the basics of movement and navigation</p>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-700 font-semibold">Features</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Basic Movement</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Code Editor</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">AI Hints</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">3D Environment</span>
                </div>
              </div>

              <Link
                href="/game/level1"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>▶</span>
                Start Level
              </Link>
            </div>
          </div>

          {/* Level 2 */}
          <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border-4 ${
            progress.level1 ? 'border-green-300' : 'border-gray-300'
          }`}>
            <div className={`h-2 relative ${
              progress.level1 ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                progress.level1 ? 'bg-green-600' : 'bg-gray-500'
              }`}>
                <span className="text-white text-sm font-bold">2</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Level 2</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  progress.level1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {progress.level1 ? 'Intermediate' : 'Locked'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Navigation Challenge</h4>
              <p className="text-gray-600 mb-6">
                {progress.level1 
                  ? 'Master turning and complex navigation patterns' 
                  : 'Complete Level 1 to unlock this challenge'
                }
              </p>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-700 font-semibold">Features</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Advanced Movement</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Turn Commands</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Path Planning</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">3D Environment</span>
                </div>
              </div>

              {progress.level1 ? (
                <Link
                  href="/game/Level2"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <span>▶</span>
                  Start Level
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <span>🔒</span>
                  Complete Level 1 First
                </button>
              )}
            </div>
          </div>

          {/* Level 3 */}
          <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border-4 ${
            progress.level2 ? 'border-purple-300' : 'border-gray-300'
          }`}>
            <div className={`h-2 relative ${
              progress.level2 ? 'bg-purple-500' : 'bg-gray-400'
            }`}>
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                progress.level2 ? 'bg-purple-600' : 'bg-gray-500'
              }`}>
                <span className="text-white text-sm font-bold">3</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Level 3</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  progress.level2 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {progress.level2 ? 'Expert' : 'Locked'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Coming Soon</h4>
              <p className="text-gray-600 mb-6">
                {progress.level2 
                  ? 'Advanced programming challenges await' 
                  : 'Complete Level 2 to unlock this challenge'
                }
              </p>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-700 font-semibold">Features</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Complex Logic</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Loops</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Conditionals</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Advanced AI</span>
                </div>
              </div>

              <button
                disabled
                className="w-full bg-teal-400 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <span>▶</span>
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">Your Progress</h3>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2 ${
                progress.level1 ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
              }`}>
                {progress.level1 ? '✓' : '1'}
              </div>
              <p className="text-blue-100">Level 1</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2 ${
                progress.level2 ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
              }`}>
                {progress.level2 ? '✓' : '2'}
              </div>
              <p className="text-blue-100">Level 2</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2 ${
                progress.level3 ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
              }`}>
                {progress.level3 ? '✓' : '3'}
              </div>
              <p className="text-blue-100">Level 3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
