"use client"

import { useRef, useState, Suspense, useEffect} from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import ProgrammingBar, { type CommandBlock } from "@/components/ProgrammingBar"
import AnimatedSeahorse, { type SeahorsePosition } from "@/components/AnimatedSeahorse"
import CodeDisplay from "@/components/CodeDisplay"
import { generatePythonCode } from "@/lib/codeGenerator"

// Editable seahorse starting pose (numericals)
export const SEAHORSE_START_X = 1
export const SEAHORSE_START_Z = -1
export const SEAHORSE_START_ROTATION = 0

// 🔒 Fixed Camera Controller
function CameraController() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(-30, 60, 70)
    camera.lookAt(60, -50, -80)
    // @ts-ignore
    ;(camera as any).fov = 10
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
  scene.position.set(0, 1, 0)
  scene.scale.set(1.5, 1.5, 1.5)
  return <primitive object={scene} />
}

// 🔑 Key model
function Key({ visible }: { visible: boolean }) {
  const { scene } = useGLTF("/KeyModel.glb")
  
  if (!visible) return null
  
  scene.position.set(13, 0.2, 9) // 2 forward, 1 left from start, moved down a bit
  scene.scale.set(1.8, 1.8, 1.8) // Increased size
  scene.rotation.set(0, Math.PI /4, 0) // Rotate 45 degrees to show front face
  return <primitive object={scene} />
}
function Door({ isOpen }: { isOpen: boolean }) {
  const { scene } = useGLTF("/Door model2.glb")
  const doorRef = useRef<any>()
  const [angle, setAngle] = useState(0)

  // Position and scale
  scene.position.set(15, 9, 17)
  scene.scale.set(0.8,0.8,0.8)
  scene.rotation.set(0, Math.PI / 2, 0) // front face toward camera

  // Door opening animation
  useFrame(() => {
    if (isOpen && angle < Math.PI / 2) {
      setAngle((prev) => Math.min(prev + 0.05, Math.PI / 2))
    }
    if (doorRef.current) {
      doorRef.current.rotation.y = Math.PI / 2 - angle
    }
  })

  return <primitive ref={doorRef} object={scene} />
}



