import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

import List from "../components/list";

const indexx = () => {
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.container]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />

      <View style={styles.background}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Top Header */}
          <View style={styles.topContainer}>
            <Text style={styles.topTitle}>ILLYRIAN GYM</Text>
            {/* <Text style={styles.topSubtitle}>Train Hard. Stay Consistent. Conquer Goals.</Text> */}
          </View>

          {/* Home Section */}
          <View style={styles.headerWrap}>
            <Text style={styles.beFit}>BE FIT</Text>
            <Text style={styles.subtitle}>Welcome back — little steps, big changes.</Text>
          </View>

          {/* Hero Image */}
          <View style={styles.hero}>
            <Image
              source={require("../assets/running.png")}
              style={styles.runner}
              resizeMode="contain"
            />
            <Text style={styles.heroText}>Start small. Stay consistent.</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/workouts")}>
                <Text style={styles.primaryText}>Start Workout</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push("/nutrition")}>
                <Text style={styles.ghostText}>View Meal Plan</Text>
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

export default indexx;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
    backgroundColor: "#000",
  },
  scroll: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // --- Header ---
  topContainer: {
    alignItems: "center",
    marginBottom: 25,
    paddingTop: 10,
  },
  topTitle: {
    color: "#00ff88",
    fontSize: 35,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textShadowColor: "#00ff88",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom:-20,
    marginTop:10
  },
  topSubtitle: {
    color: "#b7ffcc",
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  headerWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  beFit: {
    color: "#bfffd6",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  subtitle: {
    color: "#9fbfaa",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },

  // --- Hero section ---
  hero: {
    marginTop: -30,
    marginRight:30,
    width: "100%",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 14,
    shadowColor: "#00ff7f",
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
    color: "#cdefd8",
    fontSize: 15,
    marginBottom: 10,
    marginLeft:15,
    textAlign: "center",
  },

  // --- Buttons ---
  actionRow: {
    flexDirection: "row",
    marginTop: 6,
    width: "100%",
    justifyContent: "center",
    marginLeft:15
  },
  primaryBtn: {
    backgroundColor: "#06d68a",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginRight: 10,
  },
  primaryText: {
    color: "#02120a",
    fontWeight: "800",
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: "#0c3f32",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  ghostText: {
    color: "#bfead0",
  },
});
