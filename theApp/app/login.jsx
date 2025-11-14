import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import List from "../components/List";
import { useTheme } from "../context/ThemeContext";
import { loginUser } from "../services/authService";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const LoginScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const router = useRouter();

  // VALIDATION
  const validate = () => {
    let valid = true;
    let newErrors = { email: "", password: "", general: "" };

    if (!email.trim()) {
      newErrors.email = "Please enter your email.";
      valid = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      newErrors.email = "Invalid email format.";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Please enter your password.";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // EMAIL/PASSWORD LOGIN
  const handleLogin = async () => {
    if (!validate()) return;

    const result = await loginUser(email.trim(), password);

    if (result.success) {
      router.push("/");
    } else {
      const err = result.message;

      if (err.includes("wrong-password")) {
        setErrors((prev) => ({ ...prev, password: "Incorrect password." }));
      } else if (err.includes("user-not-found")) {
        setErrors((prev) => ({ ...prev, email: "This user does not exist." }));
      } else if (err.includes("too-many-requests")) {
        setErrors((prev) => ({
          ...prev,
          password: "Too many attempts. Try again later.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "An error occurred. Please try again.",
        }));
      }
    }
  };

  // GOOGLE LOGIN (WEB ONLY)
  const handleGoogleLogin = async () => {
    setErrors({ email: "", password: "", general: "" });

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace("/");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: "Google login failed.",
      }));
    }
  };

  // GRADIENT
  const gradientColors = isDarkMode
    ? [colors.background, "#001a10", colors.background]
    : ["#ffffff", "#f0fff8", "#ffffff"];

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
        },
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={{ flex: 1 }}>
        <LinearGradient colors={gradientColors} style={styles.bg}>
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: 120 }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.title, { color: colors.primary }]}>
              Welcome Back
            </Text>

            {/* Email */}
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.email ? "red" : colors.border,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.primary}
                style={styles.icon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email address"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
              />
            </View>
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            {/* Password */}
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.password ? "red" : colors.border,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.primary}
                style={styles.icon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
              />
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            {errors.general ? (
              <Text style={styles.errorText}>{errors.general}</Text>
            ) : null}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.card, borderColor: colors.primary },
              ]}
              onPress={handleLogin}
            >
              <Text style={[styles.buttonText, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>

            {/* Google Login */}
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: "#DB4437",
                  borderColor: "#DB4437",
                  marginTop: 10,
                },
              ]}
              onPress={handleGoogleLogin}
            >
              <Text style={[styles.buttonText, { color: "#fff" }]}>
                Sign in with Google
              </Text>
            </TouchableOpacity>

            {/* Signup */}
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={[styles.forgot, { color: colors.text }]}>
                Don’t have an account?{" "}
                <Text style={{ color: colors.primary }}>Sign up</Text>
              </Text>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
          </ScrollView>
        </LinearGradient>

        <View style={styles.footer}>
          <List onNavigate={(p) => router.push(p)} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1 },
  scroll: { padding: 20, flexGrow: 1 },

  title: {
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 90,
    marginBottom: 70,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    marginTop: 10,
  },

  icon: { marginRight: 10 },

  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
  },

  errorText: {
    color: "red",
    marginBottom: 6,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "500",
  },

  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 18,
  },

  buttonText: {
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 1,
  },

  forgot: {
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 14,
  },

  footer: {
    flexShrink: 0,
    backgroundColor: "transparent",
  },
});
