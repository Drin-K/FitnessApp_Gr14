// ProfileScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import List from "../components/list";

const ProfileScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();

  const gradientColors = isDarkMode
    ? [colors.background, "#001a10", colors.background]
    : ["#ffffff", "#f0fff8", "#ffffff"];

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
          <Text style={[styles.infoText, { color: colors.text }]}>
            You need to log in or sign up to see your profile.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.authButton, styles.loginButton]}
              onPress={() => router.push("login")}
            >
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authButton, styles.signupButton]}
              onPress={() => router.push("signup")}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Fixed footer navigation */}
        <View style={styles.footer}>
          <List onNavigate={(p) => router.push(p)} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 120,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "800",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 110,
    paddingBottom: 120,
  },
  infoText: {
    fontSize: 27,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonGroup: {
    alignItems: "center",
  },
  authButton: {
    width: "80%",
    paddingVertical: 16,
    borderRadius: 999,
    marginBottom: 18,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#4CAF50",
  },
  signupButton: {
    backgroundColor: "#4285F4",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  footer: {
    flexShrink: 0,
    backgroundColor: "transparent",
  },
});

export default ProfileScreen;
