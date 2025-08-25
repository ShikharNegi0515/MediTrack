import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export async function signup(email, password) {
    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User signed up:", userCred.user);
        return userCred.user;
    } catch (error) {
        console.error("Signup error:", error.message);
        throw error;
    }
}

export async function login(email, password) {
    try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCred.user);
        return userCred.user;
    } catch (error) {
        console.error("Login error:", error.message);
        throw error;
    }
}

export async function logout() {
    await signOut(auth);
}
