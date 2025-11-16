import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Animated, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";


export const mealPlansWeightLoss = {
  Beginner: {
    Breakfast: "2 boiled eggs, 1 slice whole grain toast, 1/2 avocado, green tea",
    Lunch: "Grilled chicken salad (150g chicken, mixed greens, tomatoes, cucumber, olive oil dressing)",
    Dinner: "Baked salmon (150g), steamed broccoli, quinoa (1/2 cup)",
    Snacks: "Greek yogurt (150g), apple, handful of almonds",
    tips: [
      "Drink plenty of water throughout the day",
      "Avoid sugary drinks and processed foods",
      "Include protein in every meal to stay full longer"
    ]
  },
  Intermediate: {
    Breakfast: "3 egg whites + 1 whole egg omelette with spinach and mushrooms, 1 slice whole grain toast",
    Lunch: "Turkey wrap (120g turkey, whole wheat tortilla, lettuce, tomato, mustard)",
    Dinner: "Grilled white fish (200g), roasted vegetables, small sweet potato",
    Snacks: "Protein shake, pear, carrot sticks with hummus",
    tips: [
      "Practice portion control",
      "Track your calorie intake",
      "Include healthy fats like avocado and nuts"
    ]
  },
  Advanced: {
    Breakfast: "Protein smoothie (scoop of protein powder, 1/2 banana, spinach, almond milk)",
    Lunch: "Quinoa bowl with grilled chicken (150g), mixed vegetables, tahini dressing",
    Dinner: "Lean steak (150g), asparagus, cauliflower rice",
    Snacks: "Cottage cheese, berries, celery with peanut butter",
    tips: [
      "Intermittent fasting 16:8",
      "High protein, low carb approach",
      "Meal prep for the week"
    ]
  }
};

