import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const fallbackQuestions = [
  {
    question: "Which command prints that the seahorse moved forward one step?",
    options: [
      "print(\"move forward\")",
      "print(f\"{'move forward'}\")",
      "print('forward:1')",
      "move_forward()"
    ],
    correctAnswer: 1,
    explanation: "Level 1 uses formatted string syntax: print(f\"{'move forward'}\")."
  },
  {
    question: "How many forward moves complete Level 1 objective?",
    options: ["1", "2", "3", "4"],
    correctAnswer: 2,
    explanation: "Exactly 3 forward steps complete Level 1."
  },
  {
    question: "What message appears if you try more than 3 forward moves?",
    options: [
      "🌊 Oops! Seahorse cannot go into the water!",
      "✅ Level completed!",
      "Waiting...",
      "Turn right"
    ],
    correctAnswer: 0,
    explanation: "Level 1 blocks extra forward steps with this warning."
  }
];

export async function POST(request: Request) {
  try {
    const { level, player_code } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not set. Serving fallback quiz.");
      return NextResponse.json({ questions: fallbackQuestions });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const playerCodeSnippet = (player_code ?? "").toString().slice(0, 4000);

    const prompt = `You are an AI helper for a kid-friendly coding game with a sea theme.\n\nThe player just completed Level 1 using these Python commands (example output lines):\n${playerCodeSnippet}\n\nRules for generating questions:\n- Create EXACTLY 3 multiple-choice questions.\n- Keep them short, clear, and ocean-themed.\n- ONLY ask about actions that actually appear in the player's code (do not invent left turns if they aren't used).\n- Level 1 goal: exactly 3 forward moves complete the level; more than 3 shows a warning.\n- Each question must have 4 options.\n- Output JSON ONLY in this schema (no extra text):\n[\n  {\n    "question": "text",\n    "options": ["A","B","C","D"],\n    "correctAnswer": 0,\n    "explanation": "why"\n  }\n]\nThe field correctAnswer is the index (0-3) of the correct option.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let questions: unknown = [];
    try {
      questions = JSON.parse(text);
    } catch (_) {
      // ignore parse error, will fall back
    }

    if (!Array.isArray(questions) || questions.length !== 3) {
      return NextResponse.json({ questions: fallbackQuestions });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating quiz:", error);
    // Always return a valid quiz to avoid client crashes
    return NextResponse.json({ questions: fallbackQuestions });
  }
}

