import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const List = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Home */}
      <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/")}>
        <Image source={require("../assets/home.png")} style={styles.icon} />
        <Text style={styles.label}>Home</Text>
      </TouchableOpacity>

      {/* Workouts */}
      <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/workouts")}>
        <Image source={require("../assets/dumbbell-horizontal.png")} style={styles.icon} />
        <Text style={styles.label}>Workouts</Text>
      </TouchableOpacity>

      {/* Nutrition */}
      <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/nutrition")}>
        <Image source={require("../assets/salad.png")} style={styles.icon} />
        <Text style={styles.label}>Nutrition</Text>
      </TouchableOpacity>
        {/* BMI */}
      <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/bmi")}>
        <Image source={require("../assets/bmi.png")} style={styles.icon} />
        <Text style={styles.label}>BMI</Text>
      </TouchableOpacity>
      {/* Profile */}
      <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/profile")}>
        <Image source={require("../assets/user.png")} style={styles.icon} />
        <Text style={styles.label}>Profile</Text>
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
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderTopColor: "#00ff88",
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
    tintColor: "#00ff88",
  },
  label: {
    color: "#bfffd6",
    fontSize: 12,
    marginTop: 4,
  },
});
