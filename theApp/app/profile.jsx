import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import List from "../components/List";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { logoutUser } from "../services/authService"; // ✅ we’ll use the service logout
import { onSnapshot } from "firebase/firestore";

const ProfileScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", firebaseUser.uid);

    const unsubscribeFirestore = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          setUser({
            uid: firebaseUser.uid,
            fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "User",
            email: data.email || firebaseUser.email,
            photo: data.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            height: data.height || "",
            weight: data.weight || "",
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            fullName: firebaseUser.displayName || "User",
            email: firebaseUser.email,
            photo: firebaseUser.photoURL || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            height: "",
            weight: "",
          });
        }

        setLoading(false);
      },
      (error) => {
        console.error("🔥 Firestore real-time error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribeFirestore();
  });

  return () => unsubscribeAuth();
}, []);


  // 🔒 Logout
  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      setUser(null);
      router.replace("/login");
    } else {
      showAlert("Logout Error", result.message);
    }
  };

  // Gradient setup
  const gradientColors = isDarkMode
    ? [colors.background, "#001a10", colors.background]
    : ["#ffffff", "#f0fff8", "#ffffff"];

  // Loading spinner
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <LinearGradient colors={gradientColors} style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Profile</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 👇 Conditional rendering based on Auth state */}
          {!user ? (
            <>
              <Text style={[styles.infoText, { color: colors.text }]}>
                You need to log in or sign up to see your profile.
              </Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.authButton, styles.loginButton]}
                  onPress={() => router.push("/login")}
                >
                  <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.authButton, styles.signupButton]}
                  onPress={() => router.push("/signup")}
                >
                  <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* ✅ Logged-in profile view */}
              <View style={styles.profileCard}>
                <Image
                  source={{ uri: user.photo }}
                  style={styles.avatar}
                />
                <Text style={[styles.name, { color: colors.text }]}>
                  {user.fullName}
                </Text>
                <Text style={[styles.email, { color: colors.textSecondary }]}>
                  {user.email}
                </Text>
              </View>

              <View style={styles.options}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => router.push("/changePassword")}
                >
                  <Text style={styles.optionText}>Change Password</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => router.push("/editProfile")}
                >
                  <Text style={styles.optionText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: "#ff4d4d" }]}
                  onPress={handleLogout}
                >
                  <Text style={styles.optionText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          <List onNavigate={(p) => router.push(p)} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 120,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  headerTitle: { fontSize: 40, fontWeight: "800" },
  content: { paddingHorizontal: 20, paddingTop: 110, paddingBottom: 120 },
  infoText: {
    fontSize: 27,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonGroup: { alignItems: "center" },
  authButton: {
    width: "80%",
    paddingVertical: 16,
    borderRadius: 999,
    marginBottom: 18,
    alignItems: "center",
  },
  loginButton: { backgroundColor: "#4CAF50" },
  signupButton: { backgroundColor: "#4285F4" },
  buttonText: { fontSize: 20, fontWeight: "700", color: "white" },
  profileCard: { alignItems: "center", marginBottom: 40 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: { fontSize: 28, fontWeight: "700" },
  email: { fontSize: 18, opacity: 0.7 },
  options: { gap: 16 },
  optionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  optionText: { color: "white", fontSize: 20, fontWeight: "700" },
  footer: { flexShrink: 0, backgroundColor: "transparent" },
});

export default ProfileScreen;