// 🎮 Level 3 main scene
export default function Level3() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [doorOpen, setDoorOpen] = useState(false)
  const [keyCollected, setKeyCollected] = useState(false)
  const [showKeyToast, setShowKeyToast] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [seahorsePosition, setSeahorsePosition] = useState<SeahorsePosition>({
    x: SEAHORSE_START_X,
    z: SEAHORSE_START_Z,
    rotation: SEAHORSE_START_ROTATION, // Start facing forward (positive X direction)
  })

  const KEY_POSITION = { x: 7, z: -8.5 }
  const DOOR_POSITION = { x: 7, z: -4 }
  const GOAL_POSITION = { x: 7, z: 0.5 }
  const COLLECTION_DISTANCE = 2.5

  const checkKeyCollection = (x: number, z: number): boolean => {
    const distance = Math.sqrt(Math.pow(x - KEY_POSITION.x, 2) + Math.pow(z - KEY_POSITION.z, 2))
    return distance < COLLECTION_DISTANCE
  }

  const checkDoorReached = (x: number, z: number): boolean => {
    const distance = Math.sqrt(Math.pow(x - DOOR_POSITION.x, 0.5) + Math.pow(z - DOOR_POSITION.z, 2))
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
    // Stage machine for completion: F,F,L,R,F,F,R
    // stage 0: need 2 forwards; stage 1: need left; stage 2: need right; stage 3: need 2 forwards; stage 4: need final right
    executeNextCommand(commands, 0, { ...seahorsePosition }, 0, 0)
  }

  const executeNextCommand = (
    commands: CommandBlock[],
    index: number,
    pos: SeahorsePosition,
    stage: number = 0,
    forwardCount: number = 0,
  ) => {
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
  newPos.x += Math.cos(newPos.rotation - Math.PI / 2) * 4.5
  newPos.z += Math.sin(newPos.rotation - Math.PI / 2) * 4.5
  break

        
      case "turnRight":
        // Turn right (clockwise) and move in the new direction
        newPos.rotation -= Math.PI / 2
        newPos.x += Math.cos(newPos.rotation) * 4.5
        newPos.z += Math.sin(newPos.rotation) * 4.5
        break
      case "turnAround":
        newPos.rotation += Math.PI
        break
      case "wait":
        break
    }

    

    newPos.rotation = Math.atan2(Math.sin(newPos.rotation), Math.cos(newPos.rotation))
    setSeahorsePosition(newPos)

    // Completion sequence tracking: F,F,L,R,F,F,R
    let nextStage = stage
    let nextForwards = forwardCount
    if (stage === 0) {
      if (cmd.type === "forward") {
        nextForwards += 1
        if (nextForwards >= 2) { nextStage = 1; nextForwards = 0 }
      } else if (cmd.type !== "wait") { nextStage = 0; nextForwards = 0 }
    } else if (stage === 1) {
      if (cmd.type === "turnLeft") { nextStage = 2 } else if (cmd.type !== "wait") { nextStage = 0; nextForwards = 0 }
    } else if (stage === 2) {
      if (cmd.type === "turnRight") { nextStage = 3 } else if (cmd.type !== "wait") { nextStage = 0; nextForwards = 0 }
    } else if (stage === 3) {
      if (cmd.type === "forward") {
        nextForwards += 1
        if (nextForwards >= 2) { nextStage = 4; nextForwards = 0 }
      } else if (cmd.type !== "wait") { nextStage = 0; nextForwards = 0 }
    } else if (stage === 4) {
      if (cmd.type === "turnRight") {
        setTimeout(() => {
          setLevelCompleted(true)
          setIsExecuting(false)
          // Navigate to Level 3 quiz
          window.location.href = "/game/level3/quiz"
        }, 600)
        return
      } else if (cmd.type !== "wait") { nextStage = 0; nextForwards = 0 }
    }

    // 🔑 Check if key is collected
    if (!keyCollected && checkKeyCollection(newPos.x, newPos.z)) {
        setKeyCollected(true)
        setHasKey(true)
        setDoorOpen(true) // ✅ Open the door when key is collected
        setShowKeyToast(true)
        setTimeout(() => setShowKeyToast(false), 1500)
    }

    // 🏁 Check for level completion - need to reach goal position after collecting key
    if (hasKey && checkGoalReached(newPos.x, newPos.z)) {
      setTimeout(() => {
        setLevelCompleted(true)
        setIsExecuting(false)
      }, 1000)
      return
    }

    setTimeout(() => executeNextCommand(commands, index + 1, newPos, nextStage, nextForwards), 1200)
  }

  const handleRefresh = () => {
    setSeahorsePosition({ x: SEAHORSE_START_X, z: SEAHORSE_START_Z, rotation: SEAHORSE_START_ROTATION })
    setErrorMessage(null)
    setLevelCompleted(false)
    setHasKey(false)
    setDoorOpen(false)
    setKeyCollected(false)
  }

  const handleReplay = () => {
    setLevelCompleted(false)
    setSeahorsePosition({ x: SEAHORSE_START_X, z: SEAHORSE_START_Z, rotation: SEAHORSE_START_ROTATION })
    setHasKey(false)
    setDoorOpen(false)
    setKeyCollected(false)
  }

  const handleNextLevel = () => {
    window.location.href = "/game/level4" // 🔗 Go back to Level 1 (or create Level 4)
  }

  const handleReset = () => {
    window.location.href = "/game/level3" // 🔗 Go back to Level 1
  }

  // 🔗 Real-time code generation (same as Levels 1 and 2)
  const handleCommandsChange = (commands: CommandBlock[]) => {
    const code = generatePythonCode(commands, { level: 3 })
    setGeneratedCode(code)
    try {
      localStorage.setItem("ss_level3_generated_code", code)
    } catch (_) {}
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* LEFT 70% — Model and Programming Bar */}
      <div className="w-[70%] h-full flex flex-col bg-sky-200 border-r border-gray-300">
        {/* 3D View */}
        <div className="flex-1">
          <Canvas camera={{ fov: 25, position: [15, 8, 5] }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.4} />

            <Suspense fallback={null}>
              <Sea />
              <Base />
              <Key visible={!keyCollected} />
              <Door isOpen={doorOpen} />
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
        <div className="h-[40%] p-4 bg-sky-200 border-t border-gray-400 overflow-y-auto">
          <ProgrammingBar
            onExecuteProgram={executeProgram}
            isExecuting={isExecuting}
            onRefresh={handleRefresh}
            onCommandsChange={handleCommandsChange}
          />
        </div>
      </div>

      {showKeyToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg">
          🔑 Key collected!
        </div>
      )}

      {/* RIGHT 30% — Code Display */}
      <div className="w-[30%] h-full bg-sky-200 p-4 overflow-auto">
        <CodeDisplay code={generatedCode} />
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