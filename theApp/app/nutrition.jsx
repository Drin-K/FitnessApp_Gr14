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
import { 
  saveNutritionGoal, 
  getNutritionGoals,
  deleteNutritionGoal 
} from "../services/nutritionsService";

const Nutrition = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedGoals, setSavedGoals] = useState([]);
  const [fetchingGoals, setFetchingGoals] = useState(false);

  // High-quality online images for diet plans
  const dietGoals = [
    { 
      img: { uri: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" }, 
      name: "Weight Loss", 
      route: "/weightloss",
      calories: "1500–1700 kcal/day"
    },
    { 
      img: { uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" }, 
      name: "Muscle Gain", 
      route: "/musclegain",
      calories: "2500–3000 kcal/day"
    },
    { 
      img: { uri: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" }, 
      name: "Daily Energy", 
      route: "/dailyenergy",
      calories: "2000–2200 kcal/day"
    },
  ];

  // High-quality recommended foods
  const recommendedFoods = [
    { 
      img: { uri: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" }, 
      name: "Oatmeal", 
      desc: "High in fiber & keeps you full." 
    },
    { 
      img: { uri: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" }, 
      name: "Grilled Chicken", 
      desc: "Rich in protein and low in fat." 
    },
    { 
      img: { uri: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" }, 
      name: "Avocado", 
      desc: "Healthy fats for energy." 
    },
  ];

  // ✅ 1. Function to fetch and display saved goals when user logs in
  const fetchUserSavedGoals = async (userId) => {
    if (!userId) return;
    
    setFetchingGoals(true);
    try {
      console.log("📥 Fetching saved goals for user:", userId);
      const goals = await getNutritionGoals(userId);
      console.log("✅ Retrieved goals:", goals);
      setSavedGoals(goals);
    } catch (error) {
      console.error("❌ Error fetching saved goals:", error);
      Alert.alert("Error", "Could not load your saved nutrition plans.");
    } finally {
      setFetchingGoals(false);
    }
  };

  // ✅ 2. Function to determine if a goal is currently saved
  const isGoalSaved = (goalName) => {
    return savedGoals.some(goal => goal.name === goalName);
  };

  // ✅ 3. Function to handle goal selection/active state
  const handleGoalSelection = async (goal) => {
    if (!user) {
      Alert.alert("Login Required", "Please create an account to save nutrition plans.");
      return;
    }

    const isCurrentlySaved = isGoalSaved(goal.name);

    if (isCurrentlySaved) {
      // Goal is already saved - offer to remove it
      Alert.alert(
        "Remove Goal",
        `Do you want to remove "${goal.name}" from your saved plans?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Remove", 
            style: "destructive",
            onPress: () => removeSavedGoal(goal.name)
          }
        ]
      );
    } else {
      // Save new goal
      await saveNutritionGoalToFirestore(goal);
    }
  };

  // ✅ 4. Function to sync Firestore data with local state (Save operation)
  const saveNutritionGoalToFirestore = async (goal) => {
    try {
      const savedGoal = await saveNutritionGoal(user.uid, {
        name: goal.name,
        calories: goal.calories,
        img: goal.img,
      });

      // Update local state to reflect the change
      setSavedGoals([savedGoal]); // Since you only allow one active goal
      Alert.alert("Saved!", `${goal.name} set as your active plan ✅`);
    } catch (error) {
      console.error("❌ Error saving goal:", error);
      Alert.alert("Error", "Could not save nutrition plan.");
    }
  };

  // ✅ 5. Function to remove saved goal and sync state
  const removeSavedGoal = async (goalName) => {
    try {
      await deleteNutritionGoal(user.uid, goalName);
      // Update local state
      setSavedGoals(prev => prev.filter(goal => goal.name !== goalName));
      Alert.alert("Removed", `"${goalName}" has been removed from your saved plans.`);
    } catch (error) {
      console.error("❌ Error removing goal:", error);
      Alert.alert("Error", "Could not remove nutrition plan.");
    }
  };

  // ✅ Listen for Auth state changes and fetch saved goals
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

          // ✅ Fetch saved goals when user logs in
          await fetchUserSavedGoals(firebaseUser.uid);

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
        setSavedGoals([]); // Clear saved goals when user logs out
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ Get the currently active goal (first one in savedGoals)
  const activeGoal = savedGoals.length > 0 ? savedGoals[0] : null;

  // Gradient colors based on theme
  const gradientColors = isDarkMode 
    ? [colors.background, "#001a10", colors.background]
    : ["#ffffff", "#f0fff8", "#ffffff"];

  const tipsGradientColors = isDarkMode
    ? ["#002b1a", "#001a10"]
    : ["#e8f5e8", "#d0ebd0"];

  const nutritionTips = [
    "Stay hydrated — drink 2-3L water daily.",
    "Eat every 3–4 hours to maintain energy.",
    "Include fruits & veggies in each meal.",
    "Avoid sugary drinks and processed foods.",
  ];

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
              {/* PUBLIC VIEW */}
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
              {/* ✅ LOGGED-IN USER VIEW */}
              
              {/* Welcome message with active goal status */}
              <View style={styles.welcomeSection}>
                <Text style={[styles.welcomeText, { color: colors.primary }]}>
                  Welcome back, {user.fullName}! 🎉
                </Text>
                <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
                  {activeGoal 
                    ? `Your active plan: ${activeGoal.name}`
                    : "Choose a nutrition plan to get started!"
                  }
                </Text>
                
                {/* Loading indicator for goals fetch */}
                {fetchingGoals && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                      Loading your plans...
                    </Text>
                  </View>
                )}
              </View>

              {/* Nutrition Goals with Save/Remove functionality */}
              <View style={styles.verticalContainer}>
                {dietGoals.map((goal, i) => {
                  const isSaved = isGoalSaved(goal.name);
                  
                  return (
                    <View key={i} style={styles.bannerCardWrapper}>
                      
                      {/* SAVE/REMOVE BUTTON */}
                      <TouchableOpacity
                        style={[
                          styles.cardSaveButton, 
                          { 
                            backgroundColor: isSaved ? colors.secondary : colors.primary,
                            transform: [{ scale: isSaved ? 1.1 : 1 }]
                          }
                        ]}
                        onPress={() => handleGoalSelection(goal)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.saveIcon}>
                          {isSaved ? "✓" : "★"}
                        </Text>
                      </TouchableOpacity>

                      {/* ACTIVE GOAL BADGE */}
                      {isSaved && (
                        <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.activeBadgeText}>ACTIVE</Text>
                        </View>
                      )}

                      {/* FULL CARD PRESS */}
                      <TouchableOpacity
                        style={[
                          styles.bannerCard,
                          isSaved && styles.activeCard
                        ]}
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
                          {isSaved && (
                            <Text style={styles.savedText}>
                              ✓ Saved to your profile
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* Saved Goals Summary */}
              {savedGoals.length > 0 && (
                <View style={styles.summarySection}>
                  <Text style={[styles.summaryTitle, { color: colors.primary }]}>
                    Your Nutrition Plan
                  </Text>
                  <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.summaryGoal, { color: colors.text }]}>
                      {savedGoals[0].name}
                    </Text>
                    <Text style={[styles.summaryCalories, { color: colors.textSecondary }]}>
                      {savedGoals[0].calories}
                    </Text>
                    <TouchableOpacity
                      style={[styles.manageButton, { borderColor: colors.primary }]}
                      onPress={() => Alert.alert(
                        "Manage Plan",
                        "You can change your active plan by saving a different one, or remove it using the star button."
                      )}
                    >
                      <Text style={[styles.manageButtonText, { color: colors.primary }]}>
                        Manage Plan
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
  },
  // Styles for logged-in user view
  verticalContainer: {
    width: "100%",
    gap: 25,
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: "900",
  },
  activeBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 20,
  },
  activeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  bannerCard: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    elevation: 8,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  bannerTextBlock: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 2,
  },
  bannerCalories: {
    fontSize: 13,
    fontWeight: "600",
    color: "#eaeaea",
    marginBottom: 4,
  },
  savedText: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "700",
  },
  summarySection: {
    marginTop: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  summaryGoal: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryCalories: {
    fontSize: 14,
    marginBottom: 12,
  },
  manageButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  manageButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});