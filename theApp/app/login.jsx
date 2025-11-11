import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import List from "../components/List";
import { useTheme } from "../context/ThemeContext";
import { loginUser } from "../services/authService";
import { Alert } from "react-native";

const LoginScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

 const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Gabim", "Ju lutem plotësoni emailin dhe fjalëkalimin");
    return;
  }

  const result = await loginUser(email, password);
  if (result.success) {
    Alert.alert("Sukses", "Jeni kyçur me sukses!");
    router.push("/"); // ose "/dashboard" nëse ke emër tjetër për faqen kryesore
  } else {
    Alert.alert("Gabim", result.message);
  }
};


  // Gradient colors based on theme
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
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false} 
      />
      
      <View style={{ flex: 1 }}>
        <LinearGradient colors={gradientColors} style={styles.bg}>
          <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: colors.primary }]}>Welcome Back</Text>

            {/* Email */}
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: colors.card,
                borderColor: colors.border
              }
            ]}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email address"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: colors.card,
                borderColor: colors.border
              }
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primary} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
              By logging in, you agree to IllyrianGym{" "}
              <Text style={[styles.link, { color: colors.primary }]}>Privacy Policy</Text> and{" "}
              <Text style={[styles.link, { color: colors.primary }]}>Terms and Conditions</Text>
            </Text>

            {/* Button */}
            <TouchableOpacity 
              style={[
                styles.button, 
                { 
                  backgroundColor: colors.card,
                  borderColor: colors.primary
                }
              ]} 
              onPress={handleLogin}
            >
              <Text style={[styles.buttonText, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity>
              <Text style={[styles.forgot, { color: colors.text }]}>FORGOT YOUR PASSWORD?</Text>
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
  container: { 
    flex: 1,
  },
  bg: { 
    flex: 1 
  },
  scroll: { 
    padding: 20, 
    flexGrow: 1 
  },
  title: {
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
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 18,
    borderWidth: 1,
    marginTop: 10
  },
  icon: { 
    marginRight: 10 
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 18,
  },
  link: {
    textDecorationLine: "underline",
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
  },
  footer: {
    flexShrink: 0,
    backgroundColor: "transparent",
  },
});