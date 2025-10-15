// LoginScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import List from "../components/list";
import { useTheme } from "../context/ThemeContext";

const LoginScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    console.log("Login with:", email, password);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <LinearGradient colors={["#000", "#001a10", "#000"]} style={styles.bg}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title ,{ color: colors.primary }]}>Welcome Back</Text>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#bfffd6" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#777"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#bfffd6" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#777"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Text style={styles.termsText}>
              By logging in, you agree to IllyrianGym{" "}
              <Text style={styles.link}>Privacy Policy</Text> and{" "}
              <Text style={styles.link}>Terms and Conditions</Text>
            </Text>

            {/* Button */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity>
              <Text style={styles.forgot}>FORGOT YOUR PASSWORD?</Text>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
          </ScrollView>
        </LinearGradient>

        {/* Fixed footer navigation */}
        <View style={styles.footer}>
          <List onNavigate={(p) => router.push(p)} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  bg: { flex: 1 },
  scroll: { padding: 20, flexGrow: 1, paddingBottom: 120 },
  title: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 90,
    marginBottom: 70,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#003321",
    marginTop:10
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: "#fff",
    height: 48,
    fontSize: 15,
  },
  termsText: {
    color: "#bfffd6",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 18,
  },
  link: {
    color: "#00ff88",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#003321",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00ff88",
    marginBottom: 18,
  },
  buttonText: {
    color: "#bfffd6",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 1,
  },
  forgot: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footer: {
    flexShrink: 0,
    backgroundColor: "transparent",
  },
});
