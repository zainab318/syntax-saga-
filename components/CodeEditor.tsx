"use client"

import { useState, useRef, useEffect } from "react"

interface CodeEditorProps {
  initialCode: string
  onCodeChange: (code: string) => void
  placeholder?: string
  hint?: string
  expectedOutput?: string
  onComplete?: (isCorrect: boolean) => void
}

export default function CodeEditor({ 
  initialCode, 
  onCodeChange, 
  placeholder = "Write your code here...",
  hint,
  expectedOutput,
  onComplete 
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    onCodeChange(code)
  }, [code, onCodeChange])

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
  }

  const runCode = () => {
    setIsRunning(true)
    setOutput("")
    
    try {
      // Simple Python-like code execution simulation with variable support
      const lines = code.trim().split('\n')
      const results: string[] = []
      const variables: { [key: string]: any } = {}
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        
        // Handle variable assignments
        if (trimmedLine.includes('=') && !trimmedLine.startsWith('print(')) {
          const [varName, varValue] = trimmedLine.split('=').map(s => s.trim())
          if (varName && varValue) {
            // Parse the value (handle numbers and strings)
            if (varValue.match(/^\d+$/)) {
              variables[varName] = parseInt(varValue)
            } else if (varValue.startsWith('"') && varValue.endsWith('"')) {
              variables[varName] = varValue.slice(1, -1)
            } else {
              variables[varName] = varValue
            }
          }
        }
        
        // Handle print statements
        if (trimmedLine.startsWith('print(')) {
          // Handle string concatenation with str() function
          if (trimmedLine.includes('str(') && trimmedLine.includes('+')) {
            let content = trimmedLine.match(/print\(["'](.*?)["']\s*\+\s*str\((\w+)\)\s*\+\s*["'](.*?)["']\)/)?.[1] || ""
            const varName = trimmedLine.match(/str\((\w+)\)/)?.[1] || ""
            const afterVar = trimmedLine.match(/str\(\w+\)\s*\+\s*["'](.*?)["']\)/)?.[1] || ""
            
            if (varName && variables[varName] !== undefined) {
              content = content + String(variables[varName]) + afterVar
            }
            
            results.push(content)
          } else {
            // Handle regular print statements
            const content = trimmedLine.match(/print\(['"](.*?)['"]\)/)
            if (content) {
              results.push(content[1])
            }
          }
        }
      }
      
      const outputText = results.join('\n')
      setOutput(outputText)
      
      // Check if output matches expected
      if (expectedOutput && onComplete) {
        const isCorrect = outputText.trim() === expectedOutput.trim()
        onComplete(isCorrect)
      }
    } catch (error) {
      setOutput("Error: Invalid code syntax")
    } finally {
      setIsRunning(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newCode = code.substring(0, start) + '  ' + code.substring(end)
        setCode(newCode)
        
        // Set cursor position after the inserted spaces
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }
  }

  return (
    <div className="space-y-4">
      {hint && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-cyan-800 mb-1">Hint:</p>
              <p className="text-cyan-700">{hint}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-cyan-300 shadow-xl">
        <div className="bg-slate-700 px-4 py-2 rounded-t-xl flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-slate-300 text-sm font-medium ml-2">🐚 Sea Code Editor</span>
        </div>
        
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-32 bg-slate-800 text-green-400 font-mono text-sm resize-none border-none outline-none placeholder-slate-500"
            style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
          />
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={runCode}
              disabled={isRunning || !code.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg disabled:shadow-none"
            >
              {isRunning ? "🔄 Running..." : "▶️ Run Code"}
            </button>
            
            <button
              onClick={() => setCode("")}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>
      
      {output && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-green-300 shadow-xl">
          <div className="bg-slate-700 px-4 py-2 rounded-t-xl">
            <span className="text-slate-300 text-sm font-medium">🌊 Output</span>
          </div>
          <div className="p-4">
            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
