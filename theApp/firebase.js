// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {getFunctions} from "firebase/functions"
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWi2ptw59KaW1vF7-oSX8pYX0M50WwGY4",
  authDomain: "fitnessdb-7e7a8.firebaseapp.com",
  projectId: "fitnessdb-7e7a8",
  storageBucket: "fitnessdb-7e7a8.firebasestorage.app",
  messagingSenderId: "765344318453",
  appId: "1:765344318453:web:1058134ad5d60266d316bc",
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
console.log("🔥 Firebase initialized:", auth ? "OK" : "FAILED");
