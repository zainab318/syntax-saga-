/**
 * Code Generation Utility for Syntax Saga
 * Maps drag-and-drop commands to Python code
 */

import type { CommandBlock } from "@/components/ProgrammingBar"

type GenOptions = { level?: number }

export function generatePythonCode(commands: CommandBlock[], options: GenOptions = {}): string {
  const level = options.level ?? 1
  if (commands.length === 0) {
    return ""
  }

  const codeLines: string[] = []

  // Header
  codeLines.push("# 🌊 Syntax Saga - Seahorse Adventure")
  codeLines.push(`# Generated code from visual blocks (Level ${level})`)

  codeLines.push("")
 
  // Level 2: kid-friendly summary with variables and explicit lines (no f-strings)
  if (level === 2) {
    const steps = commands.filter((c) => c.type === "forward").length
    const turns = commands.filter((c) => c.type === "turnRight").length
    
    codeLines.push(`steps = ${steps}`)
    codeLines.push(`turns = ${turns}`)
    codeLines.push("")
    codeLines.push(`print("The seahorse will move forward " + str(steps) + " times!")`)
    codeLines.push("")
    for (let i = 0; i < steps; i++) {
      codeLines.push(`print("move forward")`)
    }
    codeLines.push("")
    codeLines.push(`print("coin collected")`)
    codeLines.push("")
    codeLines.push(`print("The seahorse will turn right " + str(turns) + " times!")`)
    codeLines.push("")
    for (let i = 0; i < turns; i++) {
      codeLines.push(`print("turn right")`)
    }

    return codeLines.join("\n")
  }

  // Level 1: simple prints only (no loops)
  if (level === 1) {
    for (const command of commands) {
      const p = (msg: string) => `print("${msg}")`
      if (command.type === "forward") {
        codeLines.push(p("move forward"))
      } else if (command.type === "backward") {
        codeLines.push(p("move backward"))
      } else if (command.type === "turnLeft") {
        codeLines.push(p("turn left"))
      } else if (command.type === "turnRight") {
        codeLines.push(p("turn right"))
      } else if (command.type === "turnAround") {
        codeLines.push(p("turn around"))
      } else if (command.type === "wait") {
        codeLines.push(p("wait"))
      } else {
        codeLines.push(`# Unknown command: ${command.type}`)
      }
    }
  } else {
    // Other levels: compact simple prints and loops when helpful
    let i = 0
    while (i < commands.length) {
      const current = commands[i]
      let runLen = 1
      while (i + runLen < commands.length && commands[i + runLen].type === current.type) runLen++
      const p = (msg: string) => `print("${msg}")`
      if (current.type === "forward") {
        if (runLen > 1) { codeLines.push(`for _ in range(${runLen}):`); codeLines.push(`    ${p("move forward")}`) } else { codeLines.push(p("move forward")) }
      } else if (current.type === "backward") {
        if (runLen > 1) { codeLines.push(`for _ in range(${runLen}):`); codeLines.push(`    ${p("move backward")}`) } else { codeLines.push(p("move backward")) }
      } else if (current.type === "turnLeft") {
        codeLines.push(p("turn left"))
      } else if (current.type === "turnRight") {
        if (runLen > 1) { codeLines.push(`for _ in range(${runLen}):`); codeLines.push(`    ${p("turn right")}`) } else { codeLines.push(p("turn right")) }
      } else if (current.type === "turnAround") {
        codeLines.push(p("turn around"))
      } else if (current.type === "wait") {
        codeLines.push(p("wait"))
      } else {
        codeLines.push(`# Unknown command: ${current.type}`)
      }
      i += runLen
    }
  }

  return codeLines.join("\n")
}

function generateCommandCode(
  command: CommandBlock,
  level: number,
  onForward?: () => void,
): string {
  const p = (msg: string) => `print("${msg}")`

  switch (command.type) {
    case "forward":
      if (onForward) onForward()
      return p("move forward")
    case "backward":
      return p("move backward")
    case "turnLeft":
      return p("turn left")
    case "turnRight":
      return p("turn right")
    case "turnAround":
      return p("turn around")
    case "wait":
      return p("wait")
    default:
      return `# Unknown command: ${command.type}`
  }
}

/**
 * Generate detailed code with implementations (for advanced view)
 */
