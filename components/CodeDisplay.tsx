"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface CodeDisplayProps {
  code: string
  className?: string
}

export default function CodeDisplay({ code, className }: CodeDisplayProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-b from-cyan-900 to-blue-950 rounded-lg shadow-2xl border-2 border-cyan-600 flex flex-col h-full",
        className
      )}
    >
      {/* Header */}
      <div className="bg-cyan-800 px-4 py-3 rounded-t-lg border-b-2 border-cyan-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐚</span>
          <h3 className="text-white font-bold text-lg">Generated Code</h3>
        </div>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-cyan-100 font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {code || (
            <span className="text-cyan-400 italic">
              # 🌊 Drag commands to generate code...
              {"\n"}# Your seahorse's journey will appear here!
            </span>
          )}
        </pre>
      </div>

      {/* Footer Info */}
      <div className="bg-cyan-800/50 px-4 py-2 rounded-b-lg border-t-2 border-cyan-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-cyan-300 flex items-center gap-1">
            <span>🌊</span> Sea Theme Mode
          </span>
          <span className="text-cyan-300">
            {code ? `${code.split("\n").length} lines` : "0 lines"}
          </span>
        </div>
      </div>
    </div>
  )
}

