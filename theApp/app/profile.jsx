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
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import List from "../components/List";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { logoutUser } from "../services/authService";
import { onSnapshot } from "firebase/firestore";

const { width } = Dimensions.get("window");

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
          console.error("Firestore real-time error:", error);
          setLoading(false);
        }
      );

      return () => unsubscribeFirestore();
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      setUser(null);
      router.replace("/login");
    } else {
      Alert.alert("Logout Error", result.message);
    }
  };

  const gradientColors = isDarkMode
    ? [colors.background, "#1a1a1a", colors.background]
    : ["#ffffff", "#f8f9fa", "#ffffff"];

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {!user ? (
            <View style={styles.guestContainer}>
              <Text style={[styles.infoText, { color: colors.text }]}>
                You need to log in or sign up to see your profile.
              </Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.authButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push("/login")}
                >
                  <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.authButton, { backgroundColor: "#6c757d" }]}
                  onPress={() => router.push("/signup")}
                >
                  <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
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

                <View style={styles.statsContainer}>
                  <View style={[styles.statItem, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {user.height ? `${user.height} cm` : "Not set"}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Height
                    </Text>
                  </View>

                  <View style={[styles.statItem, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {user.weight ? `${user.weight} kg` : "Not set"}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Weight
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.options}>
                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.primary }]}
                  onPress={() => router.push("/editProfile")}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>Edit Profile</Text>
                  <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                    Update your personal information
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.primary }]}
                  onPress={() => router.push("/changePassword")}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>Change Password</Text>
                  <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                    Update your security settings
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: "#dc3545" }]}
                  onPress={handleLogout}
                >
                  <Text style={[styles.optionText, { color: "#dc3545" }]}>Logout</Text>
                  <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                    Sign out of your account
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Profile Information
                </Text>
                <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
                  {user.height && user.weight 
                    ? "Your profile is complete. You can track your BMI progress with accurate data."
                    : "Add your height and weight for personalized BMI tracking and better insights."
                  }
                </Text>
              </View>
            </>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.footer}>
          <List onNavigate={(p) => router.push(p)} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: {
    height: 120,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: "700",
  },
  content: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 100 
  },
  guestContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  infoText: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 28,
  },
  buttonGroup: { 
    alignItems: "center",
    width: "100%",
  },
  authButton: {
    width: "100%",
    maxWidth: 300,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "white" 
  },
  profileCard: { 
    alignItems: "center", 
    marginBottom: 24,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#dee2e6",
  },
  name: { 
    fontSize: 22, 
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center"
  },
  email: { 
    fontSize: 15, 
    marginBottom: 20,
    textAlign: "center"
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  options: { 
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  optionText: { 
    fontSize: 16, 
    fontWeight: "600",
    marginBottom: 4,
  },
  optionSubtext: {
    fontSize: 13,
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: { 
    flexShrink: 0, 
    backgroundColor: "transparent" 
  },
});

export default ProfileScreen;