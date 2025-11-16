// app/nutrition.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import List from "../components/List";
import NutritionItem from "../components/NutritionItem";

import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  saveNutritionGoal,
  getNutritionGoals,
  updateNutritionGoal,
  deleteNutritionGoal
} from "../services/nutritionsService";

import { mealPlansWeightLoss } from "./weightloss";
import { mealPlansMuscleGain } from "./musclegain";
import { mealPlansDailyEnergy } from "./dailyenergy";

// Utility: stable id generator from a name (safe for default items)
const generateIdFromName = (name = "") => {
  return name.toString().trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_\-]/g, "") || `goal_${Math.random().toString(36).slice(2, 9)}`;
};

const Nutrition = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedGoals, setSavedGoals] = useState([]);
  const [fetchingGoals, setFetchingGoals] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [saving, setSaving] = useState(false);

  const dietGoals = [
    {
      img: { uri: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" },
      name: "Weight Loss",
      route: "/weightloss",
      calories: "1500–1700 kcal/day"
    },
    {
      img: { uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" },
      name: "Muscle Gain",
      route: "/musclegain",
      calories: "2500–3000 kcal/day"
    },
    {
      img: { uri: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" },
      name: "Daily Energy",
      route: "/dailyenergy",
      calories: "2000–2200 kcal/day"
    },
  ];

  const recommendedFoods = [
    { img: { uri: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }, name: "Oatmeal", desc: "High in fiber & keeps you full." },
    { img: { uri: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }, name: "Grilled Chicken", desc: "Rich in protein and low in fat." },
    { img: { uri: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }, name: "Avocado", desc: "Healthy fats for energy." },
  ];

  // Funksion për të marrë të dhënat e niveleve bazuar në route
  const getPlanLevels = (goal) => {
    const routeToDataMap = {
      "/weightloss": mealPlansWeightLoss,
      "/musclegain": mealPlansMuscleGain,
      "/dailyenergy": mealPlansDailyEnergy,
    };

    const planData = routeToDataMap[goal.route];
    
    // DEBUG: Kontrollo se çfarë po merret
    console.log("🔍 === DEBUG GET PLAN LEVELS ===");
    console.log("Goal route:", goal.route);
    console.log("Goal name:", goal.name);
    console.log("Plan data exists:", !!planData);
    
    if (planData) {
      console.log("Beginner exists:", !!planData.Beginner);
      console.log("Beginner Breakfast:", planData.Beginner?.Breakfast);
      console.log("Intermediate Breakfast:", planData.Intermediate?.Breakfast);
      console.log("Advanced Breakfast:", planData.Advanced?.Breakfast);
    } else {
      console.log("❌ NO PLAN DATA FOUND for route:", goal.route);
    }
    console.log("=================================");

    // Nëse nuk ka të dhëna, kthe të dhëna test
    if (!planData) {
      console.log("⚠️ Using fallback data for:", goal.name);
      return {
        Beginner: {
          Breakfast: "Oatmeal with fruits and nuts + 2 boiled eggs",
          Lunch: "Grilled chicken salad with mixed vegetables",
          Dinner: "Baked salmon with quinoa and broccoli",
          Snacks: "Greek yogurt with almonds and apple"
        },
        Intermediate: {
          Breakfast: "3 egg omelette with spinach + whole grain toast",
          Lunch: "Turkey wrap with whole wheat tortilla",
          Dinner: "Grilled fish with sweet potato and greens",
          Snacks: "Protein shake with pear and carrots"
        },
        Advanced: {
          Breakfast: "Protein smoothie with banana and spinach",
          Lunch: "Quinoa bowl with grilled chicken and tahini",
          Dinner: "Lean steak with cauliflower rice and asparagus",
          Snacks: "Cottage cheese with berries and nuts"
        }
      };
    }

    // Kthe të dhënat e gjetura
    return {
      Beginner: planData.Beginner || {
        Breakfast: "Breakfast: Oatmeal with eggs and tea",
        Lunch: "Lunch: Chicken salad with dressing",
        Dinner: "Dinner: Salmon with vegetables",
        Snacks: "Snacks: Yogurt with fruits"
      },
      Intermediate: planData.Intermediate || {
        Breakfast: "Breakfast: Egg omelette with toast",
        Lunch: "Lunch: Turkey wrap with vegetables",
        Dinner: "Dinner: Fish with sweet potato",
        Snacks: "Snacks: Protein shake with snacks"
      },
      Advanced: planData.Advanced || {
        Breakfast: "Breakfast: Protein smoothie",
        Lunch: "Lunch: Quinoa bowl with chicken",
        Dinner: "Dinner: Steak with cauliflower rice",
        Snacks: "Snacks: Cottage cheese with nuts"
      }
    };
  };

  const fetchUserSavedGoals = async (userId) => {
    if (!userId) return;
    setFetchingGoals(true);
    try {
      const goals = await getNutritionGoals(userId) || [];
      console.log("📥 Goals fetched from Firebase:", goals.length);
      
      // Normalize dhe verifiko të dhënat
      const normalized = goals.map(g => ({
        ...g,
        id: g.id || generateIdFromName(g.originalName || g.name || "saved_goal"),
        originalName: g.originalName || g.name,
        // Sigurohu që të gjitha fushat ekzistojnë
        Breakfast: g.Breakfast || "",
        Lunch: g.Lunch || "",
        Dinner: g.Dinner || "", 
        Snacks: g.Snacks || "",
        mealLevels: g.mealLevels || {
          Breakfast: 'Beginner',
          Lunch: 'Beginner',
          Dinner: 'Beginner',
          Snacks: 'Beginner',
        }
      }));
      
      console.log("🔄 Normalized goals:", normalized);
      setSavedGoals(normalized);
    } catch (error) {
      console.error("❌ fetchUserSavedGoals error:", error);
      Alert.alert("Error", "Could not load your saved plans.");
    } finally {
      setFetchingGoals(false);
    }
  };

  // Build the display list: saved goals first, then defaults not yet saved
  const getDisplayGoals = () => {
    const normalizedDefaults = dietGoals.map(goal => ({
      ...goal,
      originalName: goal.name,
      id: generateIdFromName(goal.name),
    }));

    if (savedGoals.length > 0) {
      // Map saved goals into display items (preserve saved data like meals)
      const displaySaved = savedGoals.map(savedGoal => {
        const defaultGoal = normalizedDefaults.find(d => d.name === savedGoal.originalName);
        return {
          id: savedGoal.id,
          name: savedGoal.name || defaultGoal?.name || savedGoal.originalName,
          calories: savedGoal.calories || defaultGoal?.calories || "",
          img: savedGoal.img || defaultGoal?.img || normalizedDefaults[0].img,
          route: defaultGoal?.route || "/nutrition",
          originalName: savedGoal.originalName,
          isActive: savedGoal.isActive ?? true,
          Breakfast: savedGoal.Breakfast || "",
          Lunch: savedGoal.Lunch || "",
          Dinner: savedGoal.Dinner || "",
          Snacks: savedGoal.Snacks || "",
          mealLevels: savedGoal.mealLevels || {
            Breakfast: savedGoal.mealLevels?.Breakfast || 'Beginner',
            Lunch: savedGoal.mealLevels?.Lunch || 'Beginner',
            Dinner: savedGoal.mealLevels?.Dinner || 'Beginner',
            Snacks: savedGoal.mealLevels?.Snacks || 'Beginner',
          }
        };
      });

      // Add defaults that are not saved yet
      const unsavedDefaults = normalizedDefaults.filter(d =>
        !savedGoals.some(s => s.originalName === d.name)
      );

      return [...displaySaved, ...unsavedDefaults];
    }

    // No saved goals, return normalized defaults
    return normalizedDefaults;
  };

  // Robust saved-check: check both originalName and name and id
  const isGoalSaved = (goalNameOrId) => {
    if (!goalNameOrId) return false;
    return savedGoals.some(goal =>
      goal.originalName === goalNameOrId ||
      goal.name === goalNameOrId ||
      goal.id === goalNameOrId
    );
  };

  const handleGoalToggle = async (goal) => {
    if (!user) {
      Alert.alert("Login Required", "Please create an account to save plans.");
      return;
    }

    const goalOriginalName = goal.originalName || goal.name;
    const currentlySaved = savedGoals.find(s => s.originalName === goalOriginalName);

    try {
      if (currentlySaved) {
        // Përdor funksionin për fshirje
        await deleteNutritionGoal(user.uid, currentlySaved.id);
        setSavedGoals(prev => prev.filter(g => g.id !== currentlySaved.id));
        Alert.alert("Removed", `"${currentlySaved.name}" removed from saved plans.`);
      } else {
        const planLevels = getPlanLevels(goal);
        const defaultPlan = planLevels.Beginner;

        const payload = {
          name: goal.name,
          calories: goal.calories,
          img: goal.img,
          originalName: goalOriginalName,
          isActive: true,
          Breakfast: defaultPlan.Breakfast || "",
          Lunch: defaultPlan.Lunch || "",
          Dinner: defaultPlan.Dinner || "",
          Snacks: defaultPlan.Snacks || "",
          mealLevels: {
            Breakfast: 'Beginner',
            Lunch: 'Beginner',
            Dinner: 'Beginner',
            Snacks: 'Beginner',
          },
          tips: defaultPlan.tips || [],
        };

        await saveNutritionGoal(user.uid, payload);
        await fetchUserSavedGoals(user.uid);
        Alert.alert("Saved!", `${payload.name} has been saved`);
      }
    } catch (error) {
      console.error("handleGoalToggle error:", error);
      Alert.alert("Error", "Could not update plan.");
    }
  };

  const handleEditPlan = (goal) => {
    const isSaved = savedGoals.some(s => s.originalName === goal.originalName);
    
    if (!isSaved) {
      Alert.alert(
        "Save First",
        "This plan isn't saved yet. Save it to your profile before editing?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save & Edit",
            onPress: async () => {
              try {
                const planLevels = getPlanLevels(goal);
                const defaultPlan = planLevels.Beginner;

                const payload = {
                  name: goal.name,
                  calories: goal.calories,
                  img: goal.img,
                  originalName: goal.originalName,
                  isActive: true,
                  Breakfast: defaultPlan.Breakfast || "",
                  Lunch: defaultPlan.Lunch || "",
                  Dinner: defaultPlan.Dinner || "",
                  Snacks: defaultPlan.Snacks || "",
                  mealLevels: {
                    Breakfast: 'Beginner',
                    Lunch: 'Beginner',
                    Dinner: 'Beginner',
                    Snacks: 'Beginner',
                  },
                };

                await saveNutritionGoal(user.uid, payload);
                await fetchUserSavedGoals(user.uid);
                
                // Gjej planin e ruajtur për të editurar
                const updatedGoals = await getNutritionGoals(user.uid);
                const newlySaved = updatedGoals.find(g => g.originalName === goal.originalName);
                
                if (newlySaved) {
                  const planLevels = getPlanLevels(goal);
                  setEditGoal({
                    ...newlySaved,
                    levels: planLevels
                  });
                  setEditModalVisible(true);
                }
              } catch (err) {
                console.error(err);
                Alert.alert("Error", "Could not save plan to enable editing.");
              }
            }
          }
        ]
      );
      return;
    }

    // Merr të dhënat e niveleve nga plani i zgjedhur
    const planLevels = getPlanLevels(goal);
    
    // Debug: kontrollo se çfarë të dhënash po merr
    console.log("Plan Levels:", planLevels);
    console.log("Goal data:", goal);
    
    // Krijo objektin editGoal me të dhëna të plota
    setEditGoal({
      id: goal.id,
      name: goal.name,
      calories: goal.calories,
      originalName: goal.originalName,
      Breakfast: goal.Breakfast || "",
      Lunch: goal.Lunch || "",
      Dinner: goal.Dinner || "",
      Snacks: goal.Snacks || "",
      levels: planLevels,
      mealLevels: goal.mealLevels || {
        Breakfast: 'Beginner',
        Lunch: 'Beginner',
        Dinner: 'Beginner',
        Snacks: 'Beginner',
      }
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editGoal) {
      Alert.alert("Error", "Nothing to save.");
      return;
    }

    // Verifikoj nëse të gjitha fushat e nevojshme janë plotësuar
    const requiredFields = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    const emptyFields = requiredFields.filter(field => !editGoal[field]?.trim());
    
    if (emptyFields.length > 0) {
      Alert.alert(
        "Missing Information", 
        `Please select levels for: ${emptyFields.join(', ')}`
      );
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        name: editGoal.name,
        calories: editGoal.calories,
        Breakfast: editGoal.Breakfast,
        Lunch: editGoal.Lunch,
        Dinner: editGoal.Dinner,
        Snacks: editGoal.Snacks,
        originalName: editGoal.originalName,
        mealLevels: editGoal.mealLevels || {
          Breakfast: 'Beginner',
          Lunch: 'Beginner', 
          Dinner: 'Beginner',
          Snacks: 'Beginner',
        },
        isActive: true,
        updatedAt: new Date()
      };

      console.log("🔄 Saving data to Firebase:", updatedData);
      console.log("📝 Goal ID:", editGoal.id);

      if (editGoal.id && savedGoals.some(s => s.id === editGoal.id)) {
        console.log("📝 Updating existing goal:", editGoal.id);
        await updateNutritionGoal(user.uid, editGoal.id, updatedData);
      } else {
        console.log("💾 Saving new goal");
        await saveNutritionGoal(user.uid, updatedData);
      }

      // Rifresko të dhënat menjëherë
      await fetchUserSavedGoals(user.uid);
      
      // Mbyll modal dhe reset
      setEditModalVisible(false);
      setEditGoal(null);
      
      Alert.alert("Success", `"${updatedData.name}" has been updated successfully!`);
      
    } catch (error) {
      console.error("❌ Edit error:", error);
      Alert.alert("Error", "Could not update plan. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Funksion për të ndryshuar nivelin për një vakt specifik
  const handleMealLevelChange = (mealType, level) => {
    if (!editGoal || !editGoal.levels) {
      console.log("No editGoal or levels available");
      return;
    }

    // Merr ushqimin e duhur nga niveli i zgjedhur
    const selectedMeal = editGoal.levels[level]?.[mealType] || "No meal data available";
    
    console.log(`Changing ${mealType} to ${level}:`, selectedMeal);
    
    // Përdor functional update për të shmangur probleme me referencën
    setEditGoal(prev => {
      const updatedMealLevels = {
        ...prev.mealLevels,
        [mealType]: level
      };
      
      return {
        ...prev,
        mealLevels: updatedMealLevels,
        [mealType]: selectedMeal
      };
    });
  };

  // Shto useEffect për të monitoruar ndryshimet në savedGoals
  useEffect(() => {
    console.log("🔄 savedGoals updated:", savedGoals.length);
    savedGoals.forEach((goal, index) => {
      console.log(`Goal ${index + 1}:`, {
        name: goal.name,
        Breakfast: goal.Breakfast,
        Lunch: goal.Lunch,
        Dinner: goal.Dinner,
        Snacks: goal.Snacks,
        mealLevels: goal.mealLevels
      });
    });
  }, [savedGoals]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};
        setUser({
          uid: firebaseUser.uid,
          fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "User",
          email: data.email || firebaseUser.email,
        });
        await fetchUserSavedGoals(firebaseUser.uid);
      } else {
        setUser(null);
        setSavedGoals([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const displayGoals = getDisplayGoals();
  const gradientColors = isDarkMode
    ? [colors.background, "#001a10", colors.background]
    : ["#ffffff", "#f0fff8", "#ffffff"];

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
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.primary }]}>Nutrition Plans</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your goal and follow a balanced diet.
          </Text>

          {!user ? (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Select Your Goal</Text>
                <View style={styles.cardRow}>
                  {dietGoals.map((goal, i) => (
                    <NutritionItem key={i} img={goal.img} name={goal.name} onPress={() => router.push(goal.route)} />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Recommended Foods</Text>
                <View style={styles.cardRow}>
                  {recommendedFoods.map((food, i) => (
                    <NutritionItem key={i} img={food.img} name={food.name} desc={food.desc} />
                  ))}
                </View>
              </View>

              <View style={styles.authPrompt}>
                <Text style={[styles.authText, { color: colors.textSecondary }]}>
                  Create an account to save your nutrition plans!
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
              <View style={styles.welcomeSection}>
                <Text style={[styles.welcomeText, { color: colors.primary }]}>
                  Welcome back, {user.fullName}!
                </Text>
                <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
                  {savedGoals.length > 0
                    ? `You have ${savedGoals.length} saved plan${savedGoals.length !== 1 ? 's' : ''}`
                    : "Choose a plan to get started!"}
                </Text>
              </View>

              <View style={styles.verticalContainer}>
                {displayGoals.map((goal, i) => {
                  const isSaved = isGoalSaved(goal.originalName);
                  return (
                    <View key={goal.id || i} style={styles.bannerCardWrapper}>
                      <TouchableOpacity
                        style={[styles.cardSaveButton, { backgroundColor: isSaved ? '#ff4444' : colors.primary }]}
                        onPress={() => handleGoalToggle(goal)}
                      >
                        <Text style={styles.saveIcon}>{isSaved ? "X" : "★"}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.bannerCard}
                        onPress={() => router.push(goal.route)}
                      >
                        <Image source={goal.img} style={styles.bannerImage} />
                        <View style={styles.overlay} />
                        <View style={styles.bannerTextBlock}>
                          <Text style={[styles.bannerTitle, { color: "#fff" }]}>{goal.name}</Text>
                          <Text style={styles.bannerCalories}>{goal.calories}</Text>
                          {isSaved && <Text style={styles.savedText}>Saved to profile</Text>}
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {savedGoals.length > 0 && (
                <View style={styles.summarySection}>
                  <Text style={[styles.summaryTitle, { color: colors.primary }]}>Your Saved Plans ({savedGoals.length})</Text>

                  {savedGoals.map((goal) => (
                    <View key={goal.id} style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                      <Text style={[styles.summaryGoal, { color: colors.text }]}>{goal.name}</Text>
                      <Text style={[styles.summaryCalories, { color: colors.textSecondary }]}>{goal.calories}</Text>

                      {/* Shfaq ushqimet aktuale për çdo vakt */}
                      <View style={styles.mealsContainer}>
                        <View style={styles.mealRow}>
                          <Text style={[styles.mealLabel, { color: colors.text }]}>Breakfast:</Text>
                          <Text style={[styles.mealValue, { color: colors.textSecondary }]}>
                            {goal.Breakfast || "Not set"}
                          </Text>
                        </View>
                        
                        <View style={styles.mealRow}>
                          <Text style={[styles.mealLabel, { color: colors.text }]}>Lunch:</Text>
                          <Text style={[styles.mealValue, { color: colors.textSecondary }]}>
                            {goal.Lunch || "Not set"}
                          </Text>
                        </View>
                        
                        <View style={styles.mealRow}>
                          <Text style={[styles.mealLabel, { color: colors.text }]}>Dinner:</Text>
                          <Text style={[styles.mealValue, { color: colors.textSecondary }]}>
                            {goal.Dinner || "Not set"}
                          </Text>
                        </View>
                        
                        <View style={styles.mealRow}>
                          <Text style={[styles.mealLabel, { color: colors.text }]}>Snacks:</Text>
                          <Text style={[styles.mealValue, { color: colors.textSecondary }]}>
                            {goal.Snacks || "Not set"}
                          </Text>
                        </View>
                      </View>

                      {/* Shfaq nivelet për çdo vakt nëse ekzistojnë */}
                      {goal.mealLevels && (
                        <View style={styles.levelsContainer}>
                          <Text style={[styles.levelsTitle, { color: colors.textSecondary }]}>Selected Levels:</Text>
                          <View style={styles.levelsRow}>
                            {Object.entries(goal.mealLevels).map(([meal, level]) => (
                              <View key={meal} style={styles.levelBadge}>
                                <Text style={[styles.levelBadgeText, { color: colors.primary }]}>
                                  {meal}: {level}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[styles.manageButton, { borderColor: colors.primary, marginTop: 12 }]}
                        onPress={() => handleEditPlan(goal)}
                      >
                        <Text style={[styles.manageButtonText, { color: colors.primary }]}>Edit Meals</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Modal për editimin e ushqimeve */}
        <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                Edit Your Plan: {editGoal?.name}
              </Text>

              <ScrollView style={{ maxHeight: '70%' }} showsVerticalScrollIndicator={false}>
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
                  <View key={meal} style={{ marginBottom: 20 }}>
                    <Text style={[styles.mealHeader, { color: colors.primary }]}>{meal}</Text>

                    {/* Zgjedhja e nivelit */}
                    <View style={styles.levelSelector}>
                      {['Beginner', 'Intermediate', 'Advanced'].map((level) => {
                        const isSelected = editGoal?.mealLevels?.[meal] === level;
                        
                        return (
                          <TouchableOpacity
                            key={level}
                            style={[
                              styles.levelButton,
                              {
                                backgroundColor: isSelected ? colors.primary : colors.background,
                                borderColor: colors.primary
                              }
                            ]}
                            onPress={() => handleMealLevelChange(meal, level)}
                          >
                            <Text style={[
                              styles.levelButtonText,
                              { color: isSelected ? '#fff' : colors.text }
                            ]}>
                              {level}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Shfaq ushqimin e zgjedhur */}
                    <View style={[styles.selectedMealContainer, { backgroundColor: colors.background }]}>
                      <Text style={[styles.selectedLevelText, { color: colors.primary }]}>
                        Level: {editGoal?.mealLevels?.[meal] || 'Not selected'}
                      </Text>
                      <Text style={[styles.selectedMealText, { color: colors.text }]}>
                        {editGoal?.[meal] || "Please select a level above"}
                      </Text>
                    </View>

                    {/* Opsione të tjera për këtë vakt */}
                    <Text style={[styles.optionsTitle, { color: colors.textSecondary }]}>
                      All options for {meal}:
                    </Text>
                    <View style={styles.optionsList}>
                      {editGoal?.levels && Object.entries(editGoal.levels).map(([level, meals]) => (
                        <View key={level} style={styles.optionItem}>
                          <Text style={[styles.optionLevel, { 
                            color: editGoal?.mealLevels?.[meal] === level ? colors.primary : colors.textSecondary,
                            fontWeight: editGoal?.mealLevels?.[meal] === level ? 'bold' : 'normal'
                          }]}>
                            {level}:
                          </Text>
                          <Text style={[styles.optionMeal, { color: colors.text }]}>
                            {meals[meal] || "No meal data available"}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: colors.primary }]}
                  onPress={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.primary, borderWidth: 1 }]}
                  onPress={() => { setEditModalVisible(false); setEditGoal(null); }}
                  disabled={saving}
                >
                  <Text style={[styles.modalButtonText, { color: colors.primary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <List onNavigate={(p) => router.push(p)} />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Nutrition;

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1 },
  scroll: { padding: 20, paddingTop: 10 },
  title: { fontSize: 32, fontWeight: "900", textAlign: "center", marginTop: 10, marginBottom: 6, letterSpacing: 1 },
  subtitle: { textAlign: "center", marginBottom: 25, fontSize: 14 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  authPrompt: { alignItems: "center", marginTop: 20, padding: 20, borderRadius: 16, backgroundColor: "rgba(76, 175, 80, 0.1)" },
  authText: { textAlign: "center", fontSize: 16, marginBottom: 16, lineHeight: 22 },
  authButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  authButtonText: { color: "#fff", fontWeight: "700" },
  welcomeSection: { marginBottom: 20, alignItems: "center" },
  welcomeText: { fontSize: 22, fontWeight: "700" },
  welcomeSubtext: { fontSize: 14, marginTop: 4 },
  verticalContainer: { marginBottom: 20 },
  bannerCardWrapper: { marginBottom: 20, position: 'relative' },
  bannerCard: { borderRadius: 14, overflow: "hidden", height: 150 },
  bannerImage: { width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  bannerTextBlock: { position: "absolute", left: 12, bottom: 12, right: 12 },
  bannerTitle: { fontSize: 18, fontWeight: "700" },
  bannerCalories: { fontSize: 13, fontWeight: "500", color: "#fff" },
  savedText: { fontSize: 12, color: "#fff", marginTop: 4 },
  cardSaveButton: { position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  saveIcon: { fontSize: 16, color: "#fff", fontWeight: "700" },
  summarySection: { marginTop: 20 },
  summaryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  summaryCard: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  summaryGoal: { fontSize: 16, fontWeight: "700" },
  summaryCalories: { fontSize: 14, marginBottom: 10 },
  mealsContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingVertical: 4,
  },
  mealLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: '25%',
  },
  mealValue: {
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
    lineHeight: 18,
  },
  levelsContainer: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  levelsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  levelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  levelBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  manageButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, alignSelf: 'flex-start' },
  manageButtonText: { fontWeight: "700", fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", maxHeight: "80%", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: 'center' },
  mealHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#4CAF50',
  },
  levelSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  levelButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectedMealContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedMealText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedLevelText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  optionsList: {
    marginBottom: 5,
  },
  optionItem: {
    marginBottom: 4,
  },
  optionLevel: {
    fontSize: 11,
    fontWeight: '700',
  },
  optionMeal: {
    fontSize: 11,
    marginLeft: 8,
    flex: 1,
  },
  modalButtonsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  modalButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, alignItems: "center", flex: 1, marginHorizontal: 5 },
  modalSaveButton: { backgroundColor: '#4CAF50' },
  modalCancelButton: { backgroundColor: '#f0f0f0' },
  modalButtonText: { color: "#fff", fontWeight: "700" }
});