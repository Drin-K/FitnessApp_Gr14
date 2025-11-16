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
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import InputField from "../components/InputField";
import { useRouter } from "expo-router";
import { auth } from "../firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

const ChangePassword = () => {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    let valid = true;
    let newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // CURRENT PASSWORD
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Please enter your current password.";
      valid = false;
    }

    // NEW PASSWORD – empty
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Please enter a new password.";
      valid = false;
    }

    // NEW PASSWORD – short
    if (formData.newPassword.trim().length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters.";
      valid = false;
    }

    // NEW PASSWORD – same as old
    if (
      formData.currentPassword.trim() &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword = "New password cannot be the same as the old one.";
      valid = false;
    }

    // CONFIRM PASSWORD – empty
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password.";
      valid = false;
    }

    // CONFIRM PASSWORD – mismatch
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    const user = auth.currentUser;
    if (!user) {
      setErrors((prev) => ({
        ...prev,
        currentPassword: "No user is currently logged in.",
      }));
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, formData.newPassword);

      router.back();
    } catch (error) {
      console.log("Password update error:", error.code);

      if (error.code === "auth/wrong-password") {
        setErrors((prev) => ({
          ...prev,
          currentPassword: "The current password is incorrect.",
        }));
      } else if (error.code === "auth/too-many-requests") {
        setErrors((prev) => ({
          ...prev,
          currentPassword: "Too many attempts. Please try again later.",
        }));
      } else if (error.code === "auth/requires-recent-login") {
        setErrors((prev) => ({
          ...prev,
          newPassword: "Please log in again and try updating your password.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          currentPassword: "Something went wrong. Please re-try.",
        }));
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>Change Password</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Update your account security
            </Text>
          </View>

          <View style={styles.formContainer}>

            {/* CURRENT PASSWORD */}
            <View style={styles.inputWrap}>
              <InputField
                label="Current Password"
                placeholder="Enter current password"
                secureTextEntry
                value={formData.currentPassword}
                onChangeText={(t) => updateField("currentPassword", t)}
                style={{
                  borderColor: errors.currentPassword ? "red" : colors.border,
                  height: 40,
                  width:420,
                  color: "#fff"
                }}
              />
              {errors.currentPassword ? (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              ) : null}
            </View>

            {/* NEW PASSWORD */}
            <View style={styles.inputWrap}>
              <InputField
                label="New Password"
                placeholder="Enter new password"
                secureTextEntry
                value={formData.newPassword}
                onChangeText={(t) => updateField("newPassword", t)}
                style={{
                  borderColor: errors.newPassword ? "red" : colors.border,
                  height: 40,
                  width:420,
                  color: "#fff"
                }}
              />
              {errors.newPassword ? (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              ) : null}
            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.inputWrap}>
              <InputField
                label="Confirm Password"
                placeholder="Confirm new password"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(t) => updateField("confirmPassword", t)}
                style={{
                  borderColor: errors.confirmPassword ? "red" : colors.border,
                  height: 40,
                  width:420,
                  color: "#fff"
                }}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleChangePassword}
            >
              <Text style={styles.buttonText}>Update Password</Text>
            </TouchableOpacity>

          </View>

          <View style={{ height: 40 }} />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 },
  backButton: { marginBottom: 10 },
  backText: { fontSize: 16, fontWeight: "600" },

  header: { alignItems: "center", marginTop: 50 },
  title: { fontSize: 32, fontWeight: "900" },
  subtitle: { fontSize: 14, marginTop: 5 },

  formContainer: { width: "100%", marginTop: 45 },
  inputWrap: { marginBottom: 18, height: 70 },

  errorText: {
    color: "red",
    marginTop: -20,
    fontSize: 13,
    fontWeight: "500",
  },

  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
