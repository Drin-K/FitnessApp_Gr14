import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";


const LayoutContent = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
          setLoading(false);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ User aktiv:", user.email);
        router.replace("/"); // nëse user ekziston → dërgo në home
      } else {
        console.log("🚪 Asnjë user i kyçur");
        router.replace("/login"); // nëse jo → dërgo në login
      }
    });

    return unsubscribe; // pastron listener-in kur komponenti mbyllet
  }, []);

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
      {/* Stack që renderon të gjitha faqet */}
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: "fade",
          animationDuration: 200,
        }}
      />

      {/* Butoni i ndërrimit të temës, i dukshëm në çdo ekran */}
      <ThemeToggle style={toggleStyle} />
    </View>
  );
};

// ✅ Layout kryesor që mbështjell aplikacionin me ThemeProvider
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
