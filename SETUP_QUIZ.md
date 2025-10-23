# 🌊 Quiz Setup Guide - Syntax Saga

## 🔑 Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key

## 📝 Step 2: Create .env.local File

1. In the **root directory** of your project, create a file named `.env.local`
2. Add the following content:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_actual_api_key_here
```

3. Replace `your_actual_api_key_here` with the API key you copied from Google AI Studio

## ⚠️ Important Notes

- The `.env.local` file should **NOT** be committed to Git (it's already in .gitignore)
- Never share your API key publicly
- Restart your development server after creating the `.env.local` file

## 🚀 Step 3: Restart Development Server

After creating the `.env.local` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart it:
npm run dev
```

## ✅ Test the Quiz

1. Go to **http://localhost:3001/game/level1**
2. Complete the level (use 3 forward moves)
3. Click **"Take Quiz"** button
4. The quiz should load with AI-generated questions!

## 🎯 Quiz Features

- **AI-Generated Questions**: Each time you take the quiz, Gemini generates fresh questions
- **3 MCQs**: Focused on Level 1 coding concepts
- **Interactive**: Click answers, get instant feedback
- **Ocean Theme**: Beautiful sea-themed design
- **Score Tracking**: See your score and percentage
- **Pass Requirement**: 60% to unlock next level

## 🐚 Troubleshooting

If the quiz doesn't load:
1. Check that `.env.local` exists in the root directory
2. Verify your API key is correct
3. Make sure you restarted the dev server
4. Check the browser console for errors
5. Verify the API key has no extra spaces

---

Happy coding! 🌊🐚

