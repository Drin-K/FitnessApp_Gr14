import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import List from "../components/list";

const Index = () => {
  const router = useRouter();
  const { colors, toggleTheme, isDarkMode } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false} 
      />

      <View style={[styles.background, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Top Header */}
          <View style={styles.topContainer}>
            <Text style={[styles.topTitle, { color: colors.primary }]}>
              ILLYRIAN GYM
            </Text>
          </View>

          {/* Home Section */}
          <View style={styles.headerWrap}>
            <Text style={[styles.beFit, { color: colors.text }]}>BE FIT</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Welcome back — little steps, big changes.
            </Text>
          </View>

          {/* Hero Section */}
          <View style={[
            styles.hero, 
            { 
              shadowColor: colors.shadow,
            }
          ]}>
            <Image
              source={require("../assets/running.png")}
              style={styles.runner}
              resizeMode="contain"
            />
            <Text style={[styles.heroText, { color: colors.text }]}>
              Start small. Stay consistent.
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/workouts")}
              >
                <Text style={styles.primaryText}>Start Workout</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.ghostBtn, { borderColor: colors.border }]}
                onPress={() => router.push("/nutrition")}
              >
                <Text style={[styles.ghostText, { color: colors.text }]}>
                  View Meal Plan
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 160 }} /> {/* Spacer so footer doesn't overlap */}
        </ScrollView>

        {/* Bottom navigation */}
        <List onNavigate={(p) => router.push(p)} />
      </View>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scroll: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Theme Toggle Button
  themeButton: {
    alignSelf: "flex-end",
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginRight: 10,
  },
  themeText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Header
  topContainer: {
    alignItems: "center",
    marginBottom: 25,
    paddingTop: 10,
  },
  topTitle: {
    fontSize: 35,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: -20,
    marginTop: 10
  },

  headerWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  beFit: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },

  // Hero Section
  hero: {
    marginTop: -30,
    marginRight: 30,
    width: "100%",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  runner: {
    width: "400%",
    height: 480,
    marginBottom: -70,
  },
  heroText: {
    fontSize: 15,
    marginBottom: 10,
    marginLeft: 15,
    textAlign: "center",
  },

  // Buttons
  actionRow: {
    flexDirection: "row",
    marginTop: 6,
    width: "100%",
    justifyContent: "center",
    marginLeft: 15
  },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginRight: 10,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "800",
  },
  ghostBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  ghostText: {
    fontWeight: "600",
  },
});