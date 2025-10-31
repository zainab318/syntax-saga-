#!/usr/bin/env python3
"""
Interactive Code Generator - Terminal Interface
User can input workflow commands and get generated Python code.
"""

from code_generator import GameplaySession, CodeDisplayMode, CommandPalette
import sys


class InteractiveTerminal:
    """Interactive terminal interface for code generation with level support."""
    
    def __init__(self, initial_level: int = 1):
        self.current_level = initial_level
        self.session = GameplaySession(current_level=initial_level)
        self.palette = CommandPalette(current_level=initial_level)
        self.running = True
        
    def clear_screen(self):
        """Clear the terminal screen."""
        print("\n" * 2)
        
    def print_header(self):
        """Print the application header."""
        print("=" * 70)
        print(f"🎮 INTERACTIVE CODE GENERATOR - LEVEL {self.current_level}")
        print("=" * 70)
        
    def print_menu(self):
        """Print the main menu."""
        print("\n📋 MAIN MENU:")
        print("-" * 70)
        print("1. View Available Commands")
        print("2. Add Command to Workflow")
        print("3. View Current Workflow")
        print("4. Generate Code (Template-Based)")
        print("5. Generate Code (AI-Generated)")
        print("6. Generate Executable Code")
        print("7. Clear Workflow")
        print("8. Remove Last Command")
        print("9. Export Workflow")
        print("L. Change Level (Current: Level {})".format(self.current_level))
        print("0. Exit")
        print("-" * 70)
        
    def display_available_commands(self):
        """Display all available commands by category."""
        print("\n📦 AVAILABLE COMMANDS:")
        print("=" * 70)
        
        categories = self.palette.get_commands_by_category()
        for category_name, commands in categories.items():
            print(f"\n📁 {category_name.upper()}")
            print("-" * 70)
            for idx, cmd in enumerate(commands, 1):
                print(f"  {idx}. {cmd['icon']} {cmd['label']:<20} | {cmd['description']}")
                print(f"      Command ID: '{cmd['id']}'")
                print(f"      Default params: {cmd['default_params']}")
            print()
            
    def add_command_interactive(self):
        """Interactive command addition."""
        print("\n➕ ADD COMMAND")
        print("=" * 70)
        
        # Show available commands
        all_commands = self.palette.get_all_commands()
        print("\nAvailable Commands:")
        for idx, cmd in enumerate(all_commands, 1):
            print(f"  {idx}. {cmd['icon']} {cmd['label']}")
        
        # Get user choice
        try:
            choice = input("\nEnter command number (or command ID): ").strip()
            
            # Check if it's a number or ID
            if choice.isdigit():
                cmd_idx = int(choice) - 1
                if 0 <= cmd_idx < len(all_commands):
                    cmd_id = all_commands[cmd_idx]['id']
                else:
                    print("❌ Invalid command number!")
                    return
            else:
                cmd_id = choice
            
            # Get command info
            cmd_info = self.palette.get_command(cmd_id)
            if not cmd_info:
                print(f"❌ Command '{cmd_id}' not found!")
                return
            
            print(f"\n✓ Selected: {cmd_info['label']}")
            
            # Special handling for loop and conditional commands
            custom_params = None
            
            if cmd_id == 'loop':
                # Interactive loop builder
                print("\n📝 Let's build your loop!")
                
                # Get number of iterations
                iterations_input = input("How many times should the loop repeat? (default: 3): ").strip()
                iterations = 3
                if iterations_input:
                    try:
                        iterations = int(iterations_input)
                    except ValueError:
                        print("⚠️  Invalid number, using default: 3")
                        iterations = 3
                
                # Build loop body interactively
                loop_body = self.build_loop_body_interactive()
                
                custom_params = {
                    "iterations": iterations,
                    "body": loop_body
                }
                
            elif cmd_id == 'conditional':
                # Interactive conditional builder
                print("\n📝 Let's build your if/else statement!")
                conditional_params = self.build_conditional_body_interactive()
                custom_params = conditional_params
                
            else:
                # Regular command - ask for parameter customization
                print(f"Default parameters: {cmd_info['default_params']}")
                customize = input("\nCustomize parameters? (y/n): ").strip().lower()
                
                if customize == 'y':
                    custom_params = self.get_custom_parameters(cmd_info)
            
            # Add command
            result = self.session.add_command_from_palette(cmd_id, custom_params)
            
            if result.get('success'):
                print(f"\n✅ Added: {result['command_label']}")
                print(f"Position: {result['index'] + 1}")
                
                # Show generated code for loop and conditional
                if cmd_id in ['loop', 'conditional']:
                    print("\n📄 Generated Code:")
                    print("-" * 70)
                    print(result.get('single_command_code', ''))
                    print("-" * 70)
            else:
                print(f"\n❌ Error: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"\n❌ Error: {e}")
            
    def build_loop_body_interactive(self):
        """Interactive loop body builder - lets user add commands to the loop."""
        print("\n🔁 BUILD LOOP BODY")
        print("=" * 70)
        print("Add commands that will be executed inside the loop.")
        print("Type 'done' when finished adding commands.\n")
        
        loop_body = []
        command_count = 0
        
        while True:
            print(f"\n--- Loop Command #{command_count + 1} ---")
            
            # Show available commands (excluding nested loops for simplicity)
            available_cmds = [cmd for cmd in self.palette.get_all_commands() 
                             if cmd['id'] not in ['loop', 'conditional']]
            
            print("Available commands:")
            for idx, cmd in enumerate(available_cmds, 1):
                print(f"  {idx}. {cmd['icon']} {cmd['label']}")
            
            choice = input("\nEnter command number (or 'done' to finish): ").strip().lower()
            
            if choice == 'done' or choice == 'd':
                break
            
            try:
                cmd_idx = int(choice) - 1
                if 0 <= cmd_idx < len(available_cmds):
                    cmd = available_cmds[cmd_idx]
                    cmd_id = cmd['id']
                    
                    # Get parameters for this command
                    print(f"\n✓ Adding: {cmd['label']}")
                    print(f"Default parameters: {cmd['default_params']}")
                    
                    customize = input("Customize parameters? (y/n): ").strip().lower()
                    
                    if customize == 'y':
                        params = self.get_custom_parameters(cmd)
                    else:
                        params = cmd['default_params'].copy()
                    
                    # Add to loop body
                    loop_body.append({
                        "type": cmd['type'],
                        "params": params
                    })
                    
                    command_count += 1
                    print(f"✅ Added '{cmd['label']}' to loop body")
                else:
                    print("❌ Invalid command number!")
            except ValueError:
                print("❌ Please enter a valid number or 'done'")
        
        if not loop_body:
            print("\n⚠️  No commands added to loop body. Adding a placeholder pass statement.")
        else:
            print(f"\n✅ Loop body complete with {len(loop_body)} command(s)")
        
        return loop_body
    
    def build_conditional_body_interactive(self):
        """Interactive conditional body builder - lets user add commands to if/else blocks."""
        print("\n🔀 BUILD IF/ELSE BODY")
        print("=" * 70)
        
        # Get condition
        condition = input("Enter condition (e.g., 'x > 5', 'coins >= 3'): ").strip()
        if not condition:
            condition = "True"
        
        # Build if body
        print("\n--- IF BODY (when condition is true) ---")
        print("Add commands for the 'if' block. Type 'done' when finished.\n")
        if_body = self._build_command_list_interactive("if")
        
        # Ask about else body
        has_else = input("\nAdd ELSE body? (y/n): ").strip().lower()
        else_body = []
        
        if has_else == 'y':
            print("\n--- ELSE BODY (when condition is false) ---")
            print("Add commands for the 'else' block. Type 'done' when finished.\n")
            else_body = self._build_command_list_interactive("else")
        
        return {
            "condition": condition,
            "if_body": if_body,
            "else_body": else_body
        }
    
    def _build_command_list_interactive(self, block_name):
        """Helper method to build a list of commands interactively."""
        commands = []
        command_count = 0
        
        while True:
            print(f"\n--- {block_name.upper()} Command #{command_count + 1} ---")
            
            # Show available commands (excluding nested structures for simplicity)
            available_cmds = [cmd for cmd in self.palette.get_all_commands() 
                             if cmd['id'] not in ['loop', 'conditional']]
            
            print("Available commands:")
            for idx, cmd in enumerate(available_cmds, 1):
                print(f"  {idx}. {cmd['icon']} {cmd['label']}")
            
            choice = input(f"\nEnter command number (or 'done' to finish {block_name} block): ").strip().lower()
            
            if choice == 'done' or choice == 'd':
                break
            
            try:
                cmd_idx = int(choice) - 1
                if 0 <= cmd_idx < len(available_cmds):
                    cmd = available_cmds[cmd_idx]
                    cmd_id = cmd['id']
                    
                    # Get parameters for this command
                    print(f"\n✓ Adding: {cmd['label']}")
                    print(f"Default parameters: {cmd['default_params']}")
                    
                    customize = input("Customize parameters? (y/n): ").strip().lower()
                    
                    if customize == 'y':
                        params = self.get_custom_parameters(cmd)
                    else:
                        params = cmd['default_params'].copy()
                    
                    # Add to command list
                    commands.append({
                        "type": cmd['type'],
                        "params": params
                    })
                    
                    command_count += 1
                    print(f"✅ Added '{cmd['label']}' to {block_name} block")
                else:
                    print("❌ Invalid command number!")
            except ValueError:
                print("❌ Please enter a valid number or 'done'")
        
        if not commands:
            print(f"\n⚠️  No commands added to {block_name} block.")
        else:
            print(f"\n✅ {block_name.capitalize()} block complete with {len(commands)} command(s)")
        
        return commands
    
    def get_custom_parameters(self, cmd_info):
        """Get custom parameters from user."""
        params = {}
        default_params = cmd_info['default_params']
        
        print("\nEnter custom parameters (press Enter to use default):")
        
        for param_name, default_value in default_params.items():
            # Skip body parameters as they're handled by interactive builders
            if param_name in ['body', 'if_body', 'else_body', 'condition']:
                continue
                
            value_input = input(f"  {param_name} (default: {default_value}): ").strip()
            
            if value_input:
                # Try to convert to appropriate type
                if isinstance(default_value, int):
                    try:
                        params[param_name] = int(value_input)
                    except ValueError:
                        print(f"    ⚠️  Invalid integer, using default: {default_value}")
                        params[param_name] = default_value
                elif isinstance(default_value, float):
                    try:
                        params[param_name] = float(value_input)
                    except ValueError:
                        print(f"    ⚠️  Invalid number, using default: {default_value}")
                        params[param_name] = default_value
                elif isinstance(default_value, bool):
                    params[param_name] = value_input.lower() in ['true', 'yes', '1', 'y']
                else:
                    params[param_name] = value_input
            else:
                params[param_name] = default_value
                
        return params
        
    def display_workflow(self):
        """Display the current workflow."""
        print("\n📊 CURRENT WORKFLOW:")
        print("=" * 70)
        print(self.session.get_visual_workflow())
        
    def generate_and_display_code(self, mode='template', executable=False):
        """Generate and display code."""
        print("\n💻 GENERATED CODE:")
        print("=" * 70)
        
        if mode == 'template':
            print("Mode: Template-Based (Deterministic)\n")
            print(self.session.code_cache)
        elif mode == 'ai':
            print("Mode: AI-Generated\n")
            code_display = self.session.get_code_with_mode(CodeDisplayMode.AI_GENERATED)
            print(code_display['ai_generated'])
        elif mode == 'executable':
            print("Mode: Executable Code (with implementations)\n")
            sequence = self.session.workflow.get_sequence()
            code, _ = self.session.generator.generate_from_blocks(sequence, include_implementations=True)
            print(code)
            
        print("\n" + "=" * 70)
        
    def clear_workflow(self):
        """Clear the workflow."""
        self.session.workflow.clear()
        self.session.update_code_display()
        print("\n✅ Workflow cleared!")
        
    def remove_last_command(self):
        """Remove the last command from workflow."""
        sequence = self.session.workflow.get_sequence()
        if sequence:
            last_idx = len(sequence) - 1
            self.session.remove_command_from_workflow(last_idx)
            print(f"\n✅ Removed last command!")
        else:
            print("\n⚠️  Workflow is empty!")
    
    def change_level(self):
        """Change the current level."""
        print("\n🎯 CHANGE LEVEL:")
        print("=" * 70)
        print(f"Current Level: {self.current_level}")
        print("\nAvailable Levels:")
        print("  1 - Level 1 (Basic movements + Print)")
        print("  2 - Level 2 (Level 1 + Wait)")
        print("  3 - Level 3 (Level 2 + If/Else statements)")
        print("  4 - Level 4 (Level 3 + Loops)")
        print("=" * 70)
        
        try:
            level = int(input("\nEnter level (1-4): ").strip())
            if level in [1, 2, 3, 4]:
                self.current_level = level
                self.session.set_level(level)
                self.palette.set_level(level)
                print(f"\n✅ Level changed to Level {level}!")
                print(f"Commands are now filtered for Level {level}")
            else:
                print("\n❌ Invalid level! Please enter a number between 1 and 4.")
        except ValueError:
            print("\n❌ Invalid input! Please enter a number.")
            
    def export_workflow(self):
        """Export the current workflow."""
        print("\n📤 EXPORT WORKFLOW:")
        print("=" * 70)
        
        export_data = self.session.export_session()
        
        # Display workflow
        print("\nWorkflow Commands:")
        for idx, cmd in enumerate(export_data['workflow'], 1):
            print(f"  {idx}. {cmd['type']} - {cmd['params']}")
        
        # Ask if user wants to save to file
        save = input("\nSave to file? (y/n): ").strip().lower()
        if save == 'y':
            filename = input("Enter filename (default: workflow.json): ").strip()
            if not filename:
                filename = "workflow.json"
            
            import json
            try:
                with open(filename, 'w') as f:
                    json.dump(export_data, f, indent=2)
                print(f"✅ Workflow saved to {filename}")
            except Exception as e:
                print(f"❌ Error saving file: {e}")
        
    def quick_add_mode(self):
        """Quick mode for adding multiple commands."""
        print("\n⚡ QUICK ADD MODE")
        print("=" * 70)
        print("Enter commands quickly. Examples:")
        print("  move 5         - Move forward 5 units")
        print("  turn_left 90   - Turn left 90 degrees")
        print("  turn_right 45  - Turn right 45 degrees")
        print("  jump 3         - Jump 3 units high")
        print("  pick key       - Pick object named 'key'")
        print("  print Hello    - Print 'Hello'")
        print("  done           - Finish and return to menu")
        print("-" * 70)
        
        while True:
            cmd_input = input("\n> ").strip()
            
            if cmd_input.lower() == 'done':
                break
            
            if not cmd_input:
                continue
                
            # Parse command
            parts = cmd_input.split(maxsplit=1)
            if not parts:
                continue
                
            cmd_name = parts[0].lower()
            param_value = parts[1] if len(parts) > 1 else None
            
            # Map to actual commands
            cmd_map = {
                'move': ('move', 'distance'),
                'move_forward': ('move', 'distance'),
                'move_back': ('move_back', 'distance'),
                'move_backward': ('move_back', 'distance'),
                'turn_left': ('turn_left', 'degrees'),
                'left': ('turn_left', 'degrees'),
                'turn_right': ('turn_right', 'degrees'),
                'right': ('turn_right', 'degrees'),
                'jump': ('jump', 'height'),
                'pick': ('pick_object', 'object_name'),
                'pick_object': ('pick_object', 'object_name'),
                'print': ('print', 'message'),
                'wait': ('wait', 'seconds'),
            }
            
            if cmd_name in cmd_map:
                cmd_id, param_name = cmd_map[cmd_name]
                
                custom_params = {}
                if param_value:
                    # Try to convert to number if possible
                    try:
                        if '.' in param_value:
                            custom_params[param_name] = float(param_value)
                        else:
                            custom_params[param_name] = int(param_value)
                    except ValueError:
                        custom_params[param_name] = param_value
                
                result = self.session.add_command_from_palette(cmd_id, custom_params if custom_params else None)
                if result.get('success'):
                    print(f"  ✓ Added: {result['command_label']}")
                else:
                    print(f"  ✗ Error: {result.get('error')}")
            else:
                print(f"  ✗ Unknown command: {cmd_name}")
        
        print("\n✅ Quick add completed!")
        
    def run(self):
        """Run the interactive terminal."""
        self.print_header()
        
        while self.running:
            self.print_menu()
            
            choice = input("\nEnter your choice: ").strip()
            
            if choice == '1':
                self.display_available_commands()
            elif choice == '2':
                self.add_command_interactive()
            elif choice == '3':
                self.display_workflow()
            elif choice == '4':
                self.generate_and_display_code(mode='template')
            elif choice == '5':
                self.generate_and_display_code(mode='ai')
            elif choice == '6':
                self.generate_and_display_code(mode='executable')
            elif choice == '7':
                self.clear_workflow()
            elif choice == '8':
                self.remove_last_command()
            elif choice == '9':
                self.export_workflow()
            elif choice.upper() == 'L':
                self.change_level()
            elif choice == '0':
                print("\n👋 Goodbye!")
                self.running = False
            elif choice == 'quick' or choice == 'q':
                self.quick_add_mode()
            else:
                print("\n❌ Invalid choice! Please try again.")
            
            if self.running and choice != '0':
                input("\nPress Enter to continue...")
                self.clear_screen()
                self.print_header()


def simple_command_interface(level: int = None):
    """Simple interface for selecting and generating commands."""
    
    # First, let user select a level if not provided
    if level is None:
        print("=" * 70)
        print("🎮 SYNTAX SAGA - CODE GENERATOR")
        print("=" * 70)
        print("\n📚 SELECT YOUR LEVEL:")
        print("-" * 70)
        print("1. Level 1 - Basic Movements + Print Statements")
        print("3. Level 3 - Level 1 + If/Else Logic (Key & Door)")
        print("4. Level 4 - Level 3 + Loops")
        print("0. Exit")
        print("-" * 70)
        
        while True:
            choice = input("\n👉 Select level (1, 3, or 4): ").strip()
            if choice == '1':
                level = 1
                break
            elif choice == '3':
                level = 3
                break
            elif choice == '4':
                level = 4
                break
            elif choice == '0':
                print("\n👋 Goodbye!")
                return
            else:
                print("❌ Invalid choice! Please enter 1, 3, 4, or 0")
    
    session = GameplaySession(current_level=level)
    
    print("\n" + "=" * 70)
    print(f"🎮 LEVEL {level} - BUILD YOUR PROGRAM")
    print("=" * 70)
    
    # Show what's available at this level
    if level == 1:
        print("\n📖 Level 1: Learn basic movements and PRINT statements")
        print("Available: Move, Turn, Jump, Pick Object, Print")
    elif level == 3:
        print("\n📖 Level 3: Use IF/ELSE logic to pick the key and unlock the door!")
        print("Available: All Level 1 commands + If/Else statements")
    elif level == 4:
        print("\n📖 Level 4: Use LOOPS to repeat actions efficiently!")
        print("Available: All Level 3 commands + Loops")
    
    while True:
        print("\n📋 AVAILABLE COMMANDS FOR LEVEL {}:".format(level))
        print("-" * 70)
        
        # Show commands based on level
        cmd_num = 1
        available_commands = []
        
        # Basic commands (all levels)
        print(f"{cmd_num}. Move Forward")
        available_commands.append(('move', {'distance': 1}))
        cmd_num += 1
        
        print(f"{cmd_num}. Turn Left")
        available_commands.append(('turn_left', {'degrees': 90}))
        cmd_num += 1
        
        print(f"{cmd_num}. Turn Right")
        available_commands.append(('turn_right', {'degrees': 90}))
        cmd_num += 1
        
        print(f"{cmd_num}. Pick Object (Key/Coin)")
        available_commands.append(('pick_object', {'object_name': 'key'}))
        cmd_num += 1
        
        print(f"{cmd_num}. Print Message")
        available_commands.append(('print', {'message': 'Hello'}))
        cmd_num += 1
        
        # Level 3+ commands
        if level >= 3:
            print(f"{cmd_num}. If/Else Statement (Pick key → unlock door)")
            available_commands.append(('conditional', None))
            cmd_num += 1
        
        # Level 4+ commands
        if level >= 4:
            print(f"{cmd_num}. Loop (Repeat commands)")
            available_commands.append(('loop', None))
            cmd_num += 1
        
        print("-" * 70)
        print("V. View All Generated Code")
        print("C. Clear All Commands")
        print("B. Back to Level Selection")
        print("0. Exit")
        print("-" * 70)
        
        print("\n💡 TIP: Enter command numbers (can add multiple separated by spaces)")
        
        choice = input("\n👉 Your choice: ").strip().upper()
        
        if not choice:
            continue
        
        # Handle special options
        if choice == '0':
            print("\n👋 Goodbye!")
            return
        
        if choice == 'V':
            print("\n" + "=" * 70)
            print("💻 YOUR GENERATED CODE:")
            print("=" * 70)
            if session.code_cache.strip():
                print(session.code_cache)
            else:
                print("# No commands added yet")
            print("=" * 70)
            input("\nPress Enter to continue...")
            continue
            
        if choice == 'C':
            session.workflow.clear()
            session.update_code_display()
            print("\n✅ All commands cleared!")
            input("\nPress Enter to continue...")
            continue
        
        if choice == 'B':
            print("\n🔙 Going back to level selection...")
            return simple_command_interface(None)
        
        # Process command selections
        selections = choice.split()
        commands_added = 0
        
        for sel in selections:
            try:
                idx = int(sel) - 1
                if 0 <= idx < len(available_commands):
                    cmd_id, default_params = available_commands[idx]
                    
                    # Special handling for conditional (Level 3)
                    if cmd_id == 'conditional':
                        print("\n🔹 Adding If/Else Statement (Key & Door Logic)")
                        print("   If you pick the key → unlock door and complete level")
                        print("   Else → level not completed, try again")
                        
                        # Build the Level 3 specific if/else
                        if_body = [
                            {'type': 'print', 'params': {'message': 'Key collected! Unlocking door...'}},
                            {'type': 'print', 'params': {'message': 'Door unlocked! Level complete!'}}
                        ]
                        else_body = [
                            {'type': 'print', 'params': {'message': 'No key found. Cannot unlock door.'}},
                            {'type': 'print', 'params': {'message': 'Try again to collect the key!'}}
                        ]
                        
                        session.add_command_from_palette('conditional', {
                            'condition': 'has_key == True',
                            'if_body': if_body,
                            'else_body': else_body
                        })
                        commands_added += 1
                    
                    # Special handling for loop (Level 4)
                    elif cmd_id == 'loop':
                        print("\n🔹 Building a Loop...")
                        iterations = input("  How many times to repeat? (default 3): ").strip()
                        if not iterations:
                            iterations = 3
                        else:
                            iterations = int(iterations)
                        
                        print("\n  Add commands to loop body:")
                        print("  1. Move Forward")
                        print("  2. Turn Right")
                        print("  3. Pick Object")
                        body_choice = input("  Enter command numbers for loop body: ").strip().split()
                        
                        loop_body = []
                        for bc in body_choice:
                            if bc == '1':
                                loop_body.append({'type': 'move_forward', 'params': {'distance': 1}})
                            elif bc == '2':
                                loop_body.append({'type': 'turn_right', 'params': {'degrees': 90}})
                            elif bc == '3':
                                loop_body.append({'type': 'pick_object', 'params': {'object_name': 'coin'}})
                        
                        session.add_command_from_palette('loop', {
                            'iterations': iterations,
                            'body': loop_body if loop_body else []
                        })
                        commands_added += 1
                    
                    # Regular commands
                    else:
                        # Allow customization
                        if cmd_id == 'print':
                            msg = input("  Message to print (default 'Hello'): ").strip()
                            if msg:
                                default_params = {'message': msg}
                        elif cmd_id == 'pick_object':
                            obj = input("  Object name (default 'key'): ").strip()
                            if obj:
                                default_params = {'object_name': obj}
                        
                        session.add_command_from_palette(cmd_id, default_params)
                        commands_added += 1
                        print(f"  ✅ Added!")
                        
                else:
                    print(f"❌ Invalid number: {sel}")
            except ValueError:
                print(f"❌ Invalid input: {sel}")
        
        if commands_added > 0:
            print(f"\n✅ Added {commands_added} command(s) to your program")
            print("💡 Type 'V' to view your generated code anytime!")
            input("\nPress Enter to continue...")


def main():
    """Main entry point."""
    # Check for command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == '--help' or sys.argv[1] == '-h':
            print("Syntax Saga Code Generator")
            print("\nUsage:")
            print("  python3 main.py           - Start the game (select level, build program)")
            print("  python3 main.py --help    - Show this help")
            print("\nLevels:")
            print("  Level 1: Basic movements + Print statements")
            print("  Level 3: If/Else logic (Key & Door puzzle)")
            print("  Level 4: Loops (repeat commands)")
            return
    
    # Always start with level selection
    simple_command_interface()


if __name__ == "__main__":
    main()

