import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

// LayoutContent uses the theme hook; ThemeProvider must wrap it
const LayoutContent = () => {
  const { colors, isDark } = useTheme();

  // Top-right toggle styling
  const toggleStyle = {
    position: "absolute",
    right: 14,
    top: Platform.OS === "ios" ? 48 : 20, // adjust for status bar
    zIndex: 50,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Stack will render routes (pages) */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* Theme toggle visible on every screen */}
      <ThemeToggle style={toggleStyle} />

      {/* Bottom navigation removed from here */}
    </View>
  );
};

export default function Layout() {
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});