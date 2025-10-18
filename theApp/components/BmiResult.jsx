import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const BMIResult = () => {
  const { bmi } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const value = parseFloat(bmi);

  let status = "";
  let message = "";

  if (value < 18.5) {
    status = "UNDERWEIGHT";
    message = "You have a lower than normal body weight. Try to eat more.";
  } else if (value < 25) {
    status = "NORMAL";
    message = "You have a normal body weight. Good job!";
  } else if (value < 30) {
    status = "OVER WEIGHT";
    message = "You have a higher than normal body weight. Try to exercise more.";
  } else {
    status = "OBESE";
    message = "You have an obese body weight. Consult with a doctor.";
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <Text style={[styles.header, { color: colors.text }]}>Your Result</Text>

      <View style={[styles.resultBox, { backgroundColor: colors.card }]}>
        <Text style={[styles.status, { color: "green" }]}>{status}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{value.toFixed(1)}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Recalculate</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 30 },
  resultBox: {
    width: "100%",
    borderRadius: 15,
    alignItems: "center",
    padding: 30,
  },
  status: { fontSize: 18, marginBottom: 10, fontWeight: "600" },
  value: { fontSize: 60, fontWeight: "bold", marginVertical: 10 },
  message: { fontSize: 15, textAlign: "center", marginTop: 10 },
  button: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default BMIResult;
