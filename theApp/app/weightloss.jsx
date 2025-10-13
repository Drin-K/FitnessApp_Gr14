import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Animated, Image, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const mealPlans = {
  Beginner: {
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
    description: "Perfect for those starting their weight loss journey",
    calories: "1500-1700 kcal/day",
    Breakfast: "Oatmeal with fruits and a cup of green tea",
    Lunch: "Grilled chicken salad with olive oil dressing",
    Dinner: "Baked salmon with steamed vegetables",
    Snacks: "Almonds or Greek yogurt",
    tips: ["Drink 2L water daily", "30min walk every day", "No sugary drinks"]
  },
  Intermediate: {
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    description: "For those with some experience in fitness",
    calories: "1400-1600 kcal/day",
    Breakfast: "Scrambled eggs with spinach and whole-grain toast",
    Lunch: "Quinoa salad with chickpeas and vegetables",
    Dinner: "Grilled turkey with roasted sweet potatoes",
    Snacks: "Fruit smoothie or protein bar",
    tips: ["Include strength training", "Track your macros", "Meal prep weekly"]
  },
  Advanced: {
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    description: "For experienced individuals seeking optimal results",
    calories: "1300-1500 kcal/day",
    Breakfast: "Protein pancakes with berries",
    Lunch: "Brown rice with grilled chicken and broccoli",
    Dinner: "Lean beef stir-fry with vegetables",
    Snacks: "Cottage cheese with nuts or hummus with carrots",
    tips: ["High protein intake", "Intermittent fasting", "Regular cardio"]
  },
};

const WeightLoss = () => {
  const [selectedPlan, setSelectedPlan] = useState("Beginner");
  const [activeTab, setActiveTab] = useState("meals");
  const router = useRouter();

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
    // Reset animation when plan changes
    scaleAnim.setValue(0.9);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const currentPlan = mealPlans[selectedPlan];

  return (
    <LinearGradient colors={["#0a0a0a", "#001a10", "#0a0a0a"]} style={styles.bg}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#00ff88" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.title}> Weight Loss Journey</Text>
          <Text style={styles.subtitle}>
            Transform your body with our customized meal plans
          </Text>
        </Animated.View>

        <Text style={styles.sectionTitle}>Choose Your Level</Text>
        <View style={styles.buttonContainer}>
          {Object.keys(mealPlans).map((plan) => (
            <TouchableOpacity
              key={plan}
              style={[
                styles.planButton,
                selectedPlan === plan && styles.planButtonActive,
              ]}
              onPress={() => handleSelectPlan(plan)}
            >
              <Text
                style={[
                  styles.planButtonText,
                  selectedPlan === plan && styles.planButtonTextActive,
                ]}
              >
                {plan}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View style={[styles.planCard, { transform: [{ scale: scaleAnim }] }]}>
          <Image 
            source={{ uri: currentPlan.image }} 
            style={styles.planImage}
            resizeMode="cover"
          />
          <View style={styles.planOverlay}>
            <Text style={styles.planLevel}>{selectedPlan} Plan</Text>
            <Text style={styles.planCalories}>{currentPlan.calories}</Text>
          </View>
        </Animated.View>


        <Text style={styles.planDescription}>{currentPlan.description}</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "meals" && styles.tabActive]}
            onPress={() => setActiveTab("meals")}
          >
            <Ionicons 
              name="restaurant" 
              size={20} 
              color={activeTab === "meals" ? "#000" : "#00ff88"} 
            />
            <Text style={[styles.tabText, activeTab === "meals" && styles.tabTextActive]}>
              Daily Meals
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === "tips" && styles.tabActive]}
            onPress={() => setActiveTab("tips")}
          >
            <Ionicons 
              name="bulb" 
              size={20} 
              color={activeTab === "tips" ? "#000" : "#00ff88"} 
            />
            <Text style={[styles.tabText, activeTab === "tips" && styles.tabTextActive]}>
              Pro Tips
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "meals" ? (
          <View style={styles.mealsContainer}>
            <Text style={styles.tipsTitle}>Your Daily Nutrition</Text>
            {Object.entries(currentPlan).map(([key, value]) => {
              if (['Breakfast', 'Lunch', 'Dinner', 'Snacks'].includes(key)) {
                return (
                  <View key={key} style={styles.mealItem}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealName}>{key}</Text>
                      <Ionicons name="nutrition" size={16} color="#00ff88" />
                    </View>
                    <Text style={styles.mealDescription}>{value}</Text>
                  </View>
                );
              }
            })}
          </View>
        ) : (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Expert Tips</Text>
            {currentPlan.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00ff88" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.motivationCard}>
          <Ionicons name="flame" size={32} color="#00ff88" />
          <Text style={styles.motivationTitle}>Stay Motivated!</Text>
          <Text style={styles.motivationText}>
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
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: 8,
    borderRadius: 20,
  },
  backText: {
    color: '#00ff88',
    fontWeight: '600',
    marginLeft: 4,
  },

  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: "#00ff88", 
    fontSize: 32, 
    fontWeight: "900", 
    textAlign: "center", 
    marginBottom: 8,
  },
  subtitle: {
    color: "#bfffd6", 
    fontSize: 16, 
    textAlign: "center", 
    opacity: 0.8,
  },

  sectionTitle: {
    color: '#00ff88',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },

  buttonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 25,
  },
  planButton: { 
    backgroundColor: "#1a1a1a", 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: "#00ff88", 
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  planButtonActive: {
    backgroundColor: "#00ff88",
    shadowColor: "#00ff88",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  planButtonText: { 
    color: "#00ff88", 
    fontWeight: "700", 
    fontSize: 14,
  },
  planButtonTextActive: {
    color: "#000",
    fontWeight: "800",
  },

  planCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
  },
  planImage: {
    width: '100%',
    height: '100%',
  },
  planOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
  },
  planLevel: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: '800',
  },
  planCalories: {
    color: '#bfffd6',
    fontSize: 14,
    fontWeight: '600',
  },
  planDescription: {
    color: '#bfffd6',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
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
    backgroundColor: '#00ff88',
  },
  tabText: {
    color: '#00ff88',
    fontWeight: '700',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '800',
  },

  mealsContainer: {
    backgroundColor: "#1a1a1a", 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: "#004d2b",
    marginBottom: 20,
  },
  tipsContainer: {
    backgroundColor: "#1a1a1a", 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: "#004d2b",
    marginBottom: 20,
  },
  tipsTitle: {
    color: "#00ff88", 
    fontSize: 22, 
    fontWeight: "800", 
    marginBottom: 15,
    textAlign: 'center',
  },

  mealItem: {
    backgroundColor: '#0a0a0a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00ff88',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  mealName: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '700',
  },
  mealDescription: {
    color: '#bfffd6',
    fontSize: 14,
    lineHeight: 20,
  },

  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  tipText: {
    color: '#bfffd6',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  motivationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  motivationTitle: {
    color: '#00ff88',
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 10,
  },
  motivationText: {
    color: '#bfffd6',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  swipeContainer: {
    position: "absolute",
    left: 20,
    top: "50%",
    transform: [{ translateY: -20 }],
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  swipeTipText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 14,
    marginLeft: 8,
  },
});