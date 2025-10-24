import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import { NextResponse } from "next/server";

type Q = { question: string; options: string[]; correctAnswer: number; explanation: string };

function countKeywordWithLoops(playerCode: string, keyword: string): number {
  const lines = (playerCode || "").split(/\r?\n/);
  let total = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // for _ in range(N): directly above the print
    const m = line.match(/^for\s+[^\s]+\s+in\s+range\((\d+)\):/);
    if (m) {
      const n = parseInt(m[1], 10) || 0;
      const next = lines[i + 1] ? lines[i + 1].trim() : "";
      if (next.includes(`print("${keyword}")`) || next.includes(`print(\"${keyword}\")`)) {
        total += n;
        i++; // skip the next line which we already accounted for
        continue;
      }
    }
    if (line.includes(`print("${keyword}")`) || line.includes(`print(\"${keyword}\")`)) {
      total += 1;
    }
  }
  return total;
}

function buildRuleBasedQuestions(playerCode: string, level: number): Q[] {
  const forwardCount = countKeywordWithLoops(playerCode, "move forward");
  const rightCount = countKeywordWithLoops(playerCode, "turn right");

  const q1: Q = {
    question: "Which print indicates moving forward in our game logs?",
    options: [
      "print(\"move forward\")",
      "print(f\"{'move forward'}\")",
      "print(\"swim forward\")",
      "move_forward()"
    ],
    correctAnswer: 0,
    explanation: "We use simple prints for kids: print(\"move forward\")."
  };

  const q2: Q = {
    question: `How many forward moves are in your program?`,
    options: ["1", "2", "3", "5"],
    correctAnswer: (() => {
      const idx = ["1","2","3","5"].indexOf(String(forwardCount || 0));
      return idx >= 0 ? idx : 2; // default to 3 if out of range
    })(),
    explanation: `Counted from code (including loops): ${forwardCount}.`
  };

  const q3Level1: Q = {
    question: "What happens if you try more than 3 forward moves in Level 1?",
    options: [
      "Nothing special",
      "🌊 Oops! Seahorse cannot go into the water!",
      "It turns right automatically",
      "It collects a coin"
    ],
    correctAnswer: 1,
    explanation: "Level 1 shows a friendly warning to stop extra moves."
  };

  const q3Level2: Q = {
    question: "When is the coin collected in Level 2?",
    options: [
      "After the 1st forward",
      "After the 2nd forward",
      "After the 3rd forward",
      "After the 5th forward"
    ],
    correctAnswer: 2,
    explanation: "We collect the coin right after the third overall forward and print \"coin collected\"."
  };

  return [q1, level === 2 ? q3Level2 : q3Level1, q2];
}

async function generateWithOpenAI(playerCode: string, level: number): Promise<Q[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const levelContext = level === 2
    ? "Level 2: The seahorse moves forward 3 times, collects a coin after the 3rd move, then turns right 2 times. Uses variables like 'steps' and 'turns' with f-strings for summaries."
    : "Level 1: The seahorse moves forward exactly 3 times. No left turns allowed. Simple print statements only.";

  const prompt = `You are an AI helper for a kid-friendly coding game with a sea theme.

The player just completed Level ${level} using this Python code:
${playerCode}

Context: ${levelContext}

Generate EXACTLY 3 multiple-choice questions based on the player's actual code.
- Keep questions short, clear, and ocean-themed
- Ask about concepts the player actually used in their code
- Each question must have 4 options
- Make questions educational and fun for kids

Return JSON only:
[
  {
    "question": "What does this code do?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Educational explanation"
  }
]`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const text = completion.choices[0]?.message?.content || "";
  const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  
  try {
    return JSON.parse(cleanText);
  } catch {
    return [];
  }
}

async function generateWithGemini(playerCode: string, level: number): Promise<Q[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const levelContext = level === 2
    ? "Level 2: The seahorse moves forward 3 times, collects a coin after the 3rd move, then turns right 2 times. Uses variables like 'steps' and 'turns' with f-strings for summaries."
    : "Level 1: The seahorse moves forward exactly 3 times. No left turns allowed. Simple print statements only.";

  const prompt = `You are an AI helper for a kid-friendly coding game with a sea theme.

The player just completed Level ${level} using this Python code:
${playerCode}

Context: ${levelContext}

Generate EXACTLY 3 multiple-choice questions based on the player's actual code.
- Keep questions short, clear, and ocean-themed
- Ask about concepts the player actually used in their code
- Each question must have 4 options
- Make questions educational and fun for kids

Return JSON only:
[
  {
    "question": "What does this code do?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Educational explanation"
  }
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  
  try {
    return JSON.parse(cleanText);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const { level, player_code } = await request.json();
    const levelNum = level || 1;
    const playerCode = player_code || "";

    // For now, use rule-based questions to ensure quiz works
    console.log("Using rule-based quiz generation");
    return NextResponse.json({ questions: buildRuleBasedQuestions(playerCode, levelNum) });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json({ questions: buildRuleBasedQuestions("", 1) });
  }
}

