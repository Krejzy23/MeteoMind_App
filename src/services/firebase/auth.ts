import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User,
  } from "firebase/auth";
  import { auth } from "./config";
  
  export function subscribeToAuthState(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
  
  export async function registerWithEmail(email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  }
  
  export async function loginWithEmail(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }
  
  export async function logout() {
    await signOut(auth);
  }