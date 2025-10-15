// ProfileScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, FontAwesome, AntDesign } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext"; 
import List from "../components/list";

const ProfileScreen = () => {
  const { colors, isDarkMode } = useTheme(); 

  const gradientColors = isDarkMode
    ? [colors.background, "#001a10", colors.background]
    : ["#ffffff", "#f0fff8", "#ffffff"];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={gradientColors} style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Profile</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.signInTitle, { color: colors.primary }]}>Sign in</Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={[styles.authButton, styles.appleButton]}>
            <FontAwesome name="apple" size={20} color="white" style={{ marginRight: 12 }} />
            <Text style={[styles.buttonText, { color: "white" }]}>Sign in with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.authButton, styles.emailButton]}>
            <MaterialCommunityIcons name="email-outline" size={20} color="white" style={{ marginRight: 12 }} />
            <Text style={[styles.buttonText, { color: "white" }]}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.authButton, styles.googleButton]}>
            <AntDesign name="google" size={20} color="white" style={{ marginRight: 12 }} />
            <Text style={[styles.buttonText, { color: "white" }]}>Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity style={[styles.moreCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.moreLeft}>
            <View style={styles.iconWrapper}>
              <View style={styles.iconDot} />
              <View style={styles.iconDot} />
              <View style={styles.iconDot} />
              <View style={styles.iconDot} />
            </View>
            <Text style={[styles.moreText, { color: colors.text }]}>More</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <Text style={[styles.link, { color: colors.primary }]} onPress={() => Linking.openURL("#")}>
            Terms of use
          </Text>
          <Text style={[styles.link, { color: colors.primary }]} onPress={() => Linking.openURL("#")}>
            Privacy policy
          </Text>
        </View>

        {/* Spacer for layout */}
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={{ marginBottom: 0 }}> 
        <List onNavigate={(p) => router.push(p)} />
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
    paddingTop: 18,
    paddingBottom: 120,
  },
  signInTitle: {
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 10,
  },
  buttonGroup: {
    marginTop: 6,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 999,
    marginBottom: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  appleButton: {
    backgroundColor: "#333333", 
  },
  emailButton: {
    backgroundColor: "#4CAF50", 
  },
  googleButton: {
    backgroundColor: "#4285F4", 
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "800",
  },
  spacer: {
    height: 30,
  },
  moreCard: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
  },
  moreLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 5,
  },
  iconDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#2D2D2D",
    margin: 1,
  },
  moreText: {
    fontSize: 20,
    fontWeight: "700",
  },
  linksRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  link: {
    textDecorationLine: "underline",
    fontSize: 16,
  },
});

export default ProfileScreen;
