import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import WorkoutCard from "../components/WorkoutCard";
import List from "../components/list";

const workouts = [
  {
    id: "1",
    title: "Chest",
    duration: "45 min",
    functionality: "Build upper body strength with presses, flies, and push variations.",
    image: require("../assets/images/workout1.jpg"),
    routine: [
      "Bench Press - 4x10",
      "Incline Dumbbell Press - 3x12",
      "Chest Fly - 3x15",
      "Push-Ups - 3x20",
    ],
  },
  {
    id: "2",
    title: "Back",
    duration: "40 min",
    functionality: "Enhance posture and pulling strength with rows and pull-ups.",
    image: require("../assets/images/workout2.jpg"),
    routine: [
      "Pull-Ups - 3x10",
      "Barbell Row - 4x10",
      "Lat Pulldown - 3x12",
      "Seated Cable Row - 3x15",
    ],
  },
  {
    id: "3",
    title: "Biceps",
    duration: "30 min",
    functionality: "Tone and grow your arms with curls and isolation movements.",
    image: require("../assets/images/workout3.webp"),
    routine: [
      "Barbell Curl - 4x10",
      "Dumbbell Curl - 3x12",
      "Hammer Curl - 3x12",
      "Preacher Curl - 3x10",
    ],
  },
  {
    id: "4",
    title: "Triceps",
    duration: "30 min",
    functionality: "Strengthen your arms with dips, extensions, and close-grip presses.",
    image: require("../assets/images/workout4.webp"),
    routine: [
      "Tricep Dips - 3x10",
      "Overhead Extension - 3x12",
      "Close-Grip Bench Press - 3x10",
      "Tricep Pushdown - 3x12",
    ],
  },
  {
    id: "5",
    title: "Legs",
    duration: "50 min",
    functionality: "Develop explosive power with squats, lunges, and leg presses.",
    image: require("../assets/images/workout5.webp"),
    routine: [
      "Barbell Squat - 4x10",
      "Lunges - 3x12 per leg",
      "Leg Press - 4x10",
      "Calf Raises - 3x20",
    ],
  },
  {
    id: "6",
    title: "Shoulders",
    duration: "35 min",
    functionality: "Build broad and stable shoulders with raises and presses.",
    image: require("../assets/images/workout6.webp"),
    routine: [
      "Overhead Press - 4x10",
      "Lateral Raise - 3x12",
      "Front Raise - 3x12",
      "Rear Delt Fly - 3x15",
    ],
  },
];

const Workouts = () => {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
            <View style={{ marginBottom: 45 }}>
              <WorkoutCard
                title={item.title}
                duration={item.duration}
                functionality={item.functionality}
                image={item.image}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={() => toggleExpand(item.id)}
              >
                <Text style={styles.buttonText}>
                  {expandedId === item.id ? "Hide Workout" : "See Workout"}
                </Text>
              </TouchableOpacity>

              {expandedId === item.id && (
                <View style={styles.routineContainer}>
                  <Text style={styles.routineTitle}>Workout Routine</Text>
                  {item.routine.map((exercise, index) => (
                    <Text key={index} style={styles.routineText}>
                      • {exercise}
                    </Text>
                  ))}
                </View>
              )}
            </View>
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
  button: {
    backgroundColor: "#00ff88",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: -12,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
  routineContainer: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  routineTitle: {
    color: "#00ff88",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 6,
  },
  routineText: {
    color: "#b7ffcc",
    fontSize: 14,
    marginVertical: 2,
    marginLeft: 4,
  },
});
