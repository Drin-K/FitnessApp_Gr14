import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import List from "../components/List";

const Index = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  // 📍 Google Maps – lokacioni i palestrës
  const openMaps = () => {
    const latitude = 42.6629;   // Ndrysho sipas lokacionit tuaj
    const longitude = 21.1655;

    const url = Platform.select({
      ios: `maps://?q=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    Linking.openURL(url);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={styles.background}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topContainer}>
            <Text style={[styles.topTitle, { color: colors.primary }]}>
              ILLYRIAN GYM
            </Text>
          </View>

          <View style={styles.headerWrap}>
            <Text style={[styles.beFit, { color: colors.text }]}>
              BE FIT
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: colors.textSecondary },
              ]}
            >
              Welcome back — little steps, big changes.
            </Text>
          </View>

          <View style={[styles.hero, { shadowColor: colors.shadow }]}>
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
                style={[
                  styles.primaryBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => router.push("/workouts")}
              >
                <Text style={styles.primaryText}>
                  Start Workout
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.ghostBtn,
                  { borderColor: colors.border },
                ]}
                onPress={() => router.push("/nutrition")}
              >
                <Text
                  style={[
                    styles.ghostText,
                    { color: colors.text },
                  ]}
                >
                  View Meal Plan
                </Text>
              </TouchableOpacity>
            </View>

            {/* 🔍 FIND US BUTTON */}
            <TouchableOpacity
              style={[
                styles.findUsBtn,
                { borderColor: colors.primary },
              ]}
              onPress={openMaps}
            >
              <Text
                style={[
                  styles.findUsText,
                  { color: colors.primary },
                ]}
              >
                Find Us
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 160 }} />
        </ScrollView>

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
    marginTop: 40,
    flex: 1,
  },
  scroll: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
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
  hero: {
    width: "100%",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
    marginTop: 10,
  },
  runner: {
    width: 400,
    height: 400,
    marginBottom: -30,
    marginRight: 20,
    marginTop: -20,
  },
  heroText: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 6,
    width: "100%",
    justifyContent: "center",
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

  /* FIND US */
  findUsBtn: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 25,
    borderWidth: 2,
  },
  findUsText: {
    fontWeight: "800",
    letterSpacing: 1,
  },
});
