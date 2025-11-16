// src/services/authService.js
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// 🧩 User Registration
export const signUpUser = async (firstName, lastName, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save extra profile fields in Firestore
    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      email,
      createdAt: serverTimestamp(),
    });

    return { success: true, user };
  } catch (error) {
    console.error("❌ Registration error:", error.message);

    let userMessage = "Something went wrong. Please try again.";

    switch (error.code) {
      case "auth/email-already-in-use":
        userMessage = "This email is already in use.";
        break;
      case "auth/invalid-email":
        userMessage = "Please enter a valid email.";
        break;
      case "auth/weak-password":
        userMessage = "Password is too weak.";
        break;
      case "auth/network-request-failed":
        userMessage = "Network error. Check your connection.";
        break;
      default:
        userMessage = "Something went wrong. Please try again.";
    }

    return { success: false, message: userMessage, code: error.code };
  }
};

// 🔑 User Login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("❌ Login error:", error.message);

    let userMessage = "Invalid email or password.";

    switch (error.code) {
      case "auth/user-not-found":
        userMessage = "No account found with this email.";
        break;
      case "auth/wrong-password":
        userMessage = "Incorrect password.";
        break;
      case "auth/invalid-email":
        userMessage = "Please enter a valid email.";
        break;
      case "auth/too-many-requests":
        userMessage = "Too many attempts. Try again later.";
        break;
    }

    return { success: false, message: userMessage };
  }
};

// 🚪 Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// 👀 Auth state listener
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
