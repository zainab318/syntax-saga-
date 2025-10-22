"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import ProgrammingBar, { type CommandBlock } from "@/components/ProgrammingBar"
import AnimatedSeahorse, { type SeahorsePosition } from "@/components/AnimatedSeahorse"

// 🔒 Fixed Camera Controller
function CameraController() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(25, 15, 15)
    camera.lookAt(4, 2, 0)
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

// 🏝 Level 2 base model
function Base() {
  const { scene } = useGLTF("/Level2_base.glb")
  scene.position.set(0, 1, 0)
  scene.scale.set(1.5, 1.5, 1.5)
  return <primitive object={scene} />
}

// 🪙 Coin model
function Coin({ visible }: { visible: boolean }) {
  const { scene } = useGLTF("/coin23d.glb")
  
  if (!visible) return null
  
  scene.position.set(1, 2, -6) // Position at second step location (one step forward from start)
  scene.scale.set(1.2, 1.2, 1.2)
  return <primitive object={scene} />
}

// 🎮 Level 2 main scene
export default function Level2() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [forwardSteps, setForwardSteps] = useState(0)
  const [rightTurns, setRightTurns] = useState(0)
  const [coinCollected, setCoinCollected] = useState(false)
  const [seahorsePosition, setSeahorsePosition] = useState<SeahorsePosition>({
    x: -3.5,
    z: -6,
    rotation: 0,
  })

  const BOUNDARY = { minX: -8, maxX: 8, minZ: -10, maxZ: 8 }
  const REQUIRED_FORWARD_STEPS = 3 
  const REQUIRED_RIGHT_TURNS = 2 
  const COIN_POSITION = { x: 1, z: -6 } // Position of the coin (second step from start)
  const COLLECTION_DISTANCE = 2 // Distance threshold for collecting the coin

  const isWithinBounds = (x: number, z: number) =>
    x >= BOUNDARY.minX && x <= BOUNDARY.maxX && z >= BOUNDARY.minZ && z <= BOUNDARY.maxZ

  const checkCoinCollection = (x: number, z: number): boolean => {
    const distance = Math.sqrt(Math.pow(x - COIN_POSITION.x, 2) + Math.pow(z - COIN_POSITION.z, 2))
    return distance < COLLECTION_DISTANCE
  }

  const isLevelComplete = (currentForwardSteps: number, currentRightTurns: number): boolean => {
    return currentForwardSteps >= REQUIRED_FORWARD_STEPS && currentRightTurns >= REQUIRED_RIGHT_TURNS
  }

  const shouldCheckBoundaries = (currentForwardSteps: number, currentRightTurns: number): boolean => {
    return currentForwardSteps >= REQUIRED_FORWARD_STEPS && currentRightTurns >= REQUIRED_RIGHT_TURNS
  }

  const executeProgram = (commands: CommandBlock[]) => {
    if (commands.length === 0) return
    setIsExecuting(true)
    setErrorMessage(null)
    setForwardSteps(0) // Reset step counter for new program
    setRightTurns(0) // Reset right turn counter for new program
    setCoinCollected(false) // Reset coin collection
    executeNextCommand(commands, 0, { ...seahorsePosition })
  }

  const executeNextCommand = (commands: CommandBlock[], index: number, currentPos: SeahorsePosition, currentStepCount: number = 0, currentRightTurnCount: number = 0) => {
    if (index >= commands.length) {
      setIsExecuting(false)
      return
    }

    const command = commands[index]
    const newPosition = { ...currentPos }
    let newStepCount = currentStepCount
    let newRightTurnCount = currentRightTurnCount

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
        newRightTurnCount += 1 // Count right turns
        setRightTurns(newRightTurnCount) // Update state
        break
      case "turnAround":
        newPosition.rotation += Math.PI
        break
      case "wait":
        break
    }

    if (newPosition.rotation > Math.PI || newPosition.rotation < -Math.PI)
      newPosition.rotation = Math.atan2(Math.sin(newPosition.rotation), Math.cos(newPosition.rotation))

    setSeahorsePosition(newPosition)

    // 🪙 Check if coin is collected
    if (!coinCollected && checkCoinCollection(newPosition.x, newPosition.z)) {
      setCoinCollected(true)
    }

    // 🏁 Check for level completion
    if (isLevelComplete(newStepCount, newRightTurnCount)) {
      setTimeout(() => {
        setLevelCompleted(true)
        setIsExecuting(false)
      }, 1000)
      return
    }

    // 🚧 No boundary restrictions in Level 2 - seahorse can move freely

    setTimeout(() => {
      executeNextCommand(commands, index + 1, newPosition, newStepCount, newRightTurnCount)
    }, 1200)
  }

  const handleRefresh = () => {
    setSeahorsePosition({ x: -3.5, z: -6, rotation: 0 })
    setErrorMessage(null)
    setLevelCompleted(false)
    setForwardSteps(0)
    setRightTurns(0)
    setCoinCollected(false)
  }

  const handleReplay = () => {
    setLevelCompleted(false)
    setSeahorsePosition({ x: -3.5, z: -6, rotation: 0 })
    setForwardSteps(0)
    setRightTurns(0)
    setCoinCollected(false)
  }

  const handleNextLevel = () => {
    window.location.href = "/game/level3" // 🔗 Navigate to Level 3
  }

  const handleReset = () => {
    window.location.href = "/game/level1" // 🔗 Navigate back to Level 1
  }

  return (
    <div className="w-screen h-screen bg-sky-200 relative flex flex-col">
      {/* 3D View */}
      <div className="flex-1">
        <Canvas camera={{ position: [12, 10, 12], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 15, 10]} intensity={1.4} />

          <Suspense fallback={null}>
            <Sea />
            <Base />
            <Coin visible={!coinCollected} />
            <AnimatedSeahorse
              position={seahorsePosition}
              isAnimating={isExecuting}
              onAnimationComplete={() => {}}
            />
            <CameraController />
          </Suspense>
        </Canvas>
      </div>

      {/* Programming Bar */}
      <div className="bg-sky-200 p-4">
        <ProgrammingBar onExecuteProgram={executeProgram} isExecuting={isExecuting} onRefresh={handleRefresh} />
      </div>

      {/* Error Message */}
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
            <p className="text-gray-600 mb-6">You used <b>9 commands</b>. Try using <b>6</b> or fewer for 3 stars!</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleReplay}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
              >
                ↻ Replay
              </button>
              <button
                onClick={handleReset}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
              >
                ⟳ Reset
              </button>
              <button
                onClick={handleNextLevel}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
              >
                ➜ Next
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

useGLTF.preload("/Sea.glb")
useGLTF.preload("/Level2_base.glb")
useGLTF.preload("/SeaHorse.glb")
useGLTF.preload("/coin23d.glb")