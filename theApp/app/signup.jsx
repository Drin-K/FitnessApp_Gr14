import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import InputField from "../components/InputField";
import { signUpUser } from "../services/authService";

const Signup = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // VALIDATION
  const validate = () => {
    let valid = true;
    let newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email.";
      valid = false;
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    try {
      const { fullName, email, password } = formData;

      const result = await signUpUser(fullName, "", email, password);
      if (result.success) {
        router.replace("/home");
      } else {
        setErrors((prev) => ({
          ...prev,
          email: result.message,
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email: error.message,
      }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerWrap}>
            <Text style={[styles.topTitle, { color: colors.primary }]}>ILLYRIAN GYM</Text>
            <Text style={[styles.welcomeText, { color: colors.text }]}>Join Our Community</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Create your account and start your fitness journey
            </Text>
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>

            {/* FULL NAME */}
            <View style={styles.inputWrap}>
              <InputField
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(t) => updateFormData("fullName", t)}
                style={{
                  borderColor: errors.fullName ? "red" : colors.border,
                  height: 40,
                  color: "#fff",
                }}
              />
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            {/* EMAIL */}
            <View style={styles.inputWrap}>
              <InputField
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(t) => updateFormData("email", t)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  borderColor: errors.email ? "red" : colors.border,
                  height: 40,
                  color: "#fff",
                }}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* PASSWORD */}
            <View style={styles.inputWrap}>
              <InputField
                label="Password"
                placeholder="Create a password"
                secureTextEntry
                value={formData.password}
                onChangeText={(t) => updateFormData("password", t)}
                style={{
                  borderColor: errors.password ? "red" : colors.border,
                  height: 40,
                  color: "#fff",
                }}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.inputWrap}>
              <InputField
                label="Confirm Password"
                placeholder="Confirm your password"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(t) => updateFormData("confirmPassword", t)}
                style={{
                  borderColor: errors.confirmPassword ? "red" : colors.border,
                  height: 40,
                  color: "#fff",
                }}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              style={[styles.signupButton, { backgroundColor: colors.primary }]}
              onPress={handleSignup}
            >
              <Text style={styles.signupButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* DIVIDER */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* LOGIN REDIRECT */}
            <View style={styles.loginRedirect}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={[styles.loginLink, { color: colors.primary }]}> Sign In</Text>
              </TouchableOpacity>
            </View>

          </View>

          <View style={{ height: 50 }} />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20 },

  backButton: { alignSelf: "flex-start", marginBottom: 20, paddingVertical: 8 },
  backText: { fontSize: 16, fontWeight: "600" },

  headerWrap: { alignItems: "center", marginBottom: 40 },
  topTitle: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  welcomeText: { fontSize: 28, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },

  formContainer: { width: "100%", marginTop: 20 },

  inputWrap: { marginBottom: 18, height: 70 },

  errorText: {
    color: "red",
    marginTop: -20,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "500",
  },

  signupButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  signupButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  divider: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { paddingHorizontal: 15, fontSize: 15, fontWeight: "600", textAlign: "center" },

  loginRedirect: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: "700" },
});
