
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


const generateIdFromName = (name = "") => {
  return name.toString().trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_\-]/g, "") || `goal_${Math.random().toString(36).slice(2, 9)}`;
};

const mealOptions = {
  Breakfast: [
    { name: "Oatmeal with fruits and nuts + 2 boiled eggs", calories: 450 },
    { name: "3 egg omelette with spinach + whole grain toast", calories: 380 },
    { name: "Protein smoothie with banana and spinach", calories: 320 },
    { name: "Greek yogurt with granola and berries", calories: 350 },
    { name: "Scrambled eggs with avocado and whole wheat bread", calories: 420 },
    { name: "Protein pancakes with maple syrup", calories: 480 },
    { name: "Cottage cheese with pineapple and almonds", calories: 280 }
  ],
  Lunch: [
    { name: "Grilled chicken salad with mixed vegetables", calories: 520 },
    { name: "Turkey wrap with whole wheat tortilla", calories: 480 },
    { name: "Quinoa bowl with grilled chicken and tahini", calories: 560 },
    { name: "Salmon with sweet potato and steamed broccoli", calories: 580 },
    { name: "Brown rice with vegetables and tofu", calories: 450 },
    { name: "Chicken stir-fry with brown rice", calories: 520 },
    { name: "Lentil soup with whole grain bread", calories: 380 }
  ],
  Dinner: [
    { name: "Baked salmon with quinoa and broccoli", calories: 540 },
    { name: "Grilled fish with sweet potato and greens", calories: 490 },
    { name: "Lean steak with cauliflower rice and asparagus", calories: 520 },
    { name: "Chicken breast with roasted vegetables", calories: 480 },
    { name: "Turkey meatballs with zucchini noodles", calories: 440 },
    { name: "Baked cod with mashed potatoes and peas", calories: 460 },
    { name: "Vegetable curry with brown rice", calories: 420 }
  ],
  Snacks: [
    { name: "Greek yogurt with almonds and apple", calories: 280 },
    { name: "Protein shake with pear and carrots", calories: 220 },
    { name: "Cottage cheese with berries and nuts", calories: 240 },
    { name: "Apple slices with peanut butter", calories: 320 },
    { name: "Protein bar and banana", calories: 350 },
    { name: "Hummus with vegetable sticks", calories: 180 },
    { name: "Mixed nuts and dried fruits", calories: 300 }
  ]
};

const calculateTotalCalories = (breakfast, lunch, dinner, snacks) => {
  let total = 0;

  const breakfastMeal = mealOptions.Breakfast.find(meal => meal.name === breakfast);
  if (breakfastMeal) total += breakfastMeal.calories;

  const lunchMeal = mealOptions.Lunch.find(meal => meal.name === lunch);
  if (lunchMeal) total += lunchMeal.calories;

  const dinnerMeal = mealOptions.Dinner.find(meal => meal.name === dinner);
  if (dinnerMeal) total += dinnerMeal.calories;

  const snacksMeal = mealOptions.Snacks.find(meal => meal.name === snacks);
  if (snacksMeal) total += snacksMeal.calories;
  
  return total;
};

const findMealCalories = (mealName, mealType) => {
  const meals = mealOptions[mealType];
  const meal = meals.find(m => m.name === mealName);
  return meal ? meal.calories : 0;
};

const convertDefaultMealsToNewFormat = (planData) => {
  if (!planData) return null;

  const convertedPlan = {};
  
  Object.keys(planData).forEach(level => {
    const levelData = planData[level];
    convertedPlan[level] = {};

    Object.keys(levelData).forEach(mealType => {
      if (['Breakfast', 'Lunch', 'Dinner', 'Snacks'].includes(mealType)) {
        const oldMeal = levelData[mealType];
    
        const matchedMeal = findBestMatchingMeal(oldMeal, mealType);
        convertedPlan[level][mealType] = matchedMeal;
      } else {
        convertedPlan[level][mealType] = levelData[mealType];
      }
    });
  });
  
  return convertedPlan;
};