const WeightLoss = () => {
  const [selectedPlan, setSelectedPlan] = useState("Beginner");
  const [activeTab, setActiveTab] = useState("meals");
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 5000);

    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    return () => clearTimeout(timer);
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    scaleAnim.setValue(0.9);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const currentPlan = mealPlansWeightLoss[selectedPlan];

  // Gradient colors based on theme
  const gradientColors = isDarkMode 
    ? [colors.background, "#001a10", colors.background]
    : ["#ffffff", "#f0fff8", "#ffffff"];

  return (
    <LinearGradient colors={gradientColors} style={styles.bg}>
      <TouchableOpacity 
        style={[
          styles.backButton, 
          { backgroundColor: isDarkMode ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 128, 0, 0.1)' }
        ]} 
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={[styles.title, { color: colors.primary }]}>Weight Loss Journey</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Transform your body with our customized meal plans
          </Text>
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Choose Your Level</Text>
        <View style={styles.buttonContainer}>
          {Object.keys(mealPlansWeightLoss).map((plan) => (
            <TouchableOpacity
              key={plan}
              style={[
                styles.planButton,
                { 
                  backgroundColor: isDarkMode ? "#1a1a1a" : "#f0f0f0",
                  borderColor: colors.primary 
                },
                selectedPlan === plan && [
                  styles.planButtonActive, 
                  { backgroundColor: colors.primary }
                ],
              ]}
              onPress={() => handleSelectPlan(plan)}
            >
              <Text
                style={[
                  styles.planButtonText,
                  { color: colors.primary },
                  selectedPlan === plan && [
                    styles.planButtonTextActive,
                    { color: isDarkMode ? "#000" : "#fff" }
                  ],
                ]}
              >
                {plan}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[
          styles.tabContainer, 
          { backgroundColor: isDarkMode ? "#1a1a1a" : "#f0f0f0" }
        ]}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === "meals" && [
                styles.tabActive,
                { backgroundColor: colors.primary }
              ]
            ]}
            onPress={() => setActiveTab("meals")}
          >
            <Ionicons 
              name="restaurant" 
              size={20} 
              color={activeTab === "meals" ? (isDarkMode ? "#000" : "#fff") : colors.primary} 
            />
            <Text style={[
              styles.tabText, 
              { color: activeTab === "meals" ? (isDarkMode ? "#000" : "#fff") : colors.primary },
              activeTab === "meals" && styles.tabTextActive
            ]}>
              Daily Meals
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === "tips" && [
                styles.tabActive,
                { backgroundColor: colors.primary }
              ]
            ]}
            onPress={() => setActiveTab("tips")}
          >
            <Ionicons 
              name="bulb" 
              size={20} 
              color={activeTab === "tips" ? (isDarkMode ? "#000" : "#fff") : colors.primary} 
            />
            <Text style={[
              styles.tabText, 
              { color: activeTab === "tips" ? (isDarkMode ? "#000" : "#fff") : colors.primary },
              activeTab === "tips" && styles.tabTextActive
            ]}>
              Pro Tips
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "meals" ? (
          <View style={[
            styles.mealsContainer, 
            { 
              backgroundColor: isDarkMode ? "#1a1a1a" : "#f8f8f8",
              borderColor: colors.primary 
            }
          ]}>
            <Text style={[styles.tipsTitle, { color: colors.primary }]}>Your Daily Nutrition</Text>
            {Object.entries(currentPlan).map(([key, value]) => {
              if (['Breakfast', 'Lunch', 'Dinner', 'Snacks'].includes(key)) {
                return (
                  <View key={key} style={[
                    styles.mealItem,
                    { 
                      backgroundColor: isDarkMode ? "#0a0a0a" : "#ffffff",
                      borderLeftColor: colors.primary 
                    }
                  ]}>
                    <View style={styles.mealHeader}>
                      <Text style={[styles.mealName, { color: colors.primary }]}>{key}</Text>
                      <Ionicons name="nutrition" size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.mealDescription, { color: colors.textSecondary }]}>{value}</Text>
                  </View>
                );
              }
            })}
          </View>
        ) : (
          <View style={[
            styles.tipsContainer, 
            { 
              backgroundColor: isDarkMode ? "#1a1a1a" : "#f8f8f8",
              borderColor: colors.primary 
            }
          ]}>
            <Text style={[styles.tipsTitle, { color: colors.primary }]}>💡 Expert Tips</Text>
            {currentPlan.tips.map((tip, index) => (
              <View key={index} style={[
                styles.tipItem,
                { backgroundColor: isDarkMode ? "#0a0a0a" : "#ffffff" }
              ]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[
          styles.motivationCard, 
          { 
            backgroundColor: isDarkMode ? "#1a1a1a" : "#f8f8f8",
            borderColor: colors.primary 
          }
        ]}>
          <Ionicons name="flame" size={32} color={colors.primary} />
          <Text style={[styles.motivationTitle, { color: colors.primary }]}>Stay Motivated!</Text>
          <Text style={[styles.motivationText, { color: colors.textSecondary }]}>
            Consistency is key. Track your progress weekly and celebrate small victories!
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
};

export default WeightLoss;

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60 },

  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
  },
  backText: {
    fontWeight: '600',
    marginLeft: 4,
  },

  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: { 
    fontSize: 32, 
    fontWeight: "900", 
    textAlign: "center", 
    marginBottom: 8,
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: "center", 
    opacity: 0.8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },

  buttonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 25,
    minHeight: 50, 
  },

  planButton: { 
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 25, 
    borderWidth: 1, 
    flex: 1,
    marginHorizontal: 4, 
    alignItems: 'center',
    justifyContent: 'center', 
    minWidth: 0, 
  },

  planButtonActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  planButtonText: { 
    fontWeight: "700", 
    fontSize: 12, 
    textAlign: 'center',
    flexShrink: 1,
  },
  planButtonTextActive: {
    fontWeight: "800",
    fontSize: 12, 
  },

  tabContainer: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontWeight: '700',
    marginLeft: 6,
  },
  tabTextActive: {
    fontWeight: '800',
  },

  mealsContainer: {
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1, 
    marginBottom: 20,
  },
  tipsContainer: {
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1, 
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 22, 
    fontWeight: "800", 
    marginBottom: 15,
    textAlign: 'center',
  },

  mealItem: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
  },
  mealDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  motivationCard: {
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 10,
  },
  motivationText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});