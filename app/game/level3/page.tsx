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

// 🏝 Level 3 base model
function Base() {
  const { scene } = useGLTF("/Level3_base.glb")
  scene.position.set(0, -1, 0)
  scene.scale.set(1.5, 1.5, 1.5)
  return <primitive object={scene} />
}

// 🔑 Key model
function Key({ visible }: { visible: boolean }) {
  const { scene } = useGLTF("/KeyModel.glb")
  
  if (!visible) return null
  
  scene.position.set(7, 2, -8.5) // 2 forward, 1 left from start
  scene.scale.set(1.2, 1.2, 1.2)
  scene.rotation.set(0, Math.PI /4, 0) // Rotate 45 degrees to show front face
  return <primitive object={scene} />
}

// 🚪 Door model (removed for now)
// function Door({ isOpen }: { isOpen: boolean }) {
//   const { scene } = useGLTF("/Door model2.glb")
//   
//   scene.position.set(6.5, 2, 0.5) // From key: 1 back, 1 forward, 1 right
//   scene.scale.set(0.5, 0.5, 0.5)
//   
//   // Make door transparent/invisible when open
//   if (isOpen) {
//     scene.traverse((child: any) => {
//       if (child.isMesh) {
//         child.material.transparent = true
//         child.material.opacity = 0
//       }
//     })
//   }
//   
//   return <primitive object={scene} />
// }

// 🎮 Level 3 main scene
export default function Level3() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [doorOpen, setDoorOpen] = useState(false)
  const [keyCollected, setKeyCollected] = useState(false)
  const [seahorsePosition, setSeahorsePosition] = useState<SeahorsePosition>({
    x: -2,
    z: -4,
    rotation: 0,
  })

  const BOUNDARY = { minX: -8, maxX: 8, minZ: -10, maxZ: 8 }
  
  // Position calculations based on your description:
  // Start: (-2, -4)
  // 2 forward: (-2 + 9, -4) = (7, -4)
  // 1 left: (7, -4 - 4.5) = (7, -8.5) - KEY POSITION
  // From key, 1 back: (7 - 4.5, -8.5) = (2.5, -8.5)
  // 1 forward: (2.5 + 4.5, -8.5) = (7, -8.5)
  // 1 right: (7, -8.5 + 4.5) = (7, -4) - DOOR POSITION
  // After door, 1 right: (7, -4 + 4.5) = (7, 0.5) - GOAL POSITION
  
  const KEY_POSITION = { x: 7, z: -8.5 }
  const DOOR_POSITION = { x: 7, z: -4 }
  const GOAL_POSITION = { x: 7, z: 0.5 }
  const COLLECTION_DISTANCE = 2.5

  const isWithinBounds = (x: number, z: number) =>
    x >= BOUNDARY.minX && x <= BOUNDARY.maxX && z >= BOUNDARY.minZ && z <= BOUNDARY.maxZ

  const checkKeyCollection = (x: number, z: number): boolean => {
    const distance = Math.sqrt(Math.pow(x - KEY_POSITION.x, 2) + Math.pow(z - KEY_POSITION.z, 2))
    return distance < COLLECTION_DISTANCE
  }

  const checkDoorReached = (x: number, z: number): boolean => {
    const distance = Math.sqrt(Math.pow(x - DOOR_POSITION.x, 2) + Math.pow(z - DOOR_POSITION.z, 2))
    return distance < COLLECTION_DISTANCE
  }

  const checkGoalReached = (x: number, z: number): boolean => {
    const distance = Math.sqrt(Math.pow(x - GOAL_POSITION.x, 2) + Math.pow(z - GOAL_POSITION.z, 2))
    return distance < COLLECTION_DISTANCE
  }

  const executeProgram = (commands: CommandBlock[]) => {
    if (commands.length === 0) return
    setIsExecuting(true)
    setErrorMessage(null)
    setHasKey(false)
    setDoorOpen(false)
    setKeyCollected(false)
    executeNextCommand(commands, 0, { ...seahorsePosition })
  }

  const executeNextCommand = (commands: CommandBlock[], index: number, pos: SeahorsePosition) => {
    if (index >= commands.length) {
      setIsExecuting(false)
      return
    }

    const cmd = commands[index]
    const newPos = { ...pos }

    switch (cmd.type) {
      case "forward":
        newPos.x += Math.cos(newPos.rotation) * 4.5
        newPos.z += Math.sin(newPos.rotation) * 4.5
        break
      case "backward":
        newPos.x -= Math.cos(newPos.rotation) * 4.5
        newPos.z -= Math.sin(newPos.rotation) * 4.5
        break
      case "turnLeft":
        newPos.rotation += Math.PI / 2
        break
      case "turnRight":
        newPos.rotation -= Math.PI / 2
        break
      case "turnAround":
        newPos.rotation += Math.PI
        break
      case "wait":
        break
    }

    if (!isWithinBounds(newPos.x, newPos.z)) {
      setErrorMessage("⚠️ The seahorse can't swim off the platform!")
      setIsExecuting(false)
      setTimeout(() => setErrorMessage(null), 3000)
      return
    }

    newPos.rotation = Math.atan2(Math.sin(newPos.rotation), Math.cos(newPos.rotation))
    setSeahorsePosition(newPos)

    // 🔑 Check if key is collected
    if (!keyCollected && checkKeyCollection(newPos.x, newPos.z)) {
      setKeyCollected(true)
      setHasKey(true)
    }

    // 🏁 Check for level completion (just need to collect the key)
    if (hasKey) {
      setTimeout(() => {
        setLevelCompleted(true)
        setIsExecuting(false)
      }, 1000)
      return
    }

    setTimeout(() => executeNextCommand(commands, index + 1, newPos), 1200)
  }

  const handleRefresh = () => {
    setSeahorsePosition({ x: -2, z: -4, rotation: 0 })
    setErrorMessage(null)
    setLevelCompleted(false)
    setHasKey(false)
    setDoorOpen(false)
    setKeyCollected(false)
  }

  const handleReplay = () => {
    setLevelCompleted(false)
    setSeahorsePosition({ x: -2, z: -4, rotation: 0 })
    setHasKey(false)
    setDoorOpen(false)
    setKeyCollected(false)
  }

  const handleNextLevel = () => {
    window.location.href = "/game/level1" // 🔗 Go back to Level 1 (or create Level 4)
  }

  const handleReset = () => {
    window.location.href = "/game/level1" // 🔗 Go back to Level 1
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
            <Key visible={!keyCollected} />
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

      {/* Status Indicator */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{hasKey ? "🔑" : "🔒"}</span>
          <span className="font-semibold">{hasKey ? "Key Collected!" : "Find the Key"}</span>
        </div>
        {hasKey && (
          <div className="mt-2 text-sm text-green-600">✅ Level Complete!</div>
        )}
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
              <span className="text-yellow-400 text-4xl">⭐</span>
            </div>

            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">LEVEL 3 COMPLETE!</h2>
            <p className="text-gray-600 mb-6">🎉 You found the key and completed the level!</p>

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
                🏠 Home
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

// ✅ Preload models for faster load
useGLTF.preload("/Sea.glb")
useGLTF.preload("/Level3_base.glb")
useGLTF.preload("/SeaHorse.glb")
useGLTF.preload("/KeyModel.glb")
useGLTF.preload("/Door model2.glb")