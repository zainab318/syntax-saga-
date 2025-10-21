"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF } from "@react-three/drei"
import ProgrammingBar, { type CommandBlock } from "@/components/ProgrammingBar"
import AnimatedSeahorse, { type SeahorsePosition } from "@/components/AnimatedSeahorse"

// 🎥 Camera Controller
function CameraController() {
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.reset()
  }, [])

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      enableRotate={true}
      enablePan={false}
      minDistance={12}
      maxDistance={20}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.2}
      target={[3, 0, 0]}
    />
  )
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
  scene.position.set(0, -1, 0)
  scene.scale.set(1.5, 1.5, 1.5)
  return <primitive object={scene} />
}

// 🎮 Level 2 main scene
export default function Level2() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [seahorsePosition, setSeahorsePosition] = useState<SeahorsePosition>({
    x: -3.5,
    z: -6,
    rotation: 0,
  })

  const BOUNDARY = { minX: -8, maxX: 8, minZ: -10, maxZ: 8 }

  const isWithinBounds = (x: number, z: number) =>
    x >= BOUNDARY.minX && x <= BOUNDARY.maxX && z >= BOUNDARY.minZ && z <= BOUNDARY.maxZ

  const executeProgram = (commands: CommandBlock[]) => {
    if (commands.length === 0) return
    setIsExecuting(true)
    setErrorMessage(null)
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
      setErrorMessage("⚠️ The seahorse can’t swim off the platform!")
      setIsExecuting(false)
      setTimeout(() => setErrorMessage(null), 3000)
      return
    }

    newPos.rotation = Math.atan2(Math.sin(newPos.rotation), Math.cos(newPos.rotation))
    setSeahorsePosition(newPos)

    setTimeout(() => executeNextCommand(commands, index + 1, newPos), 1200)
  }

  return (
    <div className="w-screen h-screen bg-sky-200 relative flex flex-col">
      {/* 3D View */}
      <div className="flex-1">
        <Canvas camera={{ position: [6, 5, 8], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 15, 10]} intensity={1.4} />

          <Suspense fallback={null}>
            <Sea />
            <Base />
            <AnimatedSeahorse
              position={seahorsePosition}
              isAnimating={isExecuting}
              onAnimationComplete={() => {}}
            />
            <CameraController />
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>

      {/* Programming Bar */}
      <div className="bg-sky-200 p-4">
        <ProgrammingBar onExecuteProgram={executeProgram} isExecuting={isExecuting} />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-8 py-4 rounded-lg shadow-2xl text-xl font-bold animate-bounce z-50">
          {errorMessage}
        </div>
      )}
    </div>
  )
}

// ✅ Preload models for faster load
useGLTF.preload("/Sea.glb")
useGLTF.preload("/Level2_base.glb")
useGLTF.preload("/SeaHorse.glb")
