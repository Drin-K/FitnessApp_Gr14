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

 
  React.useEffect(() => {
    if (loading) return; 
    if (user) {
      router.replace("/");
    } else {
       router.replace("/login");
    }
  }, [loading, user]);

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
