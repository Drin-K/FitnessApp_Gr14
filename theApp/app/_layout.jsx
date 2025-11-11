import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

const LayoutContent = () => {
  const { colors } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  // 🔁 Kontrollo statusin e përdoruesit për routing
  React.useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/"); // nëse është i kyçur → Home
      } else {
        router.replace("/login"); // nëse s’është → Login
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
  container: { flex: 1 },
});
