"use client"
import { Suspense, useState, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import ProgrammingBar, { type CommandBlock } from "@/components/ProgrammingBar"
import AnimatedSeahorse, { type SeahorsePosition } from "@/components/AnimatedSeahorse"
import CodeDisplay from "@/components/CodeDisplay"
import { generatePythonCode } from "@/lib/codeGenerator"

// Grid/tile and model placement constants (edit these numericals)
export const TILE_SIZE = 4.5
export const FIRST_TILE_X = -0.5
export const ROW_Z = -2

// Seahorse starting pose (Tile 1)
export const SEAHORSE_START_X = FIRST_TILE_X
export const SEAHORSE_START_Z = ROW_Z
export const SEAHORSE_START_ROTATION = 0

// Coin position (Tile 3)
export const COIN_POS = { x: FIRST_TILE_X + TILE_SIZE * 2, z: ROW_Z }

// 🎥 Fixed Camera Controller (match Level 1)
function CameraController() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(-30, 52, 50)
    camera.lookAt(60, -50, -80)
    // @ts-ignore
    ;(camera as any).fov = 10
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

// Path constraints (imaginary boundaries on tiles)
const EPS = 0.2
const MAX_COL = 3 // allow up to tile 4 (0..3)
const TURN_COL_X = FIRST_TILE_X + TILE_SIZE * MAX_COL

function isOnPath(x: number, z: number, stage: number): boolean {
  if (stage < 1) {
    // Before/right-turn: must stay on the first row (z ~ ROW_Z) and within columns 0..MAX_COL
    const onRow = Math.abs(z - ROW_Z) <= EPS
    const minX = FIRST_TILE_X - EPS
    const maxX = FIRST_TILE_X + TILE_SIZE * MAX_COL + EPS
    return onRow && x >= minX && x <= maxX
  } else {
    // After the right turn: lock to the turn column X, allow z to move one tile forward only
    const onCol = Math.abs(x - TURN_COL_X) <= EPS
    const minZ = ROW_Z - EPS
    const maxZ = ROW_Z + TILE_SIZE + EPS
    return onCol && z >= minZ && z <= maxZ
  }
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

// 🪙 Coin model (third tile)
function Coin({ visible }: { visible: boolean }) {
  const { scene } = useGLTF("/coin23d.glb")
  if (!visible) return null
  scene.position.set(COIN_POS.x,4, COIN_POS.z)
  scene.scale.set(0.93,1.8,-1)
  scene.rotation.set(0, Math.PI / 4, 0)
  return <primitive object={scene} />
}

// 🎮 Level 2 main scene
export default function Level2() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [coinCollected, setCoinCollected] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [seahorsePosition, setSeahorsePosition] = useState<SeahorsePosition>({
    x: SEAHORSE_START_X,
    z: SEAHORSE_START_Z,
    rotation: SEAHORSE_START_ROTATION,
  })
  const [levelCompleted, setLevelCompleted] = useState(false)

  const COIN_POSITION = COIN_POS
  const COLLECTION_DISTANCE = 2.5

  const checkCoinCollection = (x: number, z: number): boolean => {
    const distance = Math.sqrt(Math.pow(x - COIN_POSITION.x, 2) + Math.pow(z - COIN_POSITION.z, 2))
    return distance < COLLECTION_DISTANCE
  }

  const executeProgram = (commands: CommandBlock[]) => {
    if (commands.length === 0) return
    setIsExecuting(true)
    setErrorMessage(null)
    setCoinCollected(false)
    // stage: 0 -> counting forwards until 3; 1 -> expect right; 2 -> expect final forward
    executeNextCommand(commands, 0, { ...seahorsePosition }, 0, 0)
  }

  const executeNextCommand = (
    commands: CommandBlock[],
    index: number,
    currentPos: SeahorsePosition,
    stage: number = 0,
    forwardCount: number = 0
  ) => {
    if (index >= commands.length) {
      setIsExecuting(false)
      return
    }

    const command = commands[index]
    const newPosition = { ...currentPos }
    const step = TILE_SIZE

    switch (command.type) {
      case "forward":
        newPosition.x += Math.cos(newPosition.rotation) * step
        newPosition.z -= Math.sin(newPosition.rotation) * step
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

    newPosition.rotation = Math.atan2(Math.sin(newPosition.rotation), Math.cos(newPosition.rotation))

    // Enforce tile path boundaries
    const validOnPath = isOnPath(newPosition.x, newPosition.z, stage)
    if (!validOnPath) {
      setErrorMessage("⚠️ Stay on the tiles! The seahorse can't swim in open water.")
      setIsExecuting(false)
      setTimeout(() => setErrorMessage(null), 2500)
      return
    }

    setSeahorsePosition(newPosition)

    // Sequence tracking: 3 forward -> 1 right -> 1 forward
    let nextStage = stage
    let nextForwardCount = forwardCount
    if (stage === 0) {
      if (command.type === "forward") {
        nextForwardCount += 1
        if (nextForwardCount >= 3) {
          nextStage = 1
        }
      } else if (command.type !== "wait") {
        // any other command resets the sequence
        nextForwardCount = 0
        nextStage = 0
      }
    } else if (stage === 1) {
      if (command.type === "turnRight") {
        nextStage = 2
      } else if (command.type !== "wait") {
        nextStage = 0
        nextForwardCount = 0
      }
    } else if (stage === 2) {
      if (command.type === "forward") {
        // Completed required sequence
        setTimeout(() => {
          setLevelCompleted(true)
          setIsExecuting(false)
        }, 600)
        return
      } else if (command.type !== "wait") {
        nextStage = 0
        nextForwardCount = 0
      }
    }

    if (!coinCollected && checkCoinCollection(newPosition.x, newPosition.z)) {
      setCoinCollected(true)
    }

    setTimeout(() => {
      executeNextCommand(commands, index + 1, newPosition, nextStage, nextForwardCount)
    }, 1200)
  }

  const handleRefresh = () => {
    setSeahorsePosition({ x: SEAHORSE_START_X, z: SEAHORSE_START_Z, rotation: SEAHORSE_START_ROTATION })
    setErrorMessage(null)
    setCoinCollected(false)
  }

  const handleCommandsChange = (commands: CommandBlock[]) => {
    const code = generatePythonCode(commands, { level: 2 })
    setGeneratedCode(code)
    try {
      localStorage.setItem("ss_level2_generated_code", code)
    } catch (_) {}
  }

  const handleTakeQuiz = () => {
    window.location.href = "/game/Level2/quiz"
  }
  const handleReplay = () => {
    setLevelCompleted(false)
    setSeahorsePosition({ x: SEAHORSE_START_X, z: SEAHORSE_START_Z, rotation: SEAHORSE_START_ROTATION })
    setCoinCollected(false)
  }

  return (
    <>
      <div className="flex w-screen h-screen overflow-hidden">
        {/* LEFT 70% — Model and Programming Bar */}
        <div className="w-[70%] h-full flex flex-col bg-sky-200 border-r border-gray-300">
          {/* 3D Model */}
          <div className="flex-1 p-4">
            <Canvas camera={{ fov: 25, position: [15, 8, 5] }}>
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
          <div className="h-[40%] p-4 bg-sky-200 border-t border-gray-400 overflow-y-auto">
            <ProgrammingBar
              onExecuteProgram={executeProgram}
              isExecuting={isExecuting}
              onRefresh={handleRefresh}
              onCommandsChange={handleCommandsChange}
            />
          </div>
        </div>

        {/* RIGHT 30% — Code Display */}
        <div className="w-[30%] h-full bg-sky-200 p-4 overflow-auto">
          <CodeDisplay code={generatedCode} />
        </div>
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
            <div className="flex justify-center mb-4">
              <span className="text-yellow-400 text-4xl">⭐</span>
              <span className="text-yellow-400 text-4xl mx-1">⭐</span>
              <span className="text-yellow-400 text-4xl">⭐</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">WELL DONE!</h2>
            <p className="text-gray-600 mb-6">You completed the sequence. Time for the quiz!</p>
            <div className="flex justify-center gap-3">
              <button onClick={handleReplay} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                ↻ Replay
              </button>
              <button onClick={handleTakeQuiz} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                ➜ Take Quiz
              </button>
            </div>
            <button onClick={() => setLevelCompleted(false)} className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-lg font-bold">
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}

useGLTF.preload("/Sea.glb")
useGLTF.preload("/Level2_base.glb")
useGLTF.preload("/SeaHorse.glb")
useGLTF.preload("/coin23d.glb")
