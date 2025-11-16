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
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|info)$/i;
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
        router.replace("/");
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
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join our community and start your fitness journey
            </Text>
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>

            {/* FULL NAME */}
            <View style={styles.inputWrap}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor="#888"
                style={[
                  styles.input,
                  { 
                    borderColor: errors.fullName ? "red" : colors.border,
                    color: colors.text,
                    backgroundColor: colors.card
                  }
                ]}
                value={formData.fullName}
                onChangeText={(t) => updateFormData("fullName", t)}
              />
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            {/* EMAIL */}
            <View style={styles.inputWrap}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.input,
                  { 
                    borderColor: errors.email ? "red" : colors.border,
                    color: colors.text,
                    backgroundColor: colors.card
                  }
                ]}
                value={formData.email}
                onChangeText={(t) => updateFormData("email", t)}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* PASSWORD */}
            <View style={styles.inputWrap}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <TextInput
                placeholder="Create a password"
                placeholderTextColor="#888"
                secureTextEntry
                style={[
                  styles.input,
                  { 
                    borderColor: errors.password ? "red" : colors.border,
                    color: colors.text,
                    backgroundColor: colors.card
                  }
                ]}
                value={formData.password}
                onChangeText={(t) => updateFormData("password", t)}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.inputWrap}>
              <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor="#888"
                secureTextEntry
                style={[
                  styles.input,
                  { 
                    borderColor: errors.confirmPassword ? "red" : colors.border,
                    color: colors.text,
                    backgroundColor: colors.card
                  }
                ]}
                value={formData.confirmPassword}
                onChangeText={(t) => updateFormData("confirmPassword", t)}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSignup}
            >
              <Text style={styles.buttonText}>Create Account</Text>
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
  scroll: { flexGrow: 1, padding: 24 },

  backButton: { marginBottom: 10 },
  backText: { fontSize: 16, fontWeight: "600" },

  header: { alignItems: "center", marginTop: 50 },
  title: { fontSize: 32, fontWeight: "900" },
  subtitle: { fontSize: 14, marginTop: 5, textAlign: "center" },

  formContainer: { 
    width: "100%", 
    marginTop: 30 
  },
  inputWrap: { 
    marginBottom: 20 
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 5,
  },

  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16 
  },

  divider: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 20 
  },
  dividerLine: { 
    flex: 1, 
    height: 1 
  },
  dividerText: { 
    paddingHorizontal: 15, 
    fontSize: 14, 
    fontWeight: "600" 
  },

  loginRedirect: { 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loginText: { 
    fontSize: 14 
  },
  loginLink: { 
    fontSize: 14, 
    fontWeight: "700" 
  },
});