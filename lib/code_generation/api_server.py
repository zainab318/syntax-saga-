#!/usr/bin/env python3
"""
Simple Flask API Server for Code Generation
This receives blocks from your Next.js frontend and returns generated code.

Usage:
    python3 api_server.py

Then from Next.js, call:
    POST http://localhost:5000/generate-code
    Body: { "blocks": [...], "level": 4 }
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from code_generator import CodeGenerator, GameplaySession
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

@app.route('/generate-code', methods=['POST'])
def generate_code():
    """
    Generate code from blocks.
    
    Expected input:
    {
        "blocks": [
            {
                "type": "loop",
                "params": {
                    "iterations": 4,
                    "body": [
                        {"type": "move_forward", "params": {"distance": 1}},
                        {"type": "turn_right", "params": {"degrees": 90}}
                    ]
                }
            }
        ],
        "level": 4  # optional, defaults to 1
    }
    
    Returns:
    {
        "success": true,
        "code": "# Generated code...",
        "execution_plan": [...]
    }
    """
    try:
        data = request.json
        blocks = data.get('blocks', [])
        level = data.get('level', 1)
        
        if not blocks:
            return jsonify({
                'success': False,
                'error': 'No blocks provided'
            }), 400
        
        # Generate code
        generator = CodeGenerator()
        code, execution_plan = generator.generate_from_blocks(
            blocks, 
            include_implementations=False
        )
        
        return jsonify({
            'success': True,
            'code': code,
            'execution_plan': execution_plan,
            'level': level
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/available-commands', methods=['GET'])
def get_available_commands():
    """
    Get available commands for a specific level.
    
    Query params:
        level: int (1-4)
    
    Returns:
    {
        "success": true,
        "level": 4,
        "commands": [...]
    }
    """
    try:
        level = int(request.args.get('level', 1))
        
        session = GameplaySession(current_level=level)
        commands = session.get_available_commands_for_level(level)
        
        return jsonify({
            'success': True,
            'level': level,
            'commands': commands
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'code-generator-api',
        'version': '1.0'
    })


@app.route('/test-loop', methods=['GET'])
def test_loop():
    """
    Test endpoint that generates a simple loop example.
    Useful for testing the API is working.
    """
    blocks = [
        {
            "type": "loop",
            "params": {
                "iterations": 4,
                "body": [
                    {"type": "move_forward", "params": {"distance": 1}},
                    {"type": "turn_right", "params": {"degrees": 90}}
                ]
            }
        }
    ]
    
    generator = CodeGenerator()
    code, execution_plan = generator.generate_from_blocks(blocks, include_implementations=False)
    
    return jsonify({
        'success': True,
        'example': 'Square path loop',
        'blocks': blocks,
        'code': code
    })


if __name__ == '__main__':
    print("=" * 70)
    print("🚀 Code Generator API Server Starting...")
    print("=" * 70)
    print("")
    print("📡 API Endpoints:")
    print("  POST   http://localhost:5000/generate-code")
    print("  GET    http://localhost:5000/available-commands?level=4")
    print("  GET    http://localhost:5000/health")
    print("  GET    http://localhost:5000/test-loop")
    print("")
    print("📝 Example Request:")
    print("""
    fetch('http://localhost:5000/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            blocks: [
                {
                    type: 'loop',
                    params: {
                        iterations: 4,
                        body: [
                            { type: 'move_forward', params: { distance: 1 } },
                            { type: 'turn_right', params: { degrees: 90 } }
                        ]
                    }
                }
            ],
            level: 4
        })
    })
    """)
    print("=" * 70)
    print("Press Ctrl+C to stop the server")
    print("=" * 70)
    
    app.run(host='0.0.0.0', port=5000, debug=True)

