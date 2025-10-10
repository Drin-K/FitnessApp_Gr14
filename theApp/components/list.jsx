import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const List = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={() => router.push("/")}>
        <Image source={require("../assets/home.png")} style={styles.icon} />
        <Text style={styles.label}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => router.push("/workouts")}>
        <Image source={require("../assets/dumbbell-horizontal.png")} style={styles.icon} />
        <Text style={styles.label}>Workouts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => router.push("/nutrition")}>
        <Image source={require("../assets/salad.png")} style={styles.icon} />
        <Text style={styles.label}>Nutrition</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => router.push("/profile")}>
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
    backgroundColor: "#001109",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#0f3020",
  },
  item: {
    alignItems: "center",
  },
  icon: {
    width: 26,
    height: 26,
    marginBottom: 4,
    tintColor: "#00ff88",
  },
  label: {
    color: "#d8ffd8",
    fontSize: 12,
    fontWeight: "600",
  },
});
