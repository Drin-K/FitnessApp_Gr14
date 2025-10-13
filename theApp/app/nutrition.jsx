import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import List from "../components/list";
import NutritionItem from "../components/NutritionItem";

const Nutrition = () => {
  const router = useRouter();

  const dietGoals = [
    { img: require("../assets/weightloss.png"), name: "Weight Loss", route: "/weightloss" },
    { img: require("../assets/muscle.png"), name: "Muscle Gain", route: "/nutrition/muscle" },
    { img: require("../assets/energy.png"), name: "Daily Energy", route: "/nutrition/energy" },
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#000", "#001a10", "#000"]} style={styles.bg}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Nutrition Plans</Text>
          <Text style={styles.subtitle}>Choose your goal and follow a balanced diet.</Text>

          {/* Diet Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Your Goal</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Foods</Text>
            <View style={styles.cardRow}>
              {recommendedFoods.map((food, i) => (
                <NutritionItem key={i} img={food.img} name={food.name} desc={food.desc} />
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition Tips</Text>
            <LinearGradient colors={["#002b1a", "#001a10"]} style={styles.tips}>
              {nutritionTips.map((tip, i) => (
                <Text key={i} style={styles.tip}>• {tip}</Text>
              ))}
            </LinearGradient>
          </View>

          <View style={{ height: 140 }} />
        </ScrollView>

        <List />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Nutrition;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  bg: { flex: 1 },
  scroll: { padding: 20 },
  title: { color: "#00ff88", fontSize: 32, fontWeight: "900", textAlign: "center", marginTop: 10, marginBottom: 6, letterSpacing: 1 },
  subtitle: { color: "#bfffd6", textAlign: "center", marginBottom: 25, fontSize: 14 },
  section: { marginBottom: 30 },
  sectionTitle: { color: "#00ff88", fontSize: 20, fontWeight: "700", marginBottom: 12, textShadowColor: "#003321", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 },
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  tips: { borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#00ff88" },
  tip: { color: "#bfffd6", fontSize: 13, marginBottom: 6, lineHeight: 20 },
});
