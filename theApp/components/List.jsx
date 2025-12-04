import { View, TouchableOpacity, Text, Image, StyleSheet, Animated } from "react-native";
import React, { useRef } from "react";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const List = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Reusable animation generator for each tab button
  const useButtonAnim = () => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.9,
        useNativeDriver: true,
        speed: 20,
        bounciness: 2,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }).start();
    };

    return { scale, onPressIn, onPressOut };
  };

  // Create animations for each tab
  const homeAnim = useButtonAnim();
  const workoutsAnim = useButtonAnim();
  const nutritionAnim = useButtonAnim();
  const bmiAnim = useButtonAnim();
  const profileAnim = useButtonAnim();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: isDark ? colors.surface : colors.border,
          borderTopWidth: isDark ? 0 : 1,
          elevation: 4,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
      ]}
    >
      {/* Home */}
      <AnimatedTouchable
        style={[styles.tabItem, { transform: [{ scale: homeAnim.scale }] }]}
        onPressIn={homeAnim.onPressIn}
        onPressOut={homeAnim.onPressOut}
        onPress={() => router.push("/")}
      >
        <Image
          source={require("../assets/home.png")}
          style={[styles.icon, { tintColor: colors.primary }]}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Home</Text>
      </AnimatedTouchable>

      {/* Workouts */}
      <AnimatedTouchable
        style={[styles.tabItem, { transform: [{ scale: workoutsAnim.scale }] }]}
        onPressIn={workoutsAnim.onPressIn}
        onPressOut={workoutsAnim.onPressOut}
        onPress={() => router.push("/workouts")}
      >
        <Image
          source={require("../assets/dumbbell-horizontal.png")}
          style={[styles.icon, { tintColor: colors.primary }]}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Workouts</Text>
      </AnimatedTouchable>

      {/* Nutrition */}
      <AnimatedTouchable
        style={[styles.tabItem, { transform: [{ scale: nutritionAnim.scale }] }]}
        onPressIn={nutritionAnim.onPressIn}
        onPressOut={nutritionAnim.onPressOut}
        onPress={() => router.push("/nutrition")}
      >
        <Image
          source={require("../assets/salad.png")}
          style={[styles.icon, { tintColor: colors.primary }]}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Nutrition</Text>
      </AnimatedTouchable>

      {/* BMI */}
      <AnimatedTouchable
        style={[styles.tabItem, { transform: [{ scale: bmiAnim.scale }] }]}
        onPressIn={bmiAnim.onPressIn}
        onPressOut={bmiAnim.onPressOut}
        onPress={() => router.push("/bmi")}
      >
        <Image
          source={require("../assets/bmi.png")}
          style={[styles.icon, { tintColor: colors.primary }]}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>BMI</Text>
      </AnimatedTouchable>

      {/* Profile */}
      <AnimatedTouchable
        style={[styles.tabItem, { transform: [{ scale: profileAnim.scale }] }]}
        onPressIn={profileAnim.onPressIn}
        onPressOut={profileAnim.onPressOut}
        onPress={() => router.push("/profile")}
      >
        <Image
          source={require("../assets/user.png")}
          style={[styles.icon, { tintColor: colors.primary }]}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Profile</Text>
      </AnimatedTouchable>
    </View>
  );
};

export default List;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  tabItem: {
    alignItems: "center",
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
