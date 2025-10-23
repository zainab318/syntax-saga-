"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Command block types
export type CommandType = "forward" | "backward" | "turnLeft" | "turnRight" | "turnAround" | "wait"

export interface CommandBlock {
  id: string
  type: CommandType
  color: string
  icon: string
}

// Command block definitions
const COMMAND_TYPES: Record<CommandType, { color: string; icon: string; label: string }> = {
  forward: { color: "#ef4444", icon: "👣", label: "Forward" },
  backward: { color: "#10b981", icon: "👣", label: "Backward" },
  turnLeft: { color: "#3b82f6", icon: "↶", label: "Turn Left" },
  turnRight: { color: "#f97316", icon: "↷", label: "Turn Right" },
  turnAround: { color: "#a855f7", icon: "⟲", label: "Turn Around" },
  wait: { color: "#6b7280", icon: "⏸", label: "Wait" },
}

// Individual command block component
function CommandBlockComponent({
  block,
  isDragging,
  onDragStart,
  onDragEnd,
  onRemove,
  isInProgram = false,
}: {
  block: CommandBlock
  isDragging: boolean
  onDragStart: (e: React.DragEvent, block: CommandBlock) => void
  onDragEnd: (e: React.DragEvent) => void
  onRemove?: (blockId: string) => void
  isInProgram?: boolean
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  const getTooltipContent = (type: CommandType) => {
    switch (type) {
      case "forward":
        return { title: "Forward", description: "Move the seahorse forward in the direction it's facing" }
      case "backward":
        return { title: "Backward", description: "Move the seahorse backward (opposite direction)" }
      case "turnLeft":
        return { title: "Turn Left", description: "Rotate the seahorse 90° to the left" }
      case "turnRight":
        return { title: "Turn Right", description: "Rotate the seahorse 90° to the right" }
      case "turnAround":
        return { title: "Turn Around", description: "Rotate the seahorse 180° (face opposite direction)" }
      case "wait":
        return { title: "Wait", description: "Pause for one step - seahorse stays in place" }
      default:
        return { title: "Command", description: "Programming command" }
    }
  }

  const tooltip = getTooltipContent(block.type)

  return (
    <div className="relative">
      <div
        draggable
        onDragStart={(e) => onDragStart(e, block)}
        onDragEnd={onDragEnd}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-md cursor-move transition-all duration-200 select-none",
          isDragging && "opacity-50 scale-95",
          isInProgram && "hover:shadow-lg",
        )}
        style={{
          backgroundColor: COMMAND_TYPES[block.type].color,
          boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        <span className="text-white text-sm font-bold">{COMMAND_TYPES[block.type].icon}</span>
        {isInProgram && onRemove && (
          <button
            onClick={() => onRemove(block.id)}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
            style={{ fontSize: "10px" }}
          >
            ×
          </button>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && !isDragging && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg border border-gray-700 min-w-max">
            <div className="font-semibold text-yellow-400">{tooltip.title}</div>
            <div className="text-gray-200 text-xs mt-1 max-w-48">{tooltip.description}</div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Programming Bar component
interface ProgrammingBarProps {
  onExecuteProgram?: (commands: CommandBlock[]) => void
  isExecuting?: boolean
  onRefresh?: () => void
  onCommandsChange?: (commands: CommandBlock[]) => void
}

export default function ProgrammingBar({ onExecuteProgram, isExecuting = false, onRefresh, onCommandsChange }: ProgrammingBarProps) {
  const [programBlocks, setProgramBlocks] = useState<CommandBlock[]>([])
  const [draggedBlock, setDraggedBlock] = useState<CommandBlock | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Available command blocks (the ones you can drag from)
  const availableBlocks: CommandBlock[] = [
    { id: "avail-1", type: "forward", color: "#ef4444", icon: "👣" },
    { id: "avail-2", type: "backward", color: "#10b981", icon: "👣" },
    { id: "avail-3", type: "turnLeft", color: "#3b82f6", icon: "↶" },
    { id: "avail-4", type: "turnRight", color: "#f97316", icon: "↷" },
    { id: "avail-5", type: "turnAround", color: "#a855f7", icon: "⟲" },
    { id: "avail-6", type: "wait", color: "#6b7280", icon: "⏸" },
  ]

  const handleDragStart = (e: React.DragEvent, block: CommandBlock) => {
    setDraggedBlock(block)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedBlock(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedBlock) {
      const newBlock: CommandBlock = {
        ...draggedBlock,
        id: `program-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }
      setProgramBlocks((prev) => {
        const updated = [...prev, newBlock]
        onCommandsChange?.(updated)
        return updated
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const removeBlock = (blockId: string) => {
    setProgramBlocks((prev) => {
      const updated = prev.filter((block) => block.id !== blockId)
      onCommandsChange?.(updated)
      return updated
    })
  }

  const clearProgram = () => {
    setProgramBlocks([])
    onCommandsChange?.([])
  }

  const handleRefresh = () => {
    setProgramBlocks([])
    setIsPlaying(false)
    onCommandsChange?.([])
    onRefresh?.()
  }

  const executeProgram = () => {
    if (programBlocks.length === 0) return

    setIsPlaying(true)
    console.log("Executing program:", programBlocks)

    // Call the parent component's execution handler
    onExecuteProgram?.(programBlocks)
  }

  // Update isPlaying state based on external execution state
  useEffect(() => {
    setIsPlaying(isExecuting)
  }, [isExecuting])

  return (
    <div className="w-full">
      {/* Main Programming Area */}
      <div className="space-y-3">
        {/* Program Bar - matches screenshot style */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">STEP</span>
                <Button
                  onClick={executeProgram}
                  disabled={programBlocks.length === 0 || isPlaying}
                  className="bg-green-600 hover:bg-green-700 text-white p-1 h-8 w-8"
                >
                  {isPlaying ? "⏸️" : "▶️"}
                </Button>
                <span className="text-white text-sm">x1</span>
              </div>
              <span className="text-white text-sm font-medium">PROGRAM</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="text-gray-400 hover:text-white p-1 h-8 w-8 bg-transparent"
                title="Refresh - Reset seahorse and clear program"
              >
                🔄
              </Button>
              <Button
                onClick={clearProgram}
                variant="outline"
                className="text-gray-400 hover:text-white p-1 h-8 w-8 bg-transparent"
                title="Clear program only"
              >
                🗑️
              </Button>
            </div>
          </div>

          {/* Program Blocks Container - matches screenshot */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
              "min-h-[50px] bg-gray-600 rounded-lg p-2 flex flex-wrap gap-1 items-center",
              programBlocks.length === 0 && "border-2 border-dashed border-gray-500",
            )}
          >
            {programBlocks.length === 0 ? (
              <span className="text-gray-300 text-sm">Drag commands here</span>
            ) : (
              programBlocks.map((block) => (
                <div key={block.id} className="relative">
                  <CommandBlockComponent
                    block={block}
                    isDragging={false}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onRemove={removeBlock}
                    isInProgram={true}
                  />
                </div>
              ))
            )}
          </div>
          {programBlocks.length > 0 && (
            <div className="text-xs text-gray-300 mt-2">
              Tip: You can queue multiple commands. Use the trash can or × to edit.
            </div>
          )}
        </div>

        {/* Available Commands - matches screenshot */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {availableBlocks.map((block) => (
                <CommandBlockComponent
                  key={block.id}
                  block={block}
                  isDragging={draggedBlock?.id === block.id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
