"""
Deterministic, rule-based code generation engine.
Converts block/drag-drop commands into Python code snippets.

Core Gameplay Features:
1. Command Selection - Select commands from a palette
2. Visual Workflow - Commands displayed in a sequence list
3. Code Display - Real-time Python code generation in side panel
4. Toggle between template-based deterministic code and AI-generated code
"""

from typing import Dict, List, Any, Tuple, Optional
from enum import Enum
import json


class BlockType(Enum):
    """Supported block types for code generation."""
    MOVE_FORWARD = "move_forward"
    MOVE_BACKWARD = "move_backward"
    TURN_LEFT = "turn_left"
    TURN_RIGHT = "turn_right"
    JUMP = "jump"
    LOOP = "loop"
    CONDITIONAL = "conditional"
    PRINT = "print"
    VARIABLE = "variable"
    FUNCTION = "function"
    WAIT = "wait"
    PICK_OBJECT = "pick_object"  # New command for picking objects


class DifficultyLevel(Enum):
    """Difficulty levels for code generation examples."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class CodeDisplayMode(Enum):
    """Code display modes for toggling between code generation methods."""
    TEMPLATE_BASED = "template_based"  # Deterministic, rule-based code
    AI_GENERATED = "ai_generated"      # AI-generated code


class CommandPalette:
    """
    Command palette for selecting available commands.
    Provides a structured interface for users to select commands.
    Supports level-based command filtering.
    """
    
    def __init__(self, current_level: int = 1):
        self.commands = self._initialize_commands()
        self.current_level = current_level
    
    def _initialize_commands(self) -> Dict[str, Dict[str, Any]]:
        """Initialize available commands with their metadata and level availability."""
        return {
            "move": {
                "type": BlockType.MOVE_FORWARD.value,
                "label": "Move Forward",
                "icon": "→",
                "category": "movement",
                "default_params": {"distance": 1},
                "description": "Move the character forward by specified distance",
                "available_levels": [1, 2, 3, 4]  # Available in all levels
            },
            "move_back": {
                "type": BlockType.MOVE_BACKWARD.value,
                "label": "Move Backward",
                "icon": "←",
                "category": "movement",
                "default_params": {"distance": 1},
                "description": "Move the character backward by specified distance",
                "available_levels": [1, 2, 3, 4]  # Available in all levels
            },
            "turn_left": {
                "type": BlockType.TURN_LEFT.value,
                "label": "Turn Left",
                "icon": "↰",
                "category": "movement",
                "default_params": {"degrees": 90},
                "description": "Turn the character left by specified degrees",
                "available_levels": [1, 2, 3, 4]  # Available in all levels
            },
            "turn_right": {
                "type": BlockType.TURN_RIGHT.value,
                "label": "Turn Right",
                "icon": "↱",
                "category": "movement",
                "default_params": {"degrees": 90},
                "description": "Turn the character right by specified degrees",
                "available_levels": [1, 2, 3, 4]  # Available in all levels
            },
            "jump": {
                "type": BlockType.JUMP.value,
                "label": "Jump",
                "icon": "⤴",
                "category": "movement",
                "default_params": {"height": 1},
                "description": "Make the character jump to specified height",
                "available_levels": [1, 2, 3, 4]  # Available in all levels
            },
            "pick_object": {
                "type": BlockType.PICK_OBJECT.value,
                "label": "Pick Object",
                "icon": "✋",
                "category": "action",
                "default_params": {"object_name": "item"},
                "description": "Pick up an object in the environment",
                "available_levels": [1, 2, 3, 4]  # Available in all levels
            },
            "loop": {
                "type": BlockType.LOOP.value,
                "label": "Loop",
                "icon": "⟳",
                "category": "control",
                "default_params": {"iterations": 3, "body": []},
                "description": "Repeat a sequence of commands multiple times",
                "available_levels": [4]  # Level 4: Loops
            },
            "conditional": {
                "type": BlockType.CONDITIONAL.value,
                "label": "If/Else",
                "icon": "?",
                "category": "control",
                "default_params": {"condition": "True", "if_body": [], "else_body": []},
                "description": "Execute commands based on a condition",
                "available_levels": [3, 4]  # Level 3: If statement, also available in Level 4
            },
            "print": {
                "type": BlockType.PRINT.value,
                "label": "Print",
                "icon": "💬",
                "category": "utility",
                "default_params": {"message": "Hello"},
                "description": "Print a message to the console",
                "available_levels": [1, 2, 3, 4]  # Level 1: print statement, available in all levels
            },
            "wait": {
                "type": BlockType.WAIT.value,
                "label": "Wait",
                "icon": "⏱",
                "category": "utility",
                "default_params": {"seconds": 1},
                "description": "Pause execution for specified seconds",
                "available_levels": [2, 3, 4]  # Available from Level 2 onwards
            }
        }
    
    def set_level(self, level: int) -> None:
        """
        Set the current level for command filtering.
        
        Args:
            level: The level number (1, 2, 3, or 4)
        """
        self.current_level = level
    
    def get_level(self) -> int:
        """Get the current level."""
        return self.current_level
    
    def is_command_available(self, command_id: str) -> bool:
        """
        Check if a command is available at the current level.
        
        Args:
            command_id: ID of the command to check
            
        Returns:
            True if command is available at current level, False otherwise
        """
        cmd = self.commands.get(command_id)
        if not cmd:
            return False
        return self.current_level in cmd.get("available_levels", [])
    
    def get_commands_by_category(self, filter_by_level: bool = True) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get commands organized by category, optionally filtered by current level.
        
        Args:
            filter_by_level: If True, only return commands available at current level
            
        Returns:
            Dictionary of commands grouped by category
        """
        categories = {}
        for cmd_id, cmd_data in self.commands.items():
            # Filter by level if requested
            if filter_by_level and self.current_level not in cmd_data.get("available_levels", []):
                continue
                
            category = cmd_data["category"]
            if category not in categories:
                categories[category] = []
            categories[category].append({
                "id": cmd_id,
                **cmd_data
            })
        return categories
    
    def get_command(self, command_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific command by ID."""
        return self.commands.get(command_id)
    
    def get_all_commands(self, filter_by_level: bool = True) -> List[Dict[str, Any]]:
        """
        Get all available commands, optionally filtered by current level.
        
        Args:
            filter_by_level: If True, only return commands available at current level
            
        Returns:
            List of all commands (filtered or unfiltered)
        """
        all_commands = []
        for cmd_id, cmd_data in self.commands.items():
            # Filter by level if requested
            if filter_by_level and self.current_level not in cmd_data.get("available_levels", []):
                continue
            all_commands.append({"id": cmd_id, **cmd_data})
        return all_commands


class VisualWorkflow:
    """
    Visual workflow manager for displaying commands in a sequence list.
    Maintains the sequence of selected commands.
    """
    
    def __init__(self):
        self.sequence: List[Dict[str, Any]] = []
        self.current_index: int = -1
    
    def add_command(self, command: Dict[str, Any]) -> int:
        """
        Add a command to the sequence.
        
        Args:
            command: Command dictionary with type and params
            
        Returns:
            Index of the added command
        """
        self.sequence.append(command)
        return len(self.sequence) - 1
    
    def insert_command(self, index: int, command: Dict[str, Any]) -> None:
        """Insert a command at a specific position."""
        self.sequence.insert(index, command)
    
    def remove_command(self, index: int) -> None:
        """Remove a command from the sequence."""
        if 0 <= index < len(self.sequence):
            self.sequence.pop(index)
    
    def move_command(self, from_index: int, to_index: int) -> None:
        """Move a command from one position to another."""
        if 0 <= from_index < len(self.sequence) and 0 <= to_index < len(self.sequence):
            command = self.sequence.pop(from_index)
            self.sequence.insert(to_index, command)
    
    def update_command(self, index: int, command: Dict[str, Any]) -> None:
        """Update a command at a specific position."""
        if 0 <= index < len(self.sequence):
            self.sequence[index] = command
    
    def clear(self) -> None:
        """Clear all commands from the sequence."""
        self.sequence.clear()
        self.current_index = -1
    
    def get_sequence(self) -> List[Dict[str, Any]]:
        """Get the full command sequence."""
        return self.sequence.copy()
    
    def get_command(self, index: int) -> Optional[Dict[str, Any]]:
        """Get a command at a specific index."""
        if 0 <= index < len(self.sequence):
            return self.sequence[index]
        return None
    
    def get_visual_representation(self) -> str:
        """Get a visual text representation of the workflow."""
        if not self.sequence:
            return "Empty workflow - add commands to get started!"
        
        visual = "Visual Workflow:\n"
        visual += "=" * 50 + "\n"
        for idx, cmd in enumerate(self.sequence):
            marker = "►" if idx == self.current_index else " "
            visual += f"{marker} {idx + 1}. {cmd.get('type', 'unknown')} - {cmd.get('params', {})}\n"
        visual += "=" * 50
        return visual


class CodeGenerator:
    """
    Deterministic code generator that converts blocks to Python code.
    Supports live code display and toggling between template-based and AI-generated code.
    """
    
    def __init__(self):
        self.indent_level = 0
        self.indent_size = 4
        self.variables = {}
        self.display_mode = CodeDisplayMode.TEMPLATE_BASED
        self.workflow = VisualWorkflow()
        self.palette = CommandPalette()
        
    def reset(self):
        """Reset generator state."""
        self.indent_level = 0
        self.variables = {}
    
    def set_display_mode(self, mode: CodeDisplayMode) -> None:
        """
        Toggle between template-based deterministic code and AI-generated code.
        
        Args:
            mode: The code display mode to use
        """
        self.display_mode = mode
    
    def get_display_mode(self) -> CodeDisplayMode:
        """Get the current code display mode."""
        return self.display_mode
    
    def generate_live_code_preview(self, blocks: List[Dict[str, Any]]) -> str:
        """
        Generate live code preview as commands are added to the workflow.
        This provides real-time feedback in the side panel.
        
        Args:
            blocks: List of block dictionaries
            
        Returns:
            Generated Python code string
        """
        code, _ = self.generate_from_blocks(blocks, include_implementations=False)
        return code
    
    def generate_code_for_single_command(self, block: Dict[str, Any]) -> str:
        """
        Generate code for a single command (used for live updates).
        
        Args:
            block: Single block dictionary
            
        Returns:
            Generated code string for this command
        """
        self.reset()
        code, _ = self._process_block(block, 0)
        return code if code else "# No code generated"
    
    def _indent(self) -> str:
        """Return current indentation string."""
        return " " * (self.indent_level * self.indent_size)
    
    def display_code_with_mode(self, blocks: List[Dict[str, Any]]) -> Dict[str, str]:
        """
        Generate and display code based on current display mode.
        Returns both template-based and AI-generated versions for comparison.
        
        Args:
            blocks: List of block dictionaries
            
        Returns:
            Dictionary with 'template_based' and 'ai_generated' code
        """
        # Generate template-based code
        template_code, _ = self.generate_from_blocks(blocks, include_implementations=False)
        
        # Generate AI-generated code (placeholder for now)
        # In a real implementation, this would call an AI API
        ai_code = self._generate_ai_code_placeholder(blocks)
        
        return {
            "template_based": template_code,
            "ai_generated": ai_code,
            "active_mode": self.display_mode.value
        }
    
    def _generate_ai_code_placeholder(self, blocks: List[Dict[str, Any]]) -> str:
        """
        Placeholder for AI-generated code.
        In production, this would call an AI API like OpenAI or Claude.
        """
        prompt = f"Generate Python code for the following commands:\n"
        for idx, block in enumerate(blocks):
            prompt += f"{idx + 1}. {block.get('type')} with params {block.get('params')}\n"
        
        # For now, return a more natural AI-style code with comments
        return f"""# AI-Generated Code
# This is a placeholder for AI-generated code
# In production, this would be generated by an AI model

{prompt}
# The AI would generate more natural, optimized code here
"""
    
    def generate_from_blocks(self, blocks: List[Dict[str, Any]], include_implementations: bool = False) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Generate Python code and execution plan from block definitions.
        
        Args:
            blocks: List of block dictionaries with type and parameters
            include_implementations: If True, includes actual function implementations for executable code
            
        Returns:
            Tuple of (generated_code, execution_plan)
        """
        self.reset()
        code_lines = []
        execution_plan = []
        
        # Add imports and setup
        code_lines.append("# Generated code from visual blocks")
        code_lines.append("import time")
        
        # Add function implementations if requested
        if include_implementations:
            code_lines.append("")
            code_lines.extend(self._get_function_implementations())
        
        code_lines.append("")
        code_lines.append("# Main program")
        code_lines.append("")
        
        # Process each block
        for idx, block in enumerate(blocks):
            block_code, block_plan = self._process_block(block, idx)
            if block_code:
                code_lines.append(block_code)
            if block_plan:
                execution_plan.extend(block_plan)
        
        # Add final position display if implementations are included
        if include_implementations:
            code_lines.append("")
            code_lines.append("# Show results")
            code_lines.append("show_final_position()")
        
        return "\n".join(code_lines), execution_plan
    
    def _get_function_implementations(self) -> List[str]:
        """
        Get actual Python function implementations for movement commands.
        This makes the generated code executable.
        """
        return [
            "# Character state",
            "class Character:",
            "    def __init__(self):",
            "        self.x = 0",
            "        self.y = 0",
            "        self.angle = 0  # degrees (0 = facing right)",
            "        self.history = []",
            "        self.inventory = []  # For picked objects",
            "        ",
            "    def log_action(self, action):",
            "        self.history.append(action)",
            "        print(f'  → {action}')",
            "",
            "character = Character()",
            "",
            "# Movement functions",
            "def move_forward(distance):",
            "    \"\"\"Move the character forward in the current direction.\"\"\"",
            "    import math",
            "    radians = math.radians(character.angle)",
            "    character.x += distance * math.cos(radians)",
            "    character.y += distance * math.sin(radians)",
            "    character.log_action(f'Moved forward {distance} units to ({character.x:.2f}, {character.y:.2f})')",
            "",
            "def move_backward(distance):",
            "    \"\"\"Move the character backward.\"\"\"",
            "    move_forward(-distance)",
            "",
            "def turn_left(degrees):",
            "    \"\"\"Turn the character left (counter-clockwise).\"\"\"",
            "    character.angle = (character.angle + degrees) % 360",
            "    character.log_action(f'Turned left {degrees}° (now facing {character.angle:.1f}°)')",
            "",
            "def turn_right(degrees):",
            "    \"\"\"Turn the character right (clockwise).\"\"\"",
            "    character.angle = (character.angle - degrees) % 360",
            "    character.log_action(f'Turned right {degrees}° (now facing {character.angle:.1f}°)')",
            "",
            "def jump(height):",
            "    \"\"\"Make the character jump.\"\"\"",
            "    character.log_action(f'Jumped {height} units high')",
            "",
            "def pick_object(object_name):",
            "    \"\"\"Pick up an object and add it to inventory.\"\"\"",
            "    character.inventory.append(object_name)",
            "    character.log_action(f'Picked up {object_name} (inventory: {len(character.inventory)} items)')",
            "",
            "def show_final_position():",
            "    \"\"\"Display the final character position.\"\"\"",
            "    print(f'\\n📍 Final Position: ({character.x:.2f}, {character.y:.2f})')",
            "    print(f'📐 Final Angle: {character.angle:.1f}°')",
            "    print(f'📊 Total Actions: {len(character.history)}')",
            "    print(f'🎒 Inventory: {character.inventory}')",
            ""
        ]
    
    def _process_block(self, block: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Process a single block and return code and execution plan.
        
        Args:
            block: Block dictionary
            idx: Block index
            
        Returns:
            Tuple of (code_string, execution_plan_items)
        """
        block_type = block.get("type", "")
        params = block.get("params", {})
        
        # Route to appropriate handler
        handlers = {
            BlockType.MOVE_FORWARD.value: self._handle_move_forward,
            BlockType.MOVE_BACKWARD.value: self._handle_move_backward,
            BlockType.TURN_LEFT.value: self._handle_turn_left,
            BlockType.TURN_RIGHT.value: self._handle_turn_right,
            BlockType.JUMP.value: self._handle_jump,
            BlockType.LOOP.value: self._handle_loop,
            BlockType.CONDITIONAL.value: self._handle_conditional,
            BlockType.PRINT.value: self._handle_print,
            BlockType.VARIABLE.value: self._handle_variable,
            BlockType.FUNCTION.value: self._handle_function,
            BlockType.WAIT.value: self._handle_wait,
            BlockType.PICK_OBJECT.value: self._handle_pick_object,
        }
        
        handler = handlers.get(block_type)
        if handler:
            return handler(params, idx)
        else:
            return self._handle_unknown(block_type, params, idx)
    
    def _handle_move_forward(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle move forward block."""
        distance = params.get("distance", 1)
        code = f"{self._indent()}print(f\"{{\'move forward\'}}\")"
        
        plan = [{
            "step": idx,
            "action": "move",
            "direction": "forward",
            "distance": distance,
            "duration": 1.0
        }]
        
        return code, plan
    
    def _handle_move_backward(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle move backward block."""
        distance = params.get("distance", 1)
        code = f"{self._indent()}# Move backward {distance} units\n"
        code += f"{self._indent()}move_backward({distance})"
        
        plan = [{
            "step": idx,
            "action": "move",
            "direction": "backward",
            "distance": distance,
            "duration": 1.0
        }]
        
        return code, plan
    
    def _handle_turn_left(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle turn left block."""
        degrees = params.get("degrees", 90)
        code = f"{self._indent()}print(f\"{{\'turn left\'}}\")"
        
        plan = [{
            "step": idx,
            "action": "rotate",
            "direction": "left",
            "degrees": degrees,
            "duration": 0.5
        }]
        
        return code, plan
    
    def _handle_turn_right(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle turn right block."""
        degrees = params.get("degrees", 90)
        code = f"{self._indent()}print(f\"{{\'turn right\'}}\")"
        
        plan = [{
            "step": idx,
            "action": "rotate",
            "direction": "right",
            "degrees": degrees,
            "duration": 0.5
        }]
        
        return code, plan
    
    def _handle_jump(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle jump block."""
        height = params.get("height", 1)
        code = f"{self._indent()}# Jump {height} units high\n"
        code += f"{self._indent()}jump({height})"
        
        plan = [{
            "step": idx,
            "action": "jump",
            "height": height,
            "duration": 0.8
        }]
        
        return code, plan
    
    def _handle_pick_object(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle pick object block."""
        object_name = params.get("object_name", "item")
        code = f"{self._indent()}print(f\"{{\'claim a coin\'}}\")"
        
        plan = [{
            "step": idx,
            "action": "pick_object",
            "object_name": object_name,
            "duration": 0.5
        }]
        
        return code, plan
    
    def _handle_loop(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle loop block."""
        iterations = params.get("iterations", 3)
        body = params.get("body", [])
        
        code = f"{self._indent()}# Loop {iterations} times\n"
        code += f"{self._indent()}for i in range({iterations}):\n"
        
        self.indent_level += 1
        body_code_lines = []
        body_plan = []
        
        for body_idx, body_block in enumerate(body):
            body_code, body_block_plan = self._process_block(body_block, f"{idx}_{body_idx}")
            if body_code:
                body_code_lines.append(body_code)
            if body_block_plan:
                # Replicate body plan for each iteration
                for iteration in range(iterations):
                    for plan_item in body_block_plan:
                        plan_copy = plan_item.copy()
                        plan_copy["step"] = f"{idx}_iter{iteration}_{body_idx}"
                        plan_copy["loop_iteration"] = iteration
                        body_plan.append(plan_copy)
        
        self.indent_level -= 1
        
        if body_code_lines:
            code += "\n" + "\n".join(body_code_lines)
        else:
            code += f"{self._indent()}    pass"
        
        return code, body_plan
    
    def _handle_conditional(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle conditional (if/else) block."""
        condition = params.get("condition", "True")
        if_body = params.get("if_body", [])
        else_body = params.get("else_body", [])
        
        code = f"{self._indent()}# Conditional: if {condition}\n"
        code += f"{self._indent()}if {condition}:\n"
        
        self.indent_level += 1
        if_code_lines = []
        if_plan = []
        
        for body_idx, body_block in enumerate(if_body):
            body_code, body_block_plan = self._process_block(body_block, f"{idx}_if_{body_idx}")
            if body_code:
                if_code_lines.append(body_code)
            if body_block_plan:
                if_plan.extend(body_block_plan)
        
        self.indent_level -= 1
        
        if if_code_lines:
            code += "\n" + "\n".join(if_code_lines)
        else:
            code += f"{self._indent()}    pass"
        
        if else_body:
            code += f"\n{self._indent()}else:\n"
            self.indent_level += 1
            else_code_lines = []
            
            for body_idx, body_block in enumerate(else_body):
                body_code, body_block_plan = self._process_block(body_block, f"{idx}_else_{body_idx}")
                if body_code:
                    else_code_lines.append(body_code)
                if body_block_plan:
                    if_plan.extend(body_block_plan)
            
            self.indent_level -= 1
            
            if else_code_lines:
                code += "\n" + "\n".join(else_code_lines)
            else:
                code += f"{self._indent()}    pass"
        
        # Add conditional marker to execution plan
        plan = [{
            "step": idx,
            "action": "conditional",
            "condition": condition,
            "branches": if_plan
        }]
        
        return code, plan
    
    def _handle_print(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle print block."""
        message = params.get("message", "Hello")
        code = f"{self._indent()}# Print message\n"
        code += f"{self._indent()}print(\"{message}\")"
        
        plan = [{
            "step": idx,
            "action": "print",
            "message": message,
            "duration": 0.3
        }]
        
        return code, plan
    
    def _handle_variable(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle variable assignment block."""
        var_name = params.get("name", "x")
        value = params.get("value", 0)
        self.variables[var_name] = value
        
        code = f"{self._indent()}# Set variable {var_name}\n"
        code += f"{self._indent()}{var_name} = {repr(value)}"
        
        plan = [{
            "step": idx,
            "action": "variable",
            "name": var_name,
            "value": value,
            "duration": 0.2
        }]
        
        return code, plan
    
    def _handle_function(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle function definition block."""
        func_name = params.get("name", "my_function")
        func_params = params.get("parameters", [])
        body = params.get("body", [])
        
        param_str = ", ".join(func_params) if func_params else ""
        code = f"{self._indent()}# Define function {func_name}\n"
        code += f"{self._indent()}def {func_name}({param_str}):\n"
        
        self.indent_level += 1
        body_code_lines = []
        body_plan = []
        
        for body_idx, body_block in enumerate(body):
            body_code, body_block_plan = self._process_block(body_block, f"{idx}_func_{body_idx}")
            if body_code:
                body_code_lines.append(body_code)
            if body_block_plan:
                body_plan.extend(body_block_plan)
        
        self.indent_level -= 1
        
        if body_code_lines:
            code += "\n" + "\n".join(body_code_lines)
        else:
            code += f"{self._indent()}    pass"
        
        plan = [{
            "step": idx,
            "action": "function_definition",
            "name": func_name,
            "parameters": func_params,
            "body_plan": body_plan
        }]
        
        return code, plan
    
    def _handle_wait(self, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle wait/sleep block."""
        seconds = params.get("seconds", 1)
        code = f"{self._indent()}# Wait {seconds} seconds\n"
        code += f"{self._indent()}time.sleep({seconds})"
        
        plan = [{
            "step": idx,
            "action": "wait",
            "duration": seconds
        }]
        
        return code, plan
    
    def _handle_unknown(self, block_type: str, params: Dict[str, Any], idx: int) -> Tuple[str, List[Dict[str, Any]]]:
        """Handle unknown block type."""
        code = f"{self._indent()}# Unknown block type: {block_type}\n"
        code += f"{self._indent()}pass  # TODO: Implement {block_type}"
        
        plan = [{
            "step": idx,
            "action": "unknown",
            "type": block_type,
            "duration": 0.1
        }]
        
        return code, plan


# Utility classes and functions for gameplay integration

class GameplaySession:
    """
    Main gameplay session manager that integrates command palette,
    visual workflow, and code generation.
    Supports level-based command filtering.
    """
    
    def __init__(self, current_level: int = 1):
        self.current_level = current_level
        self.palette = CommandPalette(current_level=current_level)
        self.workflow = VisualWorkflow()
        self.generator = CodeGenerator()
        self.code_cache = ""
        
    def set_level(self, level: int) -> None:
        """
        Set the current level for the gameplay session.
        
        Args:
            level: The level number (1, 2, 3, or 4)
        """
        self.current_level = level
        self.palette.set_level(level)
    
    def get_level(self) -> int:
        """Get the current level."""
        return self.current_level
    
    def get_available_commands_for_level(self, level: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get all commands available for a specific level.
        
        Args:
            level: The level to get commands for (defaults to current level)
            
        Returns:
            List of available commands for the level
        """
        if level is not None and level != self.current_level:
            # Temporarily switch to the requested level
            old_level = self.current_level
            self.set_level(level)
            commands = self.palette.get_all_commands(filter_by_level=True)
            self.set_level(old_level)
            return commands
        return self.palette.get_all_commands(filter_by_level=True)
    
    def add_command_from_palette(self, command_id: str, custom_params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Add a command from the palette to the workflow and generate code.
        Checks if command is available at current level.
        
        Args:
            command_id: ID of the command from the palette
            custom_params: Optional custom parameters (overrides defaults)
            
        Returns:
            Dictionary with command info and generated code
        """
        # Check if command is available at current level
        if not self.palette.is_command_available(command_id):
            return {
                "error": f"Command '{command_id}' is not available at Level {self.current_level}",
                "success": False
            }
        
        # Get command from palette
        cmd_info = self.palette.get_command(command_id)
        if not cmd_info:
            return {"error": f"Command '{command_id}' not found in palette", "success": False}
        
        # Create block with parameters
        params = cmd_info["default_params"].copy()
        if custom_params:
            params.update(custom_params)
        
        block = {
            "type": cmd_info["type"],
            "params": params
        }
        
        # Add to workflow
        idx = self.workflow.add_command(block)
        
        # Generate code for just this command
        single_code = self.generator.generate_code_for_single_command(block)
        
        # Generate updated full code
        self.update_code_display()
        
        # Print the generated code immediately
        print(f"\n✅ Generated code for '{cmd_info['label']}':")
        print(single_code)
        
        return {
            "success": True,
            "command_id": command_id,
            "command_label": cmd_info["label"],
            "index": idx,
            "block": block,
            "code": self.code_cache,
            "single_command_code": single_code
        }
    
    def remove_command_from_workflow(self, index: int) -> Dict[str, Any]:
        """Remove a command from the workflow and update code."""
        self.workflow.remove_command(index)
        self.update_code_display()
        
        return {
            "success": True,
            "code": self.code_cache
        }
    
    def update_code_display(self) -> str:
        """
        Update the code display with current workflow.
        Returns the generated code.
        """
        sequence = self.workflow.get_sequence()
        self.code_cache = self.generator.generate_live_code_preview(sequence)
        return self.code_cache
    
    def get_code_with_mode(self, mode: CodeDisplayMode) -> Dict[str, str]:
        """
        Get code in specified display mode.
        
        Args:
            mode: The code display mode (template-based or AI-generated)
            
        Returns:
            Dictionary with code for both modes and active mode
        """
        self.generator.set_display_mode(mode)
        sequence = self.workflow.get_sequence()
        return self.generator.display_code_with_mode(sequence)
    
    def get_visual_workflow(self) -> str:
        """Get visual representation of the current workflow."""
        return self.workflow.get_visual_representation()
    
    def get_palette_commands_by_category(self, filter_by_level: bool = True) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get all available commands organized by category.
        
        Args:
            filter_by_level: If True, only return commands available at current level
            
        Returns:
            Dictionary of commands grouped by category
        """
        return self.palette.get_commands_by_category(filter_by_level=filter_by_level)
    
    def export_session(self) -> Dict[str, Any]:
        """
        Export the current session state.
        
        Returns:
            Dictionary with workflow, code, and metadata
        """
        return {
            "workflow": self.workflow.get_sequence(),
            "code": {
                "template_based": self.code_cache,
                "active_mode": self.generator.get_display_mode().value
            },
            "visual_workflow": self.get_visual_workflow()
        }
    
    def import_session(self, session_data: Dict[str, Any]) -> None:
        """
        Import a session state.
        
        Args:
            session_data: Previously exported session data
        """
        # Clear current workflow
        self.workflow.clear()
        
        # Import workflow
        if "workflow" in session_data:
            for cmd in session_data["workflow"]:
                self.workflow.add_command(cmd)
        
        # Update code display
        self.update_code_display()


def demonstrate_level_based_commands():
    """
    Demonstration function showing level-based command filtering.
    """
    print("=" * 70)
    print("DEMONSTRATION: Level-Based Command Filtering")
    print("=" * 70)
    
    # Show commands available at each level
    for level in [1, 2, 3, 4]:
        print(f"\n{'=' * 70}")
        print(f"LEVEL {level} - Available Commands:")
        print('=' * 70)
        
        session = GameplaySession(current_level=level)
        categories = session.get_palette_commands_by_category(filter_by_level=True)
        
        if not categories:
            print("  No commands available at this level.")
        else:
            for category, commands in categories.items():
                print(f"\n📁 {category.upper()}:")
                for cmd in commands:
                    print(f"  {cmd['icon']} {cmd['label']}: {cmd['description']}")
        
        # Show examples of trying to use level-specific commands
        print(f"\n--- Testing Command Availability ---")
        
        if level == 1:
            result = session.add_command_from_palette("print", {"message": "Level 1 Print!"})
            if result.get("success"):
                print(f"✅ LEVEL 1: Can use 'print' statement")
            
            result = session.add_command_from_palette("conditional")
            if not result.get("success"):
                print(f"❌ LEVEL 1: Cannot use 'if' statement - {result.get('error')}")
                
            result = session.add_command_from_palette("loop")
            if not result.get("success"):
                print(f"❌ LEVEL 1: Cannot use 'loop' - {result.get('error')}")
        
        elif level == 3:
            result = session.add_command_from_palette("conditional", {"condition": "x > 5", "if_body": []})
            if result.get("success"):
                print(f"✅ LEVEL 3: Can use 'if' statement")
            
            result = session.add_command_from_palette("print", {"message": "Level 3 Print!"})
            if result.get("success"):
                print(f"✅ LEVEL 3: Can use 'print' statement")
                
            result = session.add_command_from_palette("loop")
            if not result.get("success"):
                print(f"❌ LEVEL 3: Cannot use 'loop' - {result.get('error')}")
        
        elif level == 4:
            result = session.add_command_from_palette("loop", {"iterations": 3, "body": []})
            if result.get("success"):
                print(f"✅ LEVEL 4: Can use 'loop'")
            
            result = session.add_command_from_palette("conditional", {"condition": "x > 5", "if_body": []})
            if result.get("success"):
                print(f"✅ LEVEL 4: Can use 'if' statement")
            
            result = session.add_command_from_palette("print", {"message": "Level 4 Print!"})
            if result.get("success"):
                print(f"✅ LEVEL 4: Can use 'print' statement")
    
    print("\n" + "=" * 70)
    print("END OF LEVEL-BASED DEMONSTRATION")
    print("=" * 70)


def demonstrate_gameplay_features():
    """
    Demonstration function showing how the core gameplay features work.
    """
    print("=" * 70)
    print("DEMONSTRATION: Core Gameplay Features")
    print("=" * 70)
    
    # Create a gameplay session
    session = GameplaySession()
    
    print("\n1. COMMAND PALETTE - Available Commands:")
    print("-" * 70)
    categories = session.get_palette_commands_by_category()
    for category, commands in categories.items():
        print(f"\n📁 {category.upper()}:")
        for cmd in commands:
            print(f"  {cmd['icon']} {cmd['label']}: {cmd['description']}")
    
    print("\n\n2. COMMAND SELECTION - Adding commands to workflow:")
    print("-" * 70)
    
    # Add some commands
    session.add_command_from_palette("move", {"distance": 5})
    print("✓ Added: Move Forward (5 units)")
    
    session.add_command_from_palette("turn_right", {"degrees": 90})
    print("✓ Added: Turn Right (90 degrees)")
    
    session.add_command_from_palette("pick_object", {"object_name": "key"})
    print("✓ Added: Pick Object (key)")
    
    session.add_command_from_palette("move", {"distance": 3})
    print("✓ Added: Move Forward (3 units)")
    
    print("\n\n3. VISUAL WORKFLOW - Sequence List:")
    print("-" * 70)
    print(session.get_visual_workflow())
    
    print("\n\n4. CODE DISPLAY - Generated Python Code:")
    print("-" * 70)
    print("Template-based Deterministic Code:")
    print(session.code_cache)
    
    print("\n\n5. CODE DISPLAY WITH NESTING - Loop Example:")
    print("-" * 70)
    session.workflow.clear()
    loop_body = [
        {"type": "move_forward", "params": {"distance": 2}},
        {"type": "turn_right", "params": {"degrees": 90}},
        {"type": "pick_object", "params": {"object_name": "coin"}}
    ]
    session.workflow.add_command({
        "type": "loop",
        "params": {"iterations": 4, "body": loop_body}
    })
    session.update_code_display()
    print("Commands wrapped in loop with proper nesting and indentation:")
    print(session.code_cache)
    
    print("\n\n6. TOGGLE DISPLAY MODE - AI-Generated vs Template-Based:")
    print("-" * 70)
    code_both = session.get_code_with_mode(CodeDisplayMode.TEMPLATE_BASED)
    print(f"Active Mode: {code_both['active_mode']}")
    print("\nTemplate-Based Code:")
    print(code_both['template_based'][:200] + "...")
    print("\nAI-Generated Code Preview:")
    print(code_both['ai_generated'][:200] + "...")
    
    print("\n" + "=" * 70)
    print("END OF DEMONSTRATION")
    print("=" * 70)


if __name__ == "__main__":
    # Run demonstrations when module is executed directly
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--levels":
        # Show level-based command filtering demo
        demonstrate_level_based_commands()
    elif len(sys.argv) > 1 and sys.argv[1] == "--all":
        # Show both demos
        demonstrate_level_based_commands()
        print("\n\n")
        demonstrate_gameplay_features()
    else:
        # Default: show gameplay features demo
        print("Usage: python code_generator.py [--levels|--all]")
        print("  --levels: Show level-based command filtering demo")
        print("  --all: Show all demonstrations")
        print("\nRunning default demonstration...\n")
        demonstrate_gameplay_features()

