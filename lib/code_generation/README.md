# Code Generator for Syntax Saga Game

Generates Python code from visual programming blocks with loop support and level-based command filtering.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd /home/khadijab/Downloads/syntax-saga-/lib/code_generation
pip install -r requirements.txt
```

### 2. Start API Server (for Next.js integration)
```bash
python3 api_server.py
```

### 3. Test It
```bash
curl http://localhost:5000/test-loop
```

## 📦 Files

- **`code_generator.py`** - Core code generation engine with level-based filtering
- **`main.py`** - Interactive terminal interface for testing
- **`api_server.py`** - Flask API server for Next.js integration
- **`requirements.txt`** - Python dependencies

## 🎯 How It Works

```
Frontend (Drag & Drop) → Send Blocks JSON → API Server → Generate Code → Display
```

### Example: User creates a loop with commands

**Frontend sends:**
```json
{
  "blocks": [
    {
      "type": "loop",
      "params": {
        "iterations": 4,
        "body": [
          { "type": "move_forward", "params": { "distance": 1 } },
          { "type": "turn_right", "params": { "degrees": 90 } }
        ]
      }
    }
  ],
  "level": 4
}
```

**API returns:**
```python
# Loop 4 times
for i in range(4):
    print(f"{'move forward'}")
    print(f"{'turn right'}")
```

## 🎮 Next.js Integration

```typescript
// Send blocks to API
const response = await fetch('http://localhost:5000/generate-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ blocks, level: 4 })
});

const { code } = await response.json();
// Display 'code' in your code editor panel
```

## 📊 Level-Based Commands

- **Level 1**: Basic movements + Print statements
- **Level 3**: Level 1 + If/Else conditionals
- **Level 4**: Level 3 + Loops

## 📞 API Endpoints

```
POST   /generate-code       - Generate code from blocks
GET    /available-commands  - Get commands for a level
GET    /health             - Health check
GET    /test-loop          - Test endpoint
```

## 🔧 Command Types

All commands use this structure:
```json
{
  "type": "command_type",
  "params": { "param_name": value }
}
```

### Available Commands:
- `move_forward` - params: `distance`
- `move_backward` - params: `distance`
- `turn_left` - params: `degrees`
- `turn_right` - params: `degrees`
- `jump` - params: `height`
- `pick_object` - params: `object_name`
- `print` - params: `message`
- `wait` - params: `seconds`
- `loop` - params: `iterations`, `body` (array of commands)
- `conditional` - params: `condition`, `if_body`, `else_body`

## ✅ Features

✅ Loop code generation with proper indentation  
✅ Level-based command filtering  
✅ Simple REST API  
✅ Works with drag-and-drop frontend  
✅ Generates clean Python code  

## 🎓 Usage

### For Game Development:
1. Start `api_server.py`
2. Send block data from your Next.js frontend
3. Receive and display generated Python code

### For Testing:
```bash
# Interactive terminal mode
python3 main.py --level 4

# Demo mode
python3 code_generator.py --levels
```

## 🚀 Status

**Ready for production** - All features implemented and tested.
