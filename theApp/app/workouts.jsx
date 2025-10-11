import React from "react";
import { View, Text, StyleSheet, FlatList, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import WorkoutCard from "../components/WorkoutCard";
import List from "../components/list";

const workouts = [
  {
    id: "1",
    title: "Full Body Blast",
    duration: "45 min",
    functionality: "Targets all major muscle groups with compound movements.",
    image: require("../assets/workout1.webp"),
  },
  {
    id: "2",
    title: "Core Crusher",
    duration: "30 min",
    functionality: "Strengthen your abs and improve core stability.",
    // image: require("../assets/workout2.jpg"),
  },
  {
    id: "3",
    title: "Cardio Burn",
    duration: "40 min",
    functionality: "High-intensity interval training for endurance.",
    // image: require("../assets/workout3.jpg"),
  },
  {
    id: "4",
    title: "Leg Power",
    duration: "50 min",
    functionality: "Build explosive strength in your lower body.",
    // image: require("../assets/workout4.jpg"),
  },
];

const Workouts = () => {
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      <View style={styles.content}>
        <Text style={styles.header}>Workouts</Text>
        <Text style={styles.subheader}>Choose a routine and start training!</Text>

        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkoutCard
              title={item.title}
              duration={item.duration}
              functionality={item.functionality}
              image={item.image}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      </View>
      <List onNavigate={(p) => router.push(p)} />
    </SafeAreaView>
  );
};

export default Workouts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    color: "#00ff88",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
    letterSpacing: 1,
  },
  subheader: {
    color: "#b7ffcc",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
});
