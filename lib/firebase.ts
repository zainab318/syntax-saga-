// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"

// ✅ Use environment variables for security and flexibility
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAXJzygwgPAwbSND5iI4vC7jZbn0ZPp_bg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "syntaxsaga-7a308.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "syntaxsaga-7a308",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "syntaxsaga-7a308.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "990882446237",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:990882446237:web:428835bb9323b8763f0d74",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KEXVZQ4SVR",
}

// ✅ Prevent re-initialization during hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// ✅ Export auth instance (used for login/register/logout)
export const auth = getAuth(app)

// ✅ (Optional) analytics only on the client
export const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    const { getAnalytics, isSupported } = await import("firebase/analytics")
    if (await isSupported()) {
      return getAnalytics(app)
    }
  }
  return null
}

export default app