export function generateDetailedCode(commands: CommandBlock[]): string {
  if (commands.length === 0) {
    return ""
  }

  const codeLines: string[] = []

  // Header
  codeLines.push("# 🌊 Syntax Saga - Seahorse Adventure")
  codeLines.push("# Generated code from visual blocks")
  codeLines.push("import time")
  codeLines.push("")

  // Character state
  codeLines.push("# 🐚 Seahorse state")
  codeLines.push("class Seahorse:")
  codeLines.push("    def __init__(self):")
  codeLines.push("        self.x = 0")
  codeLines.push("        self.z = 0")
  codeLines.push("        self.rotation = 0  # degrees")
  codeLines.push("        self.actions = []")
  codeLines.push("")
  codeLines.push("    def log_action(self, action):")
  codeLines.push("        self.actions.append(action)")
  codeLines.push("        print(f'🌊 {action}')")
  codeLines.push("")
  codeLines.push("seahorse = Seahorse()")
  codeLines.push("")

  // Movement functions
  codeLines.push("# 🐚 Movement functions")
  codeLines.push("def move_forward():")
  codeLines.push("    \"\"\"Move the seahorse forward.\"\"\"")
  codeLines.push("    import math")
  codeLines.push("    seahorse.x += 4.5 * math.cos(math.radians(seahorse.rotation))")
  codeLines.push("    seahorse.z += 4.5 * math.sin(math.radians(seahorse.rotation))")
  codeLines.push("    seahorse.log_action(f'Swam forward to ({seahorse.x:.1f}, {seahorse.z:.1f})')")
  codeLines.push("")
  codeLines.push("def move_backward():")
  codeLines.push("    \"\"\"Move the seahorse backward.\"\"\"")
  codeLines.push("    import math")
  codeLines.push("    seahorse.x -= 4.5 * math.cos(math.radians(seahorse.rotation))")
  codeLines.push("    seahorse.z -= 4.5 * math.sin(math.radians(seahorse.rotation))")
  codeLines.push("    seahorse.log_action(f'Swam backward to ({seahorse.x:.1f}, {seahorse.z:.1f})')")
  codeLines.push("")
  codeLines.push("def turn_left():")
  codeLines.push("    \"\"\"Turn the seahorse left 90 degrees.\"\"\"")
  codeLines.push("    seahorse.rotation += 90")
  codeLines.push("    seahorse.log_action(f'Turned left (now facing {seahorse.rotation}°)')")
  codeLines.push("")
  codeLines.push("def turn_right():")
  codeLines.push("    \"\"\"Turn the seahorse right 90 degrees.\"\"\"")
  codeLines.push("    seahorse.rotation -= 90")
  codeLines.push("    seahorse.log_action(f'Turned right (now facing {seahorse.rotation}°)')")
  codeLines.push("")
  codeLines.push("def turn_around():")
  codeLines.push("    \"\"\"Turn the seahorse 180 degrees.\"\"\"")
  codeLines.push("    seahorse.rotation += 180")
  codeLines.push("    seahorse.log_action(f'Turned around (now facing {seahorse.rotation}°)')")
  codeLines.push("")
  codeLines.push("def wait():")
  codeLines.push("    \"\"\"Wait for one step.\"\"\"")
  codeLines.push("    seahorse.log_action('Waited for one step')")
  codeLines.push("")

  // Main program
  codeLines.push("# 🌊 Main program")
  codeLines.push("print('🐚 Starting seahorse adventure!')")
  codeLines.push("")

  commands.forEach((command) => {
    const commandCode = generateDetailedCommandCode(command)
    codeLines.push(commandCode)
  })

  // Results
  codeLines.push("")
  codeLines.push("# 🐚 Show results")
  codeLines.push("print(f'\\n📍 Final Position: ({seahorse.x:.1f}, {seahorse.z:.1f})')")
  codeLines.push("print(f'📐 Final Rotation: {seahorse.rotation}°')")
  codeLines.push("print(f'📊 Total Actions: {len(seahorse.actions)}')")

  return codeLines.join("\n")
}

function generateDetailedCommandCode(command: CommandBlock): string {
  switch (command.type) {
    case "forward":
      return "move_forward()"
    case "backward":
      return "move_backward()"
    case "turnLeft":
      return "turn_left()"
    case "turnRight":
      return "turn_right()"
    case "turnAround":
      return "turn_around()"
    case "wait":
      return "wait()"
    default:
      return `# Unknown command: ${command.type}`
  }
}

