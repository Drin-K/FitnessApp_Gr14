import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const List = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme(); // Shtu isDark këtu

  return (
    <View style={[
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
      }
    ]}>
      {/* Home */}
      <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/")}>
        <Image 
          source={require("../assets/home.png")} 
          style={[
            styles.icon, 
            { tintColor: colors.primary }
          ]} 
        />
        <Text style={[
          styles.label, 
          { color: colors.textSecondary }
        ]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* Workouts */}
      <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/workouts")}>
        <Image 
          source={require("../assets/dumbbell-horizontal.png")} 
          style={[
            styles.icon, 
            { tintColor: colors.primary }
          ]} 
        />
        <Text style={[
          styles.label, 
          { color: colors.textSecondary }
        ]}>
          Workouts
        </Text>
      </TouchableOpacity>

      {/* Nutrition */}
      <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/nutrition")}>
        <Image 
          source={require("../assets/salad.png")} 
          style={[
            styles.icon, 
            { tintColor: colors.primary }
          ]} 
        />
        <Text style={[
          styles.label, 
          { color: colors.textSecondary }
        ]}>
          Nutrition
        </Text>
      </TouchableOpacity>

      {/* BMI */}
      <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/bmi")}>
        <Image 
          source={require("../assets/bmi.png")} 
          style={[
            styles.icon, 
            { tintColor: colors.primary }
          ]} 
        />
        <Text style={[
          styles.label, 
          { color: colors.textSecondary }
        ]}>
          BMI
        </Text>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/profile")}>
        <Image 
          source={require("../assets/user.png")} 
          style={[
            styles.icon, 
            { tintColor: colors.primary }
          ]} 
        />
        <Text style={[
          styles.label, 
          { color: colors.textSecondary }
        ]}>
          Profile
        </Text>
      </TouchableOpacity>
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
