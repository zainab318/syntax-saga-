"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import ProgrammingBar, { type CommandBlock } from "@/components/ProgrammingBar"
import AnimatedSeahorse, { type SeahorsePosition } from "@/components/AnimatedSeahorse"
import CodeDisplay from "@/components/CodeDisplay"
import { generatePythonCode } from "@/lib/codeGenerator"

// Coin model (clone per instance)
function Coin({ position = [0, 0, 0] as [number, number, number] }) {
  const { scene } = useGLTF("/coin23d.glb")
  const cloned = useMemo(() => scene.clone(), [scene])
  return (
    <primitive
      object={cloned}
      position={position}
      scale={[1.2, 1.2, 1.2]}
      rotation={[0, Math.PI / 4, 0]}
    />
  )
}

// Fixed Camera Controller
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

// Sea & Base
function Sea() {
  const { scene } = useGLTF("/Sea.glb")
  scene.position.set(0, -3, 0)
  scene.scale.set(3, 3, 3)
  return <primitive object={scene} />
}

function Base() {
  const { scene } = useGLTF("/Level4_base.glb")
  scene.position.set(0, 1, 0)
  scene.scale.set(1.5, 1.5, 1.5)
  return <primitive object={scene} />
}

// Level 4
export default function Level4() {
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

  // 3 Coins: positions + collection
  const COIN_POSITIONS = [
    { x: 15, z: -1.6 },
    { x: 28, z: -1.6 },
    { x: 15, z: 8 },
  ] as const
  const COLLECTION_DISTANCE = 2
  const [coinCollected, setCoinCollected] = useState<[boolean, boolean, boolean]>([false, false, false])

  const executeProgram = (commands: CommandBlock[]) => {
    if (commands.length === 0) return

    setIsExecuting(true)
    setErrorMessage(null)
    setForwardSteps(0)
    setCoinCollected([false, false, false])
    executeNextCommand(commands, 0, { ...seahorsePosition })
  }

  const executeNextCommand = (
    commands: CommandBlock[],
    index: number,
    currentPos: SeahorsePosition,
    currentStepCount: number = 0
  ) => {
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
        newStepCount += 1
        setForwardSteps(newStepCount)
        break

      case "backward":
        newPosition.x -= Math.cos(newPosition.rotation) * 4.5
        newPosition.z -= Math.sin(newPosition.rotation) * 4.5
        break

      case "turnLeft":
        newPosition.rotation += Math.PI / 2
        break

      case "turnRight":
        // 90° clockwise
        newPosition.rotation -= Math.PI / 2
        break

      case "turnAround":
        newPosition.rotation += Math.PI
        break

      case "wait":
        break
    }

    // Normalize rotation
    if (newPosition.rotation > Math.PI || newPosition.rotation < -Math.PI) {
      newPosition.rotation = Math.atan2(Math.sin(newPosition.rotation), Math.cos(newPosition.rotation))
    }

    setSeahorsePosition(newPosition)

    // Check coin collection
    setCoinCollected((prev) => {
      const updated = [...prev] as [boolean, boolean, boolean]
      let collectedAll = true

      for (let i = 0; i < COIN_POSITIONS.length; i++) {
        if (!updated[i]) {
          const dx = newPosition.x - COIN_POSITIONS[i].x
          const dz = newPosition.z - COIN_POSITIONS[i].z
          const distance = Math.sqrt(dx * dx + dz * dz)
          if (distance < COLLECTION_DISTANCE) {
            updated[i] = true
          }
        }
        if (!updated[i]) collectedAll = false
      }

      if (collectedAll) {
        setTimeout(() => {
          setLevelCompleted(true)
          setIsExecuting(false)
        }, 500)
      }

      return updated
    })

    setTimeout(() => {
      executeNextCommand(commands, index + 1, newPosition, newStepCount)
    }, 1200)
  }

  const handleReplay = () => {
    setLevelCompleted(false)
    setSeahorsePosition({ x: 1, z: -1.6, rotation: 0 })
    setForwardSteps(0)
    setCoinCollected([false, false, false])
  }

  const handleRefresh = () => {
    setSeahorsePosition({ x: 1, z: -1.6, rotation: 0 })
    setLevelCompleted(false)
    setErrorMessage(null)
    setForwardSteps(0)
    setCoinCollected([false, false, false])
  }

  const handleNextLevel = () => {
    window.location.href = "/game/Level2"
  }

  const handleTakeQuiz = () => {
    window.location.href = "/game/level1/quiz"
  }

  const handleReset = () => {
    window.location.href = "/game/level1"
  }

  // Real-time code generation (Level 4)
  const handleCommandsChange = (commands: CommandBlock[]) => {
    const code = generatePythonCode(commands, { level: 4 })
    setGeneratedCode(code)
    try {
      localStorage.setItem("ss_level4_generated_code", code)
    } catch (_) {}
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* Coins collected counter */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur rounded-full px-4 py-1 text-gray-800 font-semibold shadow">
        {coinCollected.filter(Boolean).length}/3
      </div>

      {/* LEFT 70% — 3D Scene + Programming Bar */}
      <div className="w-[70%] h-full flex flex-col bg-sky-200 border-r border-gray-300">
        {/* 3D Canvas */}
        <div className="flex-1 p-4">
          <Canvas camera={{ fov: 25, position: [15, 8, 5] }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.4} />
            <Suspense fallback={null}>
              <group position={[-2, 0, 0]}>
                <Sea />
                <Base />
                <AnimatedSeahorse
                  position={seahorsePosition}
                  isAnimating={isExecuting}
                  onAnimationComplete={() => {}}
                />
                {/* Render coins only if not collected */}
                {!coinCollected[0] && <Coin position={[15, 2.5, -1.6]} />}
                {!coinCollected[1] && <Coin position={[28, 2.5, -1.6]} />}
                {!coinCollected[2] && <Coin position={[15, 2.5, 8]} />}
              </group>
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

      {/* Error Popup */}
      {errorMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-8 py-4 rounded-lg shadow-2xl text-xl font-bold animate-bounce z-50">
          {errorMessage}
        </div>
      )}

      {/* Level Completed Popup */}
      {levelCompleted && (
        <div className="fixed inset-0 bg-sky-100 bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-96 text-center border-4 border-yellow-300">
            <div className="flex justify-center mb-4">
              <span className="text-yellow-400 text-4xl">Star</span>
              <span className="text-yellow-400 text-4xl mx-1">Star</span>
              <span className="text-gray-300 text-4xl">Star</span>
            </div>

            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">WELL DONE!</h2>
            <p className="text-gray-600 mb-6">You collected all 3 coins!</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
              >
                Replay
              </button>
              <button
                onClick={handleTakeQuiz}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
              >
                Take Quiz
              </button>
            </div>

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

// Preload assets
useGLTF.preload("/Sea.glb")
useGLTF.preload("/Level4_base.glb")
useGLTF.preload("/Seahorse.glb")
useGLTF.preload("/coin23d.glb")