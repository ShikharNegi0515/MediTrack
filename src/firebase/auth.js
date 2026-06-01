import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase.js";

export async function signup(email, password) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function login(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function logout() {
  await signOut(auth);
}

export function friendlyAuthError(message) {
  if (message.includes("invalid-credential") || message.includes("wrong-password")) {
    return "Invalid email or password. Please try again.";
  }
  if (message.includes("email-already-in-use")) {
    return "An account with this email already exists.";
  }
  if (message.includes("weak-password")) {
    return "Password should be at least 6 characters.";
  }
  if (message.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  return message.replace("Firebase: ", "").replace(/\(auth\/[^)]+\)\.?/g, "").trim();
}
