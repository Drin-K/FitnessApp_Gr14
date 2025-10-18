import React from "react";
import { View, Text, ScrollView, StyleSheet} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import List from "../components/List";
import NutritionItem from "../components/NutritionItem";

const Nutrition = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const dietGoals = [
    { img: require("../assets/weightloss.png"), name: "Weight Loss", route: "/weightloss" },
    { img: require("../assets/muscle.png"), name: "Muscle Gain", route: "/musclegain" },
    { img: require("../assets/energy.png"), name: "Daily Energy", route: "/dailyenergy" },
  ];

  const recommendedFoods = [
    { img: require("../assets/oatmeal.png"), name: "Oatmeal", desc: "High in fiber & keeps you full." },
    { img: require("../assets/chicken.png"), name: "Grilled Chicken", desc: "Rich in protein and low in fat." },
    { img: require("../assets/avocado.png"), name: "Avocado", desc: "Healthy fats for energy." },
  ];

  const nutritionTips = [
    "Stay hydrated — drink 2-3L water daily.",
    "Eat every 3–4 hours to maintain energy.",
    "Include fruits & veggies in each meal.",
    "Avoid sugary drinks and processed foods.",
  ];

  // Gradient colors based on theme
  const gradientColors = isDarkMode 
    ? [colors.background, "#001a10", colors.background]
    : ["#ffffff", "#f0fff8", "#ffffff"];

  const tipsGradientColors = isDarkMode
    ? ["#002b1a", "#001a10"]
    : ["#e8f5e8", "#d0ebd0"];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={gradientColors} style={styles.bg}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.title, { color: colors.primary }]}>Nutrition Plans</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your goal and follow a balanced diet.
          </Text>

          {/* Diet Goals */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Select Your Goal
            </Text>
            <View style={styles.cardRow}>
              {dietGoals.map((goal, i) => (
                <NutritionItem
                  key={i}
                  img={goal.img}
                  name={goal.name}
                  onPress={() => router.push(goal.route)}
                />
              ))}
            </View>
          </View>

          {/* Recommended Foods */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Recommended Foods
            </Text>
            <View style={styles.cardRow}>
              {recommendedFoods.map((food, i) => (
                <NutritionItem 
                  key={i} 
                  img={food.img} 
                  name={food.name} 
                  desc={food.desc} 
                />
              ))}
            </View>
          </View>

          {/* Nutrition Tips */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Nutrition Tips
            </Text>
            <LinearGradient 
              colors={tipsGradientColors} 
              style={[
                styles.tips, 
                { borderColor: colors.primary }
              ]}
            >
              {nutritionTips.map((tip, i) => (
                <Text key={i} style={[styles.tip, { color: colors.textSecondary }]}>
                  • {tip}
                </Text>
              ))}
            </LinearGradient>
          </View>

          <View style={{ height: 140 }} />
        </ScrollView>

        <List onNavigate={(p) => router.push(p)} />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Nutrition;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  bg: { 
    flex: 1 
  },
  scroll: { 
    padding: 20 
  },
  title: { 
    fontSize: 32, 
    fontWeight: "900", 
    textAlign: "center", 
    marginTop: 10, 
    marginBottom: 6, 
    letterSpacing: 1 
  },
  subtitle: { 
    textAlign: "center", 
    marginBottom: 25, 
    fontSize: 14 
  },
  section: { 
    marginBottom: 30 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    marginBottom: 12, 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 4 
  },
  cardRow: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  tips: { 
    borderRadius: 14, 
    padding: 16, 
    borderWidth: 1 
  },
  tip: { 
    fontSize: 13, 
    marginBottom: 6, 
    lineHeight: 20 
  },
});