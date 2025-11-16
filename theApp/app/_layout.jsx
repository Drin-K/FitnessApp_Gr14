// app/_layout.jsx
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { ActivityIndicator } from "react-native";

const LayoutContent = () => {
  const { colors } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Routing i rregulluar — pa loops, pa logout fake
  React.useEffect(() => {
    if (loading) return; // MOS REDIRECTO deri sa Firebase ta konfirmon gjendjen

    if (user) {
      // Nëse user është i kyçur → shko në Home
      router.replace("/");
    } else {
      // Nëse user nuk është i kyçur → shko në Login
      router.replace("/login");
    }
  }, [loading, user]);

  // Loading screen derisa Firebase Auth të përgjigjet
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    );
  }

  const toggleStyle = {
    position: "absolute",
    right: 14,
    top: Platform.OS === "ios" ? 48 : 20,
    zIndex: 50,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      <ThemeToggle style={toggleStyle} />
    </View>
  );
};

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LayoutContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
