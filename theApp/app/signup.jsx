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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "../context/ThemeContext";
import InputField from "../components/InputField";

const Signup = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignup = () => {
    console.log("Signup attempt:", formData);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        <ScrollView 
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerWrap}>
            <Text style={[styles.topTitle, { color: colors.primary }]}>
              ILLYRIAN GYM
            </Text>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Join Our Community
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Create your account and start your fitness journey
            </Text>
          </View>

          {/* Signup Form */}
          <View style={styles.formContainer}>
            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => updateFormData("fullName", text)}
              autoCapitalize="words"
              autoComplete="name"
            />

            <InputField
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => updateFormData("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <InputField
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(text) => updateFormData("password", text)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />

            <InputField
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData("confirmPassword", text)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />

            {/* Signup Button */}
            <TouchableOpacity 
              style={[styles.signupButton, { backgroundColor: colors.primary }]}
              onPress={handleSignup}
            >
              <Text style={styles.signupButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Login Redirect */}
            <View style={styles.loginRedirect}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account? 
              </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 50 }} /> {/* Bottom spacer */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  
  // Back Button
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Header
  headerWrap: {
    alignItems: "center",
    marginBottom: 40,
  },
  topTitle: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // Form
  formContainer: {
    width: "100%",
    marginTop: 20,
  },
  
  // Signup Button
  signupButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 15,
    fontSize: 12,
    fontWeight: "600",
  },

  // Login Redirect
  loginRedirect: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});