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

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  saveNutritionGoal,
  getNutritionGoals,
  deleteNutritionGoal,
  updateNutritionGoal,
  deleteAllNutritionGoals
} from "../services/nutritionsService";

const Nutrition = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedGoals, setSavedGoals] = useState([]);
  const [fetchingGoals, setFetchingGoals] = useState(false);

  // Modal for editing plan
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCalories, setEditCalories] = useState("");

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
    {
      img: { uri: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
      name: "Oatmeal",
      desc: "High in fiber & keeps you full."
    },
    {
      img: { uri: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
      name: "Grilled Chicken",
      desc: "Rich in protein and low in fat."
    },
    {
      img: { uri: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
      name: "Avocado",
      desc: "Healthy fats for energy."
    },
  ];

  // ✅ Fetch user's saved goals
  const fetchUserSavedGoals = async (userId) => {
    if (!userId) return;

    setFetchingGoals(true);
    try {
      const goals = await getNutritionGoals(userId);
      setSavedGoals(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      Alert.alert("Error", "Could not load your saved nutrition plans.");
    } finally {
      setFetchingGoals(false);
    }
  };

  // ✅ Get display goals - combines default goals with saved data
  const getDisplayGoals = () => {
    // If user has saved goals, prioritize showing them
    if (savedGoals.length > 0) {
      const displayGoals = savedGoals.map(savedGoal => {
        // Find the corresponding default goal for route and image
        const defaultGoal = dietGoals.find(defaultGoal => 
          defaultGoal.name === savedGoal.originalName || defaultGoal.name === savedGoal.name
        );
        
        return {
          id: savedGoal.id,
          name: savedGoal.name,
          calories: savedGoal.calories,
          img: savedGoal.img || defaultGoal?.img || dietGoals[0].img,
          route: defaultGoal?.route || "/nutrition",
          originalName: savedGoal.originalName || savedGoal.name,
          isActive: savedGoal.isActive
        };
      });

      // Also include any default goals that aren't saved yet
      const unsavedDefaultGoals = dietGoals.filter(defaultGoal => 
        !savedGoals.some(saved => saved.originalName === defaultGoal.name || saved.name === defaultGoal.name)
      ).map(goal => ({
        ...goal,
        originalName: goal.name
      }));

      return [...displayGoals, ...unsavedDefaultGoals];
    }
    
    // If no saved goals, use default goals
    return dietGoals.map(goal => ({
      ...goal,
      originalName: goal.name
    }));
  };

  // ✅ Check if goal is saved
  const isGoalSaved = (goalIdentifier) => {
    return savedGoals.some(goal => 
      goal.originalName === goalIdentifier || goal.name === goalIdentifier
    );
  };

  // ✅ Toggle save/unsave goal
  const handleGoalToggle = async (goal) => {
    if (!user) {
      Alert.alert("Login Required", "Please create an account to save nutrition plans.");
      return;
    }

    const isCurrentlySaved = isGoalSaved(goal.originalName || goal.name);

    try {
      if (isCurrentlySaved) {
        // UNSAVE - Find the actual goal and delete it
        const savedGoal = savedGoals.find(saved => 
          saved.originalName === (goal.originalName || goal.name) || saved.name === goal.name
        );
        
        if (savedGoal) {
          await deleteNutritionGoal(user.uid, savedGoal.id);
          await fetchUserSavedGoals(user.uid);
          Alert.alert("Removed", `"${savedGoal.name}" removed from saved plans.`);
        }
      } else {
        // SAVE - Save as active goal
        const savedGoal = await saveNutritionGoal(user.uid, {
          name: goal.name,
          calories: goal.calories,
          img: goal.img,
          originalName: goal.originalName || goal.name,
          isActive: true
        });
        
        await fetchUserSavedGoals(user.uid);
        Alert.alert("Saved!", `${goal.name} has been saved to your plans ✅`);
      }
    } catch (error) {
      console.error("Error toggling goal:", error);
      Alert.alert("Error", "Could not update nutrition plan.");
    }
  };

  // ✅ Handle edit plan
  const handleEditPlan = (goal) => {
    setEditGoal(goal);
    setEditName(goal.name);
    setEditCalories(goal.calories);
    setEditModalVisible(true);
  };

  // ✅ Handle save edit
  const handleSaveEdit = async () => {
    if (!editName.trim() || !editCalories.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await updateNutritionGoal(user.uid, editGoal.id, {
        name: editName,
        calories: editCalories,
        originalName: editGoal.originalName || editGoal.name
      });

      await fetchUserSavedGoals(user.uid);
      setEditModalVisible(false);
      Alert.alert("Updated", `"${editName}" has been updated ✅`);
    } catch (error) {
      console.error("Error updating plan:", error);
      Alert.alert("Error", "Could not update plan.");
    }
  };

  // ✅ Handle delete plan
  const handleDeletePlan = (goalId, goalName) => {
    Alert.alert(
      "Delete Plan",
      `Are you sure you want to delete "${goalName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNutritionGoal(user.uid, goalId);
              await fetchUserSavedGoals(user.uid);
              Alert.alert("Deleted", `"${goalName}" has been removed from your profile.`);
            } catch (error) {
              console.error("Error deleting plan:", error);
              Alert.alert("Error", "Could not delete plan.");
            }
          }
        }
      ]
    );
  };

  // ✅ Handle delete all plans
  const handleDeleteAllPlans = () => {
    if (savedGoals.length === 0) {
      Alert.alert("No Plans", "You don't have any saved plans to delete.");
      return;
    }

    Alert.alert(
      "Delete All Plans",
      `Are you sure you want to delete all ${savedGoals.length} saved plans? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllNutritionGoals(user.uid);
              setSavedGoals([]);
              Alert.alert("Success", "All nutrition plans have been deleted.");
            } catch (error) {
              console.error("Error deleting all plans:", error);
              Alert.alert("Error", "Could not delete all plans.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
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
            setUser({
              uid: firebaseUser.uid,
              fullName: firebaseUser.displayName || "User",
              email: firebaseUser.email,
            });
          }
          await fetchUserSavedGoals(firebaseUser.uid);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUser({
            uid: firebaseUser.uid,
            fullName: "User",
            email: firebaseUser.email,
          });
        }
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

  const tipsGradientColors = isDarkMode
    ? ["#002b1a", "#001a10"]
    : ["#e8f5e8", "#d0ebd0"];

  const nutritionTips = [
    "Stay hydrated — drink 2-3L water daily.",
    "Eat every 3–4 hours to maintain energy.",
    "Include fruits & veggies in each meal.",
    "Avoid sugary drinks and processed foods.",
  ];

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
              {/* PUBLIC VIEW */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  Select Your Goal
                </Text>
                <View style={styles.cardRow}>
                  {dietGoals.map((goal, i) => (
                    <NutritionItem key={i} img={goal.img} name={goal.name} onPress={() => router.push(goal.route)} />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  Recommended Foods
                </Text>
                <View style={styles.cardRow}>
                  {recommendedFoods.map((food, i) => (
                    <NutritionItem key={i} img={food.img} name={food.name} desc={food.desc} />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  Nutrition Tips
                </Text>
                <LinearGradient colors={tipsGradientColors} style={[styles.tips, { borderColor: colors.primary }]}>
                  {nutritionTips.map((tip, i) => (
                    <Text key={i} style={[styles.tip, { color: colors.textSecondary }]}>
                      • {tip}
                    </Text>
                  ))}
                </LinearGradient>
              </View>

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
              {/* LOGGED-IN USER VIEW */}
              <View style={styles.welcomeSection}>
                <Text style={[styles.welcomeText, { color: colors.primary }]}>
                  Welcome back, {user.fullName}! 🎉
                </Text>
                <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
                  {savedGoals.length > 0 
                    ? `You have ${savedGoals.length} saved plan${savedGoals.length !== 1 ? 's' : ''}`
                    : "Choose a nutrition plan to get started!"
                  }
                </Text>
                {fetchingGoals && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                      Loading your plans...
                    </Text>
                  </View>
                )}
              </View>

              {/* Nutrition Goals with Simple Save/Unsave */}
              <View style={styles.verticalContainer}>
                {displayGoals.map((goal, i) => {
                  const goalIdentifier = goal.originalName || goal.name;
                  const isSaved = isGoalSaved(goalIdentifier);
                  
                  return (
                    <View key={goal.id || i} style={styles.bannerCardWrapper}>
                      {/* Save/Unsave Toggle Button */}
                      <TouchableOpacity
                        style={[
                          styles.cardSaveButton,
                          { 
                            backgroundColor: isSaved ? '#ff4444' : colors.primary,
                          }
                        ]}
                        onPress={() => handleGoalToggle(goal)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.saveIcon}>
                          {isSaved ? "✕" : "★"}
                        </Text>
                      </TouchableOpacity>

                      {/* Goal Card */}
                      <TouchableOpacity
                        style={styles.bannerCard}
                        onPress={() => router.push(goal.route)}
                        activeOpacity={0.90}
                      >
                        <Image source={goal.img} style={styles.bannerImage} />
                        <View style={styles.overlay} />
                        <View style={styles.bannerTextBlock}>
                          <Text style={[styles.bannerTitle, { color: "#fff" }]}>
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
                  <View style={styles.summaryHeaderRow}>
                    <Text style={[styles.summaryTitle, { color: colors.primary }]}>
                      Your Saved Plans ({savedGoals.length})
                    </Text>
                    <TouchableOpacity onPress={handleDeleteAllPlans}>
                      <Text style={[styles.deleteAllText, { color: '#ff4444' }]}>
                        Delete All
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {savedGoals.map((goal, index) => (
                    <View key={goal.id} style={[
                      styles.summaryCard, 
                      { backgroundColor: colors.card }
                    ]}>
                      <View style={styles.summaryHeader}>
                        <Text style={[styles.summaryGoal, { color: colors.text }]}>
                          {goal.name}
                        </Text>
                      </View>
                      <Text style={[styles.summaryCalories, { color: colors.textSecondary }]}>
                        {goal.calories}
                      </Text>
                      <View style={styles.summaryButtonRow}>
                        <TouchableOpacity
                          style={[styles.manageButton, { borderColor: colors.primary, marginRight: 8 }]}
                          onPress={() => handleEditPlan(goal)}
                        >
                          <Text style={[styles.manageButtonText, { color: colors.primary }]}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.manageButton, { borderColor: "red" }]}
                          onPress={() => handleDeletePlan(goal.id, goal.name)}
                        >
                          <Text style={[styles.manageButtonText, { color: "red" }]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Delete All Button */}
              {savedGoals.length > 0 && (
                <TouchableOpacity
                  style={[styles.deleteAllButton, { backgroundColor: '#ff4444' }]}
                  onPress={handleDeleteAllPlans}
                >
                  <Text style={styles.deleteAllButtonText}>
                    Delete All Plans ({savedGoals.length})
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Edit Modal */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                Edit Nutrition Plan
              </Text>
              
              <Text style={[styles.modalLabel, { color: colors.text }]}>Plan Name</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: colors.primary, color: colors.text }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter plan name"
                placeholderTextColor={colors.textSecondary}
              />
              
              <Text style={[styles.modalLabel, { color: colors.text }]}>Calories</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: colors.primary, color: colors.text }]}
                value={editCalories}
                onChangeText={setEditCalories}
                placeholder="Enter calories"
                placeholderTextColor={colors.textSecondary}
              />
              
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: colors.primary }]} 
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.modalButtonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalCancelButton]} 
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
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
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12, textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 },
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  tips: { borderRadius: 14, padding: 16, borderWidth: 1 },
  tip: { fontSize: 13, marginBottom: 6, lineHeight: 20 },
  authPrompt: { alignItems: "center", marginTop: 20, padding: 20, borderRadius: 16, backgroundColor: "rgba(76, 175, 80, 0.1)" },
  authText: { textAlign: "center", fontSize: 16, marginBottom: 16, lineHeight: 22 },
  authButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  authButtonText: { color: "#fff", fontWeight: "700" },
  welcomeSection: { marginBottom: 20, alignItems: "center" },
  welcomeText: { fontSize: 22, fontWeight: "700" },
  welcomeSubtext: { fontSize: 14, marginTop: 4 },
  loadingContainer: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  loadingText: { marginLeft: 6, fontSize: 12 },
  verticalContainer: { marginBottom: 20 },
  bannerCardWrapper: { marginBottom: 20, position: 'relative' },
  bannerCard: { borderRadius: 14, overflow: "hidden", position: "relative", height: 150 },
  bannerImage: { width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  bannerTextBlock: { position: "absolute", left: 12, bottom: 12, right: 12 },
  bannerTitle: { fontSize: 18, fontWeight: "700" },
  bannerCalories: { fontSize: 13, fontWeight: "500", color: "#fff" },
  savedText: { fontSize: 12, color: "#fff", marginTop: 4 },
  cardSaveButton: { position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  saveIcon: { fontSize: 16, color: "#fff", fontWeight: "700" },
  summarySection: { marginTop: 20 },
  summaryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryTitle: { fontSize: 18, fontWeight: "700" },
  deleteAllText: { fontSize: 14, fontWeight: '600' },
  summaryCard: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  summaryHeader: { marginBottom: 8 },
  summaryGoal: { fontSize: 16, fontWeight: "700" },
  summaryCalories: { fontSize: 14, marginBottom: 10 },
  summaryButtonRow: { flexDirection: "row", justifyContent: "center", marginTop: 12 },
  manageButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  manageButtonText: { fontWeight: "700", fontSize: 12 },
  deleteAllButton: { padding: 15, borderRadius: 12, alignItems: "center", marginVertical: 5 },
  deleteAllButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, marginBottom: 16 },
  modalButtonsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  modalButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, alignItems: "center", flex: 1, marginHorizontal: 5 },
  modalSaveButton: { backgroundColor: '#4CAF50' },
  modalCancelButton: { backgroundColor: '#f0f0f0' },
  modalButtonText: { color: "#fff", fontWeight: "700" }
});