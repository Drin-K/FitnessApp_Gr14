import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function WorkoutSession() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { title, duration, routine } = params;

  const minutes = parseInt(duration);
  const initialTime = minutes * 60;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [running, setRunning] = useState(true);

  // Split routine items
  const routineList = routine.split("|");

  const [completed, setCompleted] = useState(
    routineList.map(() => false)
  );

  // Circular progress animation
  const progress = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  // TIMER
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const toggleCheck = (index) => {
    const updated = [...completed];
    updated[index] = !updated[index];
    setCompleted(updated);
  };

  const allDone = completed.every((c) => c);

  return (
    <LinearGradient
      colors={["#001509", "#021f15", "#004422"]}
      style={styles.container}
    >
      <Text style={styles.title}>{title}</Text>

      <View style={styles.timerContainer}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Pause/Resume button */}
      <TouchableOpacity
        style={styles.pauseButton}
        onPress={() => setRunning(!running)}
      >
        <Text style={styles.pauseText}>{running ? "Pause" : "Resume"}</Text>
      </TouchableOpacity>

      {/* Exercise List */}
      <ScrollView style={styles.list}>
        {routineList.map((exercise, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.exercise,
              completed[index] && styles.exerciseDone,
            ]}
            onPress={() => toggleCheck(index)}
          >
            <Text style={styles.exerciseText}>
              {completed[index] ? "✔" : "○"} {exercise}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Completion Message */}
      {allDone && (
        <Text style={styles.complete}>Workout Completed!</Text>
      )}

      {/* Exit */}
      <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
        <Text style={styles.exitText}>End Session</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 65,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#00ff88",
    textAlign: "center",
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 20,
  },

  timerContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    borderColor: "#00ff88",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00ff88",
    shadowOpacity: 0.7,
    shadowRadius: 15,
  },

  timerText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ffffff",
  },

  pauseButton: {
    backgroundColor: "#00ff88",
    padding: 12,
    borderRadius: 10,
    alignSelf: "center",
    width: 160,
    marginBottom: 20,
  },

  pauseText: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: 18,
    color: "#002b1d",
  },

  list: {
    marginTop: 10,
  },

  exercise: {
    padding: 16,
    backgroundColor: "#012316",
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#006644",
    shadowColor: "#00ff88",
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  exerciseDone: {
    backgroundColor: "#044d2a",
    borderColor: "#00ff88",
    shadowOpacity: 0.3,
  },

  exerciseText: {
    color: "#baffdd",
    fontSize: 18,
    fontWeight: "700",
  },

  complete: {
    marginTop: 15,
    fontSize: 24,
    fontWeight: "900",
    color: "#00ff88",
    textAlign: "center",
  },

  exitButton: {
    backgroundColor: "#ff4444",
    padding: 14,
    borderRadius: 10,
    marginTop: 22,
  },

  exitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
});
