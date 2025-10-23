/**
 * Code Generation Utility for Syntax Saga
 * Maps drag-and-drop commands to Python code
 */

import type { CommandBlock } from "@/components/ProgrammingBar"

export function generatePythonCode(commands: CommandBlock[]): string {
  if (commands.length === 0) {
    return ""
  }

  const codeLines: string[] = []

  // Header
  codeLines.push("# 🌊 Syntax Saga - Seahorse Adventure")
  codeLines.push("# Generated code from visual blocks")
  codeLines.push("")

  // Add commands
  commands.forEach((command, index) => {
    const commandCode = generateCommandCode(command, index)
    codeLines.push(commandCode)
  })

  return codeLines.join("\n")
}

function generateCommandCode(command: CommandBlock, index: number): string {
  switch (command.type) {
    case "forward":
      return `print(f"{'move forward'}")`
    
    case "backward":
      return `print(f"{'move backward'}")`
    
    case "turnLeft":
      return `print(f"{'turn left'}")`
    
    case "turnRight":
      return `print(f"{'turn right'}")`
    
    case "turnAround":
      return `print(f"{'turn around'}")`
    
    case "wait":
      return `print(f"{'wait'}")`
    
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

