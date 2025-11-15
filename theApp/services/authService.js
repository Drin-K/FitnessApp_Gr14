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
    
    // Kthe mesazhe më të mira për përdoruesin
    let userMessage = "Ndodhi një gabim. Ju lutem provoni përsëri.";
    
    switch (error.code) {
      case "auth/email-already-in-use":
        userMessage = "Ky email është tashmë i regjistruar. Ju lutem përdorni një email tjetër ose hyni në llogarinë tuaj.";
        break;
      case "auth/invalid-email":
        userMessage = "Email-i nuk është i vlefshëm. Ju lutem shkruani një email valid.";
        break;
      case "auth/weak-password":
        userMessage = "Fjalëkalimi është shumë i dobët. Ju lutem zgjidhni një fjalëkalim më të fortë.";
        break;
      case "auth/network-request-failed":
        userMessage = "Problem me lidhjen e internetit. Ju lutem kontrolloni lidhjen tuaj.";
        break;
      default:
        userMessage = "Ndodhi një gabim. Ju lutem provoni përsëri.";
    }
    
    return { success: false, message: userMessage, code: error.code };
  }
};

// 🔑 Hyrja e përdoruesit
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("❌ Login error:", error.message);
    
    let userMessage = "Email ose fjalëkalim i gabuar.";
    
    switch (error.code) {
      case "auth/user-not-found":
        userMessage = "Nuk ekziston llogari me këtë email. Ju lutem regjistrohuni.";
        break;
      case "auth/wrong-password":
        userMessage = "Fjalëkalimi është i gabuar. Ju lutem provoni përsëri.";
        break;
      case "auth/invalid-email":
        userMessage = "Email-i nuk është i vlefshëm.";
        break;
      case "auth/too-many-requests":
        userMessage = "Shumë tentativa të dështuara. Ju lutem prisni pak dhe provoni përsëri.";
        break;
    }
    
    return { success: false, message: userMessage };
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