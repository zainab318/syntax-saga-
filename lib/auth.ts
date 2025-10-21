// src/lib/auth.ts
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    UserCredential
  } from "firebase/auth";
  import { auth } from "@/lib/firebase"

  
  // Sign In
  export async function login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  // Sign Up
  export async function register(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  // Sign Out
  export async function logout(): Promise<void> {
    await signOut(auth);
  }
  