"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import ProgrammingBar, { type CommandBlock } from "@/components/ProgrammingBar"
import AnimatedSeahorse, { type SeahorsePosition } from "@/components/AnimatedSeahorse"
import CodeDisplay from "@/components/CodeDisplay"
import { generatePythonCode } from "@/lib/codeGenerator"

// 🔒 Fixed Camera Controller
function CameraController() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(26, 17, 22)
    camera.lookAt(-2, 2, -2)
    // @ts-ignore
    ;(camera as any).fov = 55
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

// 🌊 Sea model
function Sea() {
  const { scene } = useGLTF("/Sea.glb")
  scene.position.set(0, -3, 0)
  scene.scale.set(3, 3, 3)
  return <primitive object={scene} />
}

// 🏝 Base model
function Base() {
  const { scene } = useGLTF("/Level1_base (1).glb")
  scene.position.set(0, 1, 0)
  scene.scale.set(1.5, 1.5, 1.5)
  return <primitive object={scene} />
}

// 🎮 Level 1 Scene
export default function Level1() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [forwardSteps, setForwardSteps] = useState(0)
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [seahorsePosition, setSeahorsePosition] = useState<SeahorsePosition>({
    x: 1,
    z: -1.6,
    rotation: 0,
  })

  const BOUNDARY = { minX: -5, maxX: 15, minZ: -8, maxZ: 8 }
  const REQUIRED_FORWARD_STEPS = 3 // ✅ Level completes after exactly 3 forward steps

  const isWithinBounds = (x: number, z: number): boolean => {
    return x >= BOUNDARY.minX && x <= BOUNDARY.maxX && z >= BOUNDARY.minZ && z <= BOUNDARY.maxZ
  }

 
  const isLevelComplete = (currentSteps: number): boolean => {
    return currentSteps >= REQUIRED_FORWARD_STEPS
  }
  

  const executeProgram = (commands: CommandBlock[]) => {
    if (commands.length === 0) return
    
    // Count total forward moves in the program
    const totalForwardMoves = commands.filter(cmd => cmd.type === "forward").length
    
    // Check if there are more than 3 forward moves
    if (totalForwardMoves > REQUIRED_FORWARD_STEPS) {
      setErrorMessage("🌊 Oops! Seahorse cannot go into the water!")
      setTimeout(() => setErrorMessage(null), 3000)
      return
    }
    
    setIsExecuting(true)
    setErrorMessage(null)
    setForwardSteps(0) // Reset step counter for new program
    executeNextCommand(commands, 0, { ...seahorsePosition })
  }

  const executeNextCommand = (commands: CommandBlock[], index: number, currentPos: SeahorsePosition, currentStepCount: number = 0) => {
    if (index >= commands.length) {
      setIsExecuting(false)
      return
    }

    const command = commands[index]
    const newPosition = { ...currentPos }
    let newStepCount = currentStepCount

    switch (command.type) {
      case "forward":
        newPosition.x += Math.cos(newPosition.rotation) * 4.5
        newPosition.z += Math.sin(newPosition.rotation) * 4.5
        newStepCount += 1 // Count forward steps
        setForwardSteps(newStepCount) // Update state
        break
      case "backward":
        newPosition.x -= Math.cos(newPosition.rotation) * 4.5
        newPosition.z -= Math.sin(newPosition.rotation) * 4.5
        break
      case "turnLeft":
        newPosition.rotation += Math.PI / 2
        break
      case "turnRight":
        newPosition.rotation -= Math.PI / 2
        break
      case "turnAround":
        newPosition.rotation += Math.PI
        break
      case "wait":
        break
    }

    if (!isWithinBounds(newPosition.x, newPosition.z)) {
      setErrorMessage("⚠️ Oops! The seahorse can't swim off the platform!")
      setIsExecuting(false)
      setTimeout(() => setErrorMessage(null), 3000)
      return
    }

    if (newPosition.rotation > Math.PI || newPosition.rotation < -Math.PI)
      newPosition.rotation = Math.atan2(Math.sin(newPosition.rotation), Math.cos(newPosition.rotation))

    setSeahorsePosition(newPosition)

    // 🏁 Check for level completion after forward step
    if (command.type === "forward" && isLevelComplete(newStepCount)) {
      setTimeout(() => {
        setLevelCompleted(true)
        setIsExecuting(false)
      }, 1000)
      return
    }

    setTimeout(() => {
      executeNextCommand(commands, index + 1, newPosition, newStepCount)
    }, 1200)
  }

  const handleReplay = () => {
    setLevelCompleted(false)
    setSeahorsePosition({ x: 1, z: -1.6, rotation: 0 })
    setForwardSteps(0)
  }

  const handleRefresh = () => {
    setSeahorsePosition({ x: 1, z: -1.6, rotation: 0 })
    setLevelCompleted(false)
    setErrorMessage(null)
    setForwardSteps(0)
  }

  const handleNextLevel = () => {
    window.location.href = "/game/Level2" // 🔗 Navigate to Level 2
  }

  const handleTakeQuiz = () => {
    window.location.href = "/game/level1/quiz" // 🔗 Navigate to Quiz
  }

  const handleReset = () => {
    window.location.href = "/game/level1" // 🔗 Navigate back to Level 1
  }

  const handleCommandsChange = (commands: CommandBlock[]) => {
    const code = generatePythonCode(commands, { level: 1 })
    setGeneratedCode(code)
    try {
      localStorage.setItem("ss_level1_generated_code", code)
    } catch (_) {}
  }

  return (
    <div className="w-screen h-screen bg-sky-200 relative flex flex-col">
      {/* Main Content Area - Canvas and Code Display */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Left Side - 3D Canvas */}
        <div className="flex-[1.2] min-w-[520px]">
        <Canvas camera={{ fov: 55 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.4} />

            <Suspense fallback={null}>
              <Sea />
              <Base />
              <AnimatedSeahorse position={seahorsePosition} isAnimating={isExecuting} onAnimationComplete={() => {}} />
              <CameraController />
            </Suspense>
          </Canvas>
        </div>

        {/* Right Side - Code Display */}
        <div className="w-[380px]">
          <CodeDisplay code={generatedCode} />
        </div>
      </div>

      {/* Programming Bar */}
      <div className="bg-sky-200 p-4">
        <ProgrammingBar 
          onExecuteProgram={executeProgram} 
          isExecuting={isExecuting} 
          onRefresh={handleRefresh}
          onCommandsChange={handleCommandsChange}
        />
      </div>

      {/* Error Popup */}
      {errorMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-8 py-4 rounded-lg shadow-2xl text-xl font-bold animate-bounce z-50">
          {errorMessage}
        </div>
      )}

    {/* ✅ Level Completed Popup */}
      {levelCompleted && (
  <div className="fixed inset-0 bg-sky-100 bg-opacity-70 flex items-center justify-center z-50">
    <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-96 text-center border-4 border-yellow-300">
      {/* Stars */}
      <div className="flex justify-center mb-4">
        <span className="text-yellow-400 text-4xl">⭐</span>
        <span className="text-yellow-400 text-4xl mx-1">⭐</span>
        <span className="text-gray-300 text-4xl">⭐</span>
      </div>

      <h2 className="text-2xl font-extrabold text-gray-800 mb-2">WELL DONE!</h2>
      <p className="text-gray-600 mb-6">You have completed the level successfully.</p>

      <div className="flex justify-center gap-3">
        <button
          onClick={handleReset}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
        >
          ⟳ Replay
        </button>
         
        <button
          onClick={handleTakeQuiz}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
        >
          ➜ Take Quiz
        </button>
      </div>

      {/* Close button */}
      <button
        onClick={() => setLevelCompleted(false)}
        className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-lg font-bold"
      >
        ×
      </button>
    </div>
  </div>
)}


     
    </div>
  )
}

// ✅ Preload
useGLTF.preload("/Sea.glb")
useGLTF.preload("/Level1_base (1).glb")
useGLTF.preload("/Seahorse.glb")
