// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧩 Dëgjon ndryshimet në statusin e autentikimit
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚪 Logout funksioni
  const logout = async () => {
    try {
      await signOut(auth);
      console.log("🚪 User u çkyç me sukses");
    } catch (error) {
      console.error("❌ Gabim gjatë logout:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
