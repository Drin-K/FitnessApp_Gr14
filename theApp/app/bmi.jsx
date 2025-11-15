// BMI.js (updated validation + user messages + fixed delete import)
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import List from "../components/List";

import BmiResult from "../components/BmiResult";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { createBMI, readBMIs, deleteBMI } from "../services/BMIService"; // Added deleteBMI to import (adjust path if needed)

const WEIGHT_MIN = 20;
const WEIGHT_MAX = 200;
const AGE_MIN = 10;
const AGE_MAX = 100;

const BMI = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const [gender, setGender] = useState(null);
  const [height, setHeight] = useState(167);
  const [weight, setWeight] = useState("60");
  const [age, setAge] = useState("20");
  const [bmi, setBmi] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState([]); // New state for BMI history

  // Error states to show inline messages
  const [weightError, setWeightError] = useState("");
  const [ageError, setAgeError] = useState("");

  // sanitize and update weight (allow digits and one dot)
  const handleWeightChange = (text) => {
    // remove all characters except digits and dot
    let cleaned = text.replace(/[^0-9.]/g, "");
    // allow only one dot
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    setWeight(cleaned);
    if (weightError) setWeightError("");
  };

  // sanitize and update age (only digits, integer)
  const handleAgeChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setAge(cleaned);
    if (ageError) setAgeError("");
  };

  const validateInputs = (w, a) => {
    let valid = true;
    setWeightError("");
    setAgeError("");

    if (isNaN(w) || w < WEIGHT_MIN || w > WEIGHT_MAX) {
      setWeightError(`Pesha duhet të jetë midis ${WEIGHT_MIN} kg dhe ${WEIGHT_MAX} kg.`);
      valid = false;
    }
    // ensure age is integer and within range
    if (isNaN(a) || a < AGE_MIN || a > AGE_MAX || !Number.isInteger(a)) {
      setAgeError(`Mosha duhet të jetë një numër i plotë midis ${AGE_MIN} dhe ${AGE_MAX} vjeç.`);
      valid = false;
    }

    return valid;
  };

  const handleCalculate = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age, 10); // Ensure integer for age

    if (isNaN(h) || h <= 0) {
      Alert.alert("Invalid Height", "Please select a valid height.");
      return;
    }

    const isValid = validateInputs(w, a);

    if (!isValid) {
      // Compose a friendly alert showing exactly what is wrong and the allowed ranges
      let messages = [];
      if (weightError) messages.push(`Pesha: ${weightError}`);
      if (ageError) messages.push(`Mosha: ${ageError}`);
      if (messages.length === 0) {
        // fallback generic message
        messages.push(
          `Vlera e futur nuk është e shëndetshme. Pesha: ${WEIGHT_MIN}-${WEIGHT_MAX} kg. Mosha: ${AGE_MIN}-${AGE_MAX} vjeç.`
        );
      }
      Alert.alert("Vlerë jo e mundur", messages.join("\n"));
      return;
    }

    const bmiValue = w / ((h / 100) ** 2);
    const bmiRounded = parseFloat(bmiValue.toFixed(1));
    setBmi(bmiRounded);

    try {
      // Create record in Firebase
      await createBMI({
        gender,
        height: h,
        weight: w,
        age: a,
        bmi: bmiRounded,
        date: new Date().toISOString(),
      });

      // Fetch updated history
      const updatedHistory = await readBMIs();
      setHistory(updatedHistory.sort((a, b) => new Date(b.date) - new Date(a.date))); // Sort by latest first
    } catch (error) {
      console.error("Error saving BMI:", error);
    }

    setShowResult(true);
  };

  const handleRecalculate = () => {
    setShowResult(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBMI(id);
      const updatedHistory = await readBMIs();
      setHistory(updatedHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
      Alert.alert("Success", "Rekordi u fshi me sukses."); // Added success message
    } catch (error) {
      console.error("Error deleting BMI:", error);
      Alert.alert("Gabim", "Nuk mund të fshihet rekordi. Kontrollo lidhjen ose rregullat e Firebase."); // Added error message
    }
  };

  // If we have a result, show BmiResult component
  if (showResult && bmi !== null) {
    return (
      <BmiResult
        bmi={bmi}
        onRecalculate={handleRecalculate}
        history={history}
        onDelete={handleDelete}
        colors={colors}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Normal calculator
  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
        },
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />

      <View style={{ flex: 1, marginTop: 45 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.text }]}>BMI Calculator</Text>

          {/* Gender Selection */}
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderBox,
                { backgroundColor: colors.card },
                gender === "male" && [styles.activeGender, { borderColor: colors.primary }],
              ]}
              onPress={() => setGender("male")}
            >
              <Text style={[styles.genderText, { color: colors.text }]}>♂ Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderBox,
                { backgroundColor: colors.card },
                gender === "female" && [styles.activeGender, { borderColor: colors.primary }],
              ]}
              onPress={() => setGender("female")}
            >
              <Text style={[styles.genderText, { color: colors.text }]}>♀ Female</Text>
            </TouchableOpacity>
          </View>

          {/* Height Slider */}
          <View style={[styles.sliderBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>HEIGHT</Text>
            <Text style={[styles.value, { color: colors.text }]}>{height} cm</Text>
            <Slider
              style={{ width: "100%" }}
              minimumValue={100}
              maximumValue={220}
              value={height}
              onValueChange={(value) => setHeight(Math.round(value))}
              minimumTrackTintColor={colors.primary}
              thumbTintColor={colors.primary}
            />
          </View>

          {/* Weight & Age Inputs */}
          <View style={styles.rowBox}>
            <View style={[styles.smallBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>WEIGHT (kg)</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.primary },
                ]}
                keyboardType="numeric"
                value={weight}
                onChangeText={handleWeightChange}
                placeholder={`${WEIGHT_MIN} - ${WEIGHT_MAX}`}
              />
              {weightError ? (
                <Text style={styles.errorText}>{weightError}</Text>
              ) : null}
            </View>

            <View style={[styles.smallBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>AGE</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.primary },
                ]}
                keyboardType="numeric"
                value={age}
                onChangeText={handleAgeChange}
                placeholder={`${AGE_MIN} - ${AGE_MAX}`}
                maxLength={3}
              />
              {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleCalculate}
          >
            <Text style={styles.buttonText}>Calculate BMI</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <List onNavigate={(p) => router.push(p)} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  genderBox: {
    flex: 1,
    margin: 5,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  activeGender: {
    borderWidth: 2,
  },
  genderText: {
    fontSize: 18,
  },
  sliderBox: {
    width: "100%",
    borderRadius: 10,
    marginVertical: 15,
    padding: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 24,
    marginVertical: 10,
  },
  rowBox: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  smallBox: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    width: "80%",
    textAlign: "center",
    fontSize: 20,
    paddingVertical: 5,
    marginTop: 10,
  },
  errorText: {
    color: "red",
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexShrink: 0,
    backgroundColor: "transparent",
  },
});

export default BMI;