const findBestMatchingMeal = (oldMeal, mealType) => {
  const availableMeals = mealOptions[mealType];

  const exactMatch = availableMeals.find(meal => meal.name === oldMeal);
  if (exactMatch) return exactMatch.name;
  
  const keywords = oldMeal.toLowerCase().split(' ');
  let bestMatch = availableMeals[0]; 
  
  availableMeals.forEach(meal => {
    const mealKeywords = meal.name.toLowerCase().split(' ');
    const commonKeywords = keywords.filter(keyword => 
      mealKeywords.some(mealKeyword => mealKeyword.includes(keyword) || keyword.includes(mealKeyword))
    );
    
    if (commonKeywords.length > 0) {
      bestMatch = meal;
    }
  });
  
  return bestMatch.name;
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
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [totalCalories, setTotalCalories] = useState(0);

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

  const getPlanLevels = (goal) => {
    const routeToDataMap = {
      "/weightloss": mealPlansWeightLoss,
      "/musclegain": mealPlansMuscleGain,
      "/dailyenergy": mealPlansDailyEnergy,
    };

    const planData = routeToDataMap[goal.route];
    
    const convertedPlanData = convertDefaultMealsToNewFormat(planData);

    if (!convertedPlanData) {
      return {
        Beginner: {
          Breakfast: mealOptions.Breakfast[0].name,
          Lunch: mealOptions.Lunch[0].name,
          Dinner: mealOptions.Dinner[0].name,
          Snacks: mealOptions.Snacks[0].name,
          tips: ["Start with balanced meals", "Stay consistent", "Drink plenty of water"]
        },
        Intermediate: {
          Breakfast: mealOptions.Breakfast[1].name,
          Lunch: mealOptions.Lunch[1].name,
          Dinner: mealOptions.Dinner[1].name,
          Snacks: mealOptions.Snacks[1].name,
          tips: ["Increase protein intake", "Track your progress", "Include variety"]
        },
        Advanced: {
          Breakfast: mealOptions.Breakfast[2].name,
          Lunch: mealOptions.Lunch[2].name,
          Dinner: mealOptions.Dinner[2].name,
          Snacks: mealOptions.Snacks[2].name,
          tips: ["Optimize meal timing", "Focus on recovery", "Monitor macros"]
        }
      };
    }

    return convertedPlanData;
  };

  const getDefaultPlanCalories = (goal) => {
    const planLevels = getPlanLevels(goal);
    const defaultPlan = planLevels.Beginner;
    
    const totalCalories = calculateTotalCalories(
      defaultPlan.Breakfast,
      defaultPlan.Lunch,
      defaultPlan.Dinner,
      defaultPlan.Snacks
    );
    
    return `${totalCalories} kcal/day`;
  };

const fetchUserSavedGoals = async (userId) => {
  if (!userId) return;
  setFetchingGoals(true);
  try {
    const goals = await getNutritionGoals(userId) || [];
    console.log("📥 Goals fetched from Firebase:", goals.length);
    
    goals.forEach((goal, index) => {
      console.log(`🔥 Firebase Goal ${index + 1}:`, {
        name: goal.name,
        Breakfast: goal.Breakfast,
        Lunch: goal.Lunch,
        Dinner: goal.Dinner,
        Snacks: goal.Snacks
      });
    });
    
    const normalized = goals.map(g => ({
      ...g,
      id: g.id || generateIdFromName(g.originalName || g.name || "saved_goal"),
      originalName: g.originalName || g.name,
      Breakfast: g.Breakfast || mealOptions.Breakfast[0].name,
      Lunch: g.Lunch || mealOptions.Lunch[0].name,
      Dinner: g.Dinner || mealOptions.Dinner[0].name,
      Snacks: g.Snacks || mealOptions.Snacks[0].name,
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

  const getDisplayGoals = () => {
    const normalizedDefaults = dietGoals.map(goal => ({
      ...goal,
      originalName: goal.name,
      id: generateIdFromName(goal.name),
      calories: getDefaultPlanCalories(goal)
    }));

    if (savedGoals.length > 0) {
      const displaySaved = savedGoals.map(savedGoal => {
        const defaultGoal = normalizedDefaults.find(d => d.name === savedGoal.originalName);
        
        const savedGoalCalories = calculateTotalCalories(
          savedGoal.Breakfast,
          savedGoal.Lunch,
          savedGoal.Dinner,
          savedGoal.Snacks
        );
        
        return {
          id: savedGoal.id,
          name: savedGoal.name || defaultGoal?.name || savedGoal.originalName,
          calories: `${savedGoalCalories} kcal/day`,
          img: savedGoal.img || defaultGoal?.img || normalizedDefaults[0].img,
          route: defaultGoal?.route || "/nutrition",
          originalName: savedGoal.originalName,
          isActive: savedGoal.isActive ?? true,
          Breakfast: savedGoal.Breakfast || mealOptions.Breakfast[0].name,
          Lunch: savedGoal.Lunch || mealOptions.Lunch[0].name,
          Dinner: savedGoal.Dinner || mealOptions.Dinner[0].name,
          Snacks: savedGoal.Snacks || mealOptions.Snacks[0].name,
          mealLevels: savedGoal.mealLevels || {
            Breakfast: savedGoal.mealLevels?.Breakfast || 'Beginner',
            Lunch: savedGoal.mealLevels?.Lunch || 'Beginner',
            Dinner: savedGoal.mealLevels?.Dinner || 'Beginner',
            Snacks: savedGoal.mealLevels?.Snacks || 'Beginner',
          }
        };
      });

      const unsavedDefaults = normalizedDefaults.filter(d =>
        !savedGoals.some(s => s.originalName === d.name)
      );

      return [...displaySaved, ...unsavedDefaults];
    }

    return normalizedDefaults;
  };

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
        await deleteNutritionGoal(user.uid, currentlySaved.id);
        setSavedGoals(prev => prev.filter(g => g.id !== currentlySaved.id));
        Alert.alert("Removed", `"${currentlySaved.name}" removed from saved plans.`);
      } else {
        const planLevels = getPlanLevels(goal);
        const defaultPlan = planLevels.Beginner;

        const totalCalories = calculateTotalCalories(
          defaultPlan.Breakfast,
          defaultPlan.Lunch,
          defaultPlan.Dinner,
          defaultPlan.Snacks
        );

        const payload = {
          name: goal.name,
          calories: `${totalCalories} kcal/day`,
          img: goal.img,
          originalName: goalOriginalName,
          isActive: true,
          Breakfast: defaultPlan.Breakfast || mealOptions.Breakfast[0].name,
          Lunch: defaultPlan.Lunch || mealOptions.Lunch[0].name,
          Dinner: defaultPlan.Dinner || mealOptions.Dinner[0].name,
          Snacks: defaultPlan.Snacks || mealOptions.Snacks[0].name,
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
        Alert.alert("Saved!", `${payload.name} has been saved with ${totalCalories} kcal/day`);
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

                const totalCalories = calculateTotalCalories(
                  defaultPlan.Breakfast,
                  defaultPlan.Lunch,
                  defaultPlan.Dinner,
                  defaultPlan.Snacks
                );

                const payload = {
                  name: goal.name,
                  calories: `${totalCalories} kcal/day`,
                  img: goal.img,
                  originalName: goal.originalName,
                  isActive: true,
                  Breakfast: defaultPlan.Breakfast || mealOptions.Breakfast[0].name,
                  Lunch: defaultPlan.Lunch || mealOptions.Lunch[0].name,
                  Dinner: defaultPlan.Dinner || mealOptions.Dinner[0].name,
                  Snacks: defaultPlan.Snacks || mealOptions.Snacks[0].name,
                  mealLevels: {
                    Breakfast: 'Beginner',
                    Lunch: 'Beginner',
                    Dinner: 'Beginner',
                    Snacks: 'Beginner',
                  },
                };

                await saveNutritionGoal(user.uid, payload);
                await fetchUserSavedGoals(user.uid);
                
                const updatedGoals = await getNutritionGoals(user.uid);
                const newlySaved = updatedGoals.find(g => g.originalName === goal.originalName);
                
                if (newlySaved) {
                  const totalCal = calculateTotalCalories(
                    newlySaved.Breakfast,
                    newlySaved.Lunch,
                    newlySaved.Dinner,
                    newlySaved.Snacks
                  );
                  setEditGoal({
                    ...newlySaved,
                    mealOptions: mealOptions
                  });
                  setTotalCalories(totalCal);
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

    const totalCal = calculateTotalCalories(
      goal.Breakfast,
      goal.Lunch,
      goal.Dinner,
      goal.Snacks
    );

    setEditGoal({
      id: goal.id,
      name: goal.name,
      calories: goal.calories,
      originalName: goal.originalName,
      Breakfast: goal.Breakfast || mealOptions.Breakfast[0].name,
      Lunch: goal.Lunch || mealOptions.Lunch[0].name,
      Dinner: goal.Dinner || mealOptions.Dinner[0].name,
      Snacks: goal.Snacks || mealOptions.Snacks[0].name,
      mealOptions: mealOptions,
      mealLevels: goal.mealLevels || {
        Breakfast: 'Beginner',
        Lunch: 'Beginner',
        Dinner: 'Beginner',
        Snacks: 'Beginner',
      }
    });
    setTotalCalories(totalCal);
    setEditModalVisible(true);
  };

const handleSaveEdit = async () => {
  if (!editGoal) {
    Alert.alert("Error", "Nothing to save.");
    return;
  }

  setSaving(true);
  try {
    const updatedData = {
      name: editGoal.name || "",
      calories: `${totalCalories} kcal/day`,
      originalName: editGoal.originalName || editGoal.name || "",
      Breakfast: editGoal.Breakfast || mealOptions.Breakfast[0].name,
      Lunch: editGoal.Lunch || mealOptions.Lunch[0].name,
      Dinner: editGoal.Dinner || mealOptions.Dinner[0].name,
      Snacks: editGoal.Snacks || mealOptions.Snacks[0].name,
      mealLevels: editGoal.mealLevels || {
        Breakfast: 'Beginner',
        Lunch: 'Beginner', 
        Dinner: 'Beginner',
        Snacks: 'Beginner',
      },
      isActive: true,
      updatedAt: new Date()
    };


    if (editGoal.img) {
      updatedData.img = editGoal.img;
    }

    console.log("🔄 Saving data to Firebase:", updatedData);

    if (editGoal.id && savedGoals.some(s => s.id === editGoal.id)) {
      console.log("📝 Updating existing goal:", editGoal.id);
      await updateNutritionGoal(user.uid, editGoal.id, updatedData);
    } else {
      console.log("💾 Saving new goal");
      await saveNutritionGoal(user.uid, updatedData);
    }


    await fetchUserSavedGoals(user.uid);
    

    setEditModalVisible(false);
    setEditGoal(null);
    setSelectedMealType(null);
    setTotalCalories(0);
    
    Alert.alert("Success", `"${updatedData.name}" has been updated successfully!\nTotal Calories: ${totalCalories} kcal`);
    
  } catch (error) {
    console.error("❌ Edit error:", error);
    Alert.alert("Error", "Could not update plan. Please try again.");
  } finally {
    setSaving(false);
  }
};


 const handleMealChange = (mealType, meal) => {
  if (!editGoal) {
    console.log("❌ No editGoal available");
    return;
  }

  console.log(`🔄 Changing ${mealType} from:`, editGoal[mealType]);
  console.log(`🔄 Changing ${mealType} to:`, meal.name);
  
  const updatedGoal = {
    ...editGoal,
    [mealType]: meal.name
  };

  console.log("✅ Updated goal state:", updatedGoal);

  const newTotalCalories = calculateTotalCalories(
    updatedGoal.Breakfast,
    updatedGoal.Lunch,
    updatedGoal.Dinner,
    updatedGoal.Snacks
  );

  setEditGoal(updatedGoal);
  setTotalCalories(newTotalCalories);
  setSelectedMealType(null);
};

  const openMealSelection = (mealType) => {
    setSelectedMealType(mealType);
  };


  useEffect(() => {
    console.log("🔄 savedGoals updated:", savedGoals.length);
    savedGoals.forEach((goal, index) => {
      console.log(`Goal ${index + 1}:`, {
        name: goal.name,
        Breakfast: goal.Breakfast,
        Lunch: goal.Lunch,
        Dinner: goal.Dinner,
        Snacks: goal.Snacks
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
                    <NutritionItem 
                      key={i} 
                      img={goal.img} 
                      name={goal.name} 
                      desc={getDefaultPlanCalories(goal)}
                      onPress={() => router.push(goal.route)} 
                    />
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

                  {savedGoals.map((goal) => {
                    const goalTotalCalories = calculateTotalCalories(
                      goal.Breakfast,
                      goal.Lunch,
                      goal.Dinner,
                      goal.Snacks
                    );

                    return (
                      <View key={goal.id} style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                        <View style={styles.summaryHeader}>
                          <Text style={[styles.summaryGoal, { color: colors.text }]}>{goal.name}</Text>
                          <Text style={[styles.totalCaloriesBadge, { backgroundColor: colors.primary }]}>
                            {goalTotalCalories} kcal
                          </Text>
                        </View>
                        <Text style={[styles.summaryCalories, { color: colors.textSecondary }]}>{goal.calories}</Text>

                        {/* Shfaq ushqimet aktuale për çdo vakt */}
                        <View style={styles.mealsContainer}>
                          {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealType) => {
                            const mealCalories = findMealCalories(goal[mealType], mealType);
                            return (
                              <View key={mealType} style={styles.mealRow}>
                                <View style={styles.mealLabelContainer}>
                                  <Text style={[styles.mealLabel, { color: colors.text }]}>{mealType}:</Text>
                                  <Text style={[styles.mealCalories, { color: colors.primary }]}>
                                    {mealCalories} kcal
                                  </Text>
                                </View>
                                <Text style={[styles.mealValue, { color: colors.textSecondary }]}>
                                  {goal[mealType] || "Not set"}
                                </Text>
                              </View>
                            );
                          })}
                        </View>

                        <TouchableOpacity
                          style={[styles.manageButton, { borderColor: colors.primary, marginTop: 12 }]}
                          onPress={() => handleEditPlan(goal)}
                        >
                          <Text style={[styles.manageButtonText, { color: colors.primary }]}>Edit Meals</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Modal kryesore për editimin e ushqimeve */}
        <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => { setEditModalVisible(false); setSelectedMealType(null); }}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                Edit Your Plan: {editGoal?.name}
              </Text>

              {/* Shfaq totalin e kalorive */}
              <View style={[styles.totalCaloriesContainer, { backgroundColor: colors.primary }]}>
                <Text style={styles.totalCaloriesText}>Total Daily Calories</Text>
                <Text style={styles.totalCaloriesNumber}>{totalCalories} kcal</Text>
              </View>

              <ScrollView style={{ maxHeight: '60%' }} showsVerticalScrollIndicator={false}>
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealType) => {
                  const mealCalories = findMealCalories(editGoal?.[mealType], mealType);
                  return (
                    <View key={mealType} style={{ marginBottom: 20 }}>
                      <View style={styles.mealHeaderRow}>
                        <Text style={[styles.mealHeader, { color: colors.primary }]}>{mealType}</Text>
                        <Text style={[styles.mealCaloriesBadge, { backgroundColor: colors.primary }]}>
                          {mealCalories} kcal
                        </Text>
                      </View>

                      {/* Shfaq ushqimin aktual */}
                      <View style={[styles.selectedMealContainer, { backgroundColor: colors.background }]}>
                        <Text style={[styles.selectedMealText, { color: colors.text }]}>
                          {editGoal?.[mealType] || "No meal selected"}
                        </Text>
                      </View>

                      {/* Butoni për të zgjedhur ushqim */}
                      <TouchableOpacity
                        style={[styles.selectMealButton, { backgroundColor: colors.primary }]}
                        onPress={() => openMealSelection(mealType)}
                      >
                        <Text style={styles.selectMealButtonText}>Choose {mealType}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
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
                  onPress={() => { setEditModalVisible(false); setEditGoal(null); setSelectedMealType(null); setTotalCalories(0); }}
                  disabled={saving}
                >
                  <Text style={[styles.modalButtonText, { color: colors.primary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal për zgjedhjen e ushqimit */}
        <Modal visible={!!selectedMealType} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.mealSelectionModal, { backgroundColor: colors.card }]}>
              <Text style={[styles.mealSelectionTitle, { color: colors.primary }]}>
                Select {selectedMealType}
              </Text>
              
              <ScrollView style={{ maxHeight: '70%' }} showsVerticalScrollIndicator={false}>
                {editGoal?.mealOptions?.[selectedMealType]?.map((meal, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.mealOption,
                      { 
                        backgroundColor: colors.background,
                        borderColor: editGoal?.[selectedMealType] === meal.name ? colors.primary : 'transparent'
                      }
                    ]}
                    onPress={() => handleMealChange(selectedMealType, meal)}
                  >
                    <View style={styles.mealOptionContent}>
                      <Text style={[
                        styles.mealOptionText,
                        { color: colors.text }
                      ]}>
                        {meal.name}
                      </Text>
                      <Text style={[styles.mealOptionCalories, { color: colors.primary }]}>
                        {meal.calories} kcal
                      </Text>
                    </View>
                    {editGoal?.[selectedMealType] === meal.name && (
                      <Text style={[styles.selectedIndicator, { color: colors.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.closeSelectionButton, { backgroundColor: colors.primary }]}
                onPress={() => setSelectedMealType(null)}
              >
                <Text style={styles.closeSelectionButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <List onNavigate={(p) => router.push(p)} />
      </LinearGradient>
    </SafeAreaView>
  );
};


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
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  summaryGoal: { fontSize: 16, fontWeight: "700" },
  summaryCalories: { fontSize: 14, marginBottom: 10 },
  totalCaloriesBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  mealsContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  mealRow: {
    marginBottom: 10,
    paddingVertical: 4,
  },
  mealLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  mealCalories: {
    fontSize: 12,
    fontWeight: '600',
  },
  mealValue: {
    fontSize: 14,
    lineHeight: 18,
  },
  manageButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, alignSelf: 'flex-start' },
  manageButtonText: { fontWeight: "700", fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", maxHeight: "80%", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: 'center' },
  totalCaloriesContainer: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  totalCaloriesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  totalCaloriesNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  mealHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  mealCaloriesBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
selectedMealContainer: {
  padding: 12,
  borderRadius: 8,
  marginBottom: 10,
  borderWidth: 2, 
  borderColor: '#4CAF50', 
  backgroundColor: '#f9f9f9',
  minHeight: 50,
  justifyContent: 'center', 
  },
  selectedMealText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectMealButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectMealButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalButtonsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  modalButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, alignItems: "center", flex: 1, marginHorizontal: 5 },
  modalSaveButton: { backgroundColor: '#4CAF50' },
  modalCancelButton: { backgroundColor: '#f0f0f0' },
  modalButtonText: { color: "#fff", fontWeight: "700" },
  

  mealSelectionModal: { 
    width: "90%", 
    maxHeight: "80%", 
    borderRadius: 16, 
    padding: 20 
  },
  mealSelectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  mealOption: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealOptionContent: {
    flex: 1,
  },
  mealOptionText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  mealOptionCalories: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectedIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  closeSelectionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeSelectionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default Nutrition;