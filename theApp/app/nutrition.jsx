import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import List from "../components/List";
import NutritionItem from "../components/NutritionItem";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { saveNutritionGoal } from "../services/nutritionsService";

const Nutrition = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Listen for Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 🔎 Try to fetch Firestore user document
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            const data = snap.data();
            setUser({
              uid: firebaseUser.uid,
              fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "User",
              email: data.email || firebaseUser.email,
            });
          } else {
            // 🔁 fallback to Auth data
            setUser({
              uid: firebaseUser.uid,
              fullName: firebaseUser.displayName || "User",
              email: firebaseUser.email,
            });
          }
        } catch (err) {
          console.error("🔥 Error fetching user data:", err);
          setUser({
            uid: firebaseUser.uid,
            fullName: "User",
            email: firebaseUser.email,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle saving nutrition goal (for logged-in users)
  const handleSave = async (goal) => {
    if (!user) return;
    
    try {
      await saveNutritionGoal(user.uid, {
        name: goal.name,
        calories: goal.calories,
        img: goal.img,
      });
      Alert.alert("Saved!", `${goal.name} added to your plans ✅`);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not save nutrition plan.");
    }
  };

  // Common data
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

  // Loading spinner
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={gradientColors} style={styles.bg}>
        <ScrollView 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.primary }]}>Nutrition Plans</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your goal and follow a balanced diet.
          </Text>

          {/* 👇 Conditional rendering based on Auth state */}
          {!user ? (
            <>
              {/* PUBLIC VIEW - nutritions.jsx */}
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

              {/* Login Prompt */}
              <View style={styles.authPrompt}>
                <Text style={[styles.authText, { color: colors.textSecondary }]}>
                  Create an account to save your nutrition plans and track your progress!
                </Text>
                <TouchableOpacity
                  style={[styles.authButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push("/signup")}
                >
                  <Text style={styles.authButtonText}>Sign Up Free</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* ✅ LOGGED-IN USER VIEW - userNutrition.jsx */}
              <View style={styles.verticalContainer}>
                {dietGoals.map((goal, i) => (
                  <View key={i} style={styles.bannerCardWrapper}>
                    
                    {/* SAVE BUTTON IN THE CORNER */}
                    <TouchableOpacity
                      style={[styles.cardSaveButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleSave(goal)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.saveIcon}>★</Text>
                    </TouchableOpacity>

                    {/* FULL CARD PRESS */}
                    <TouchableOpacity
                      style={styles.bannerCard}
                      onPress={() => router.push(goal.route)}
                      activeOpacity={0.90}
                    >
                      <Image source={goal.img} style={styles.bannerImage} />
                      <View style={styles.overlay} />
                      <View style={styles.bannerTextBlock}>
                        <Text style={[styles.bannerTitle, { color: "#ffffff" }]}>
                          {goal.name}
                        </Text>
                        <Text style={styles.bannerCalories}>
                          {goal.calories}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Welcome message for logged-in user */}
              <View style={styles.welcomeSection}>
                <Text style={[styles.welcomeText, { color: colors.primary }]}>
                  Welcome back, {user.fullName}! 🎉
                </Text>
                <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
                  Your saved nutrition plans will appear here.
                </Text>
              </View>
            </>
          )}

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
    padding: 20,
    paddingTop: 10,
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
  authPrompt: {
    alignItems: "center",
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  authText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  authButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  authButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  welcomeSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  // Styles for logged-in user view
  verticalContainer: {
    width: "100%",
    gap: 30,
  },
  bannerCardWrapper: {
    width: "100%",
    position: "relative",
  },
  cardSaveButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  saveIcon: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
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