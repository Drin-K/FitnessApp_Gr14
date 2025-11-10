import React from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import List from "../components/List";

const Nutrition = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const dietGoals = [
    { 
      img: require("../assets/weightloss.png"), 
      name: "Weight Loss", 
      route: "/weightloss",
      calories: "1500–1700 kcal/day"
    },
    { 
      img: require("../assets/muscle.png"), 
      name: "Muscle Gain", 
      route: "/musclegain",
      calories: "2500–3000 kcal/day"
    },
    { 
      img: require("../assets/energy.png"), 
      name: "Daily Energy", 
      route: "/dailyenergy",
      calories: "2000–2200 kcal/day"
    },
  ];

  const gradientColors = isDarkMode 
    ? [colors.background, "#001a10", colors.background]
    : ["#ffffff", "#f0fff8", "#ffffff"];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={gradientColors} style={styles.bg}>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <Text style={[styles.title, { color: colors.primary }]}>Nutrition Plans</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your goal and follow a balanced diet.
          </Text>

          <View style={styles.verticalContainer}>
            {dietGoals.map((goal, i) => (
              <TouchableOpacity
                key={i}
                style={styles.bannerCard}
                onPress={() => router.push(goal.route)}
                activeOpacity={0.90}
              >
                <Image source={goal.img} style={styles.bannerImage} />

                {/* Dark gradient overlay */}
                <View style={styles.overlay} />

                {/* Text block */}
                <View style={styles.bannerTextBlock}>
                  <Text style={[styles.bannerTitle, { color: "#ffffff" }]}>
                    {goal.name}
                  </Text>

                  <Text style={styles.bannerCalories}>
                    {goal.calories}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <List onNavigate={(p) => router.push(p)} />

      </LinearGradient>
    </SafeAreaView>
  );
};

export default Nutrition;

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1 },

  scroll: {
    padding: 22,
    paddingTop: 10,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: 1,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 14,
  },

  verticalContainer: {
    width: "100%",
    gap: 22,
  },

  // NEW FULL-IMAGE CARD STYLE
  bannerCard: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    borderRadius: 20,
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  bannerTextBlock: {
    position: "absolute",
    bottom: 12,
    left: 16,
  },

  bannerTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 2,
  },

  bannerCalories: {
    fontSize: 14,
    fontWeight: "700",
    color: "#eaeaea",
  },
});
