// src/services/authService.js
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// 🧩 Regjistrimi i përdoruesit
export const signUpUser = async (firstName, lastName, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Ruaj të dhënat shtesë në Firestore
    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      email,
      createdAt: serverTimestamp(),
    });

    return { success: true, user };
  } catch (error) {
    console.error("❌ Error registering user:", error.message);
    return { success: false, message: error.message };
  }
};

// 🔑 Hyrja e përdoruesit
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return { success: false, message: error.message };
  }
};

// 🚪 Dalja (logout)
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// 👀 Kontrolli i përdoruesit aktiv
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
