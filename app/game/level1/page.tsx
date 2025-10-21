"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { Environment, useGLTF } from "@react-three/drei"
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

  const isLevelComplete = (): boolean => {
    return forwardSteps >= REQUIRED_FORWARD_STEPS
  }

  const executeProgram = (commands: CommandBlock[]) => {
    if (commands.length === 0) return
    setIsExecuting(true)
    setErrorMessage(null)
    setForwardSteps(0) // Reset step counter for new program
    executeNextCommand(commands, 0, { ...seahorsePosition })
  }

  const executeNextCommand = (commands: CommandBlock[], index: number, currentPos: SeahorsePosition) => {
    if (index >= commands.length) {
      setIsExecuting(false)
      return
    }

    const command = commands[index]
    const newPosition = { ...currentPos }

    switch (command.type) {
      case "forward":
        newPosition.x += Math.cos(newPosition.rotation) * 4.5
        newPosition.z += Math.sin(newPosition.rotation) * 4.5
        setForwardSteps(prev => prev + 1) // Count forward steps
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
    if (command.type === "forward" && isLevelComplete()) {
      setTimeout(() => {
        setLevelCompleted(true)
        setIsExecuting(false)
      }, 1000)
      return
    }

    setTimeout(() => {
      executeNextCommand(commands, index + 1, newPosition)
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
    window.location.href = "/level2" // 🔗 change route as needed
  }

  return (
    <div className="w-screen h-screen bg-sky-200 relative flex flex-col">
      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas camera={{ position: [12, 10, 12], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 15, 10]} intensity={1.4} />

          <Suspense fallback={null}>
            <Sea />
            <Base />
            <AnimatedSeahorse position={seahorsePosition} isAnimating={isExecuting} onAnimationComplete={() => {}} />
            <CameraController />
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>

      {/* Programming Bar */}
      <div className="bg-sky-200 p-4">
        <ProgrammingBar onExecuteProgram={executeProgram} isExecuting={isExecuting} onRefresh={handleRefresh} />
      </div>

      {/* Error Popup */}
      {errorMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-8 py-4 rounded-lg shadow-2xl text-xl font-bold animate-bounce z-50">
          {errorMessage}
        </div>
      )}

      {/* ✅ Level Completed Popup */}
      {levelCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center w-96">
            <h2 className="text-3xl font-bold text-yellow-600 mb-4">WELL DONE!</h2>
            <p className="text-gray-700 mb-6">🎉 You reached the goal successfully!</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleReplay}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Replay
              </button>
              <button
                onClick={handleNextLevel}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Next Level
              </button>
            </div>
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
