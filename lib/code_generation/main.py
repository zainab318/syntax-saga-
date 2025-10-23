#!/usr/bin/env python3
"""
Interactive Code Generator - Terminal Interface
User can input workflow commands and get generated Python code.
"""

from code_generator import GameplaySession, CodeDisplayMode, CommandPalette
import sys


class InteractiveTerminal:
    """Interactive terminal interface for code generation."""
    
    def __init__(self):
        self.session = GameplaySession()
        self.palette = CommandPalette()
        self.running = True
        
    def clear_screen(self):
        """Clear the terminal screen."""
        print("\n" * 2)
        
    def print_header(self):
        """Print the application header."""
        print("=" * 70)
        print("🎮 INTERACTIVE CODE GENERATOR")
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
            print(f"Default parameters: {cmd_info['default_params']}")
            
            # Ask if user wants to customize parameters
            customize = input("\nCustomize parameters? (y/n): ").strip().lower()
            
            custom_params = None
            if customize == 'y':
                custom_params = self.get_custom_parameters(cmd_info)
            
            # Add command
            result = self.session.add_command_from_palette(cmd_id, custom_params)
            
            if result.get('success'):
                print(f"\n✅ Added: {result['command_label']}")
                print(f"Position: {result['index'] + 1}")
            else:
                print(f"\n❌ Error: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"\n❌ Error: {e}")
            
    def get_custom_parameters(self, cmd_info):
        """Get custom parameters from user."""
        params = {}
        default_params = cmd_info['default_params']
        
        print("\nEnter custom parameters (press Enter to use default):")
        
        for param_name, default_value in default_params.items():
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


def simple_command_interface():
    """Simple interface for selecting and generating commands."""
    session = GameplaySession()
    
    print("=" * 70)
    print("🎮 CODE GENERATOR - Command Selection")
    print("=" * 70)
    
    while True:
        print("\n📋 AVAILABLE COMMANDS:")
        print("-" * 70)
        print("1. Move Forward")
        print("2. Turn Left")
        print("3. Turn Right")
        print("4. Claim a Coin")
        print("-" * 70)
        print("5. View All Generated Code")
        print("6. Clear All Commands")
        print("0. Exit")
        print("-" * 70)
        
        print("\n💡 TIP: You can select multiple commands!")
        print("   Examples:")
        print("   • Enter '1' for one Move Forward")
        print("   • Enter '1 1 1' for three Move Forward commands")
        print("   • Enter '1 2 3 4' for all four different commands")
        print("   • Enter '1 1 2 1 4' for multiple mixed commands")
        
        choice = input("\n👉 Enter command(s) separated by spaces: ").strip()
        
        if not choice:
            continue
        
        # Split the input by spaces to get multiple selections
        selections = choice.split()
        
        # Check if user wants to exit or use special options
        if '0' in selections:
            print("\n👋 Goodbye!")
            break
        
        if '5' in selections:
            print("\n" + "=" * 70)
            print("💻 ALL GENERATED CODE:")
            print("=" * 70)
            print(session.code_cache)
            print("=" * 70)
            input("\nPress Enter to continue...")
            continue
            
        if '6' in selections:
            session.workflow.clear()
            session.update_code_display()
            print("\n✅ All commands cleared!")
            input("\nPress Enter to continue...")
            continue
        
        # Process each selection
        commands_added = 0
        for sel in selections:
            if sel == '1':
                print("\n🔹 Adding: Move Forward")
                session.add_command_from_palette('move', {'distance': 1})
                commands_added += 1
                
            elif sel == '2':
                print("\n🔹 Adding: Turn Left")
                session.add_command_from_palette('turn_left', {'degrees': 90})
                commands_added += 1
                
            elif sel == '3':
                print("\n🔹 Adding: Turn Right")
                session.add_command_from_palette('turn_right', {'degrees': 90})
                commands_added += 1
                
            elif sel == '4':
                print("\n🔹 Adding: Claim a Coin")
                session.add_command_from_palette('pick_object', {'object_name': 'coin'})
                commands_added += 1
                
            else:
                print(f"\n❌ Invalid selection: '{sel}' - skipping")
        
        if commands_added > 0:
            print(f"\n✅ Total commands added: {commands_added}")
            input("\nPress Enter to continue...")


def main():
    """Main entry point."""
    # Check for command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == '--simple' or sys.argv[1] == '-s':
            simple_command_interface()
        elif sys.argv[1] == '--quick' or sys.argv[1] == '-q':
            terminal = InteractiveTerminal()
            terminal.quick_add_mode()
            terminal.display_workflow()
            print("\n")
            terminal.generate_and_display_code(mode='template')
        elif sys.argv[1] == '--help' or sys.argv[1] == '-h':
            print("Interactive Code Generator")
            print("\nUsage:")
            print("  python3 main.py              - Run simple command selection mode")
            print("  python3 main.py --simple     - Run simple command selection mode")
            print("  python3 main.py --quick      - Quick add mode")
            print("  python3 main.py --help       - Show this help")
    else:
        # Default to simple interface
        simple_command_interface()


if __name__ == "__main__":
    main()

