import React, { useState, useEffect } from "react";
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
import { createBMI, readBMIs, deleteBMI } from "../services/BMIService";
import { auth } from "../firebase";

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

  const [history, setHistory] = useState([]);

  const user = auth.currentUser;
  const isLoggedUser = user !== null;

  // LOAD HISTORY WHEN LOGGED
  useEffect(() => {
    if (isLoggedUser) loadHistory();
  }, [isLoggedUser]);

  const loadHistory = async () => {
    const records = await readBMIs();
    setHistory(records);
  };

  // VALIDATIONS
  const handleWeightChange = (text) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) cleaned = parts[0] + "." + parts.slice(1).join("");
    setWeight(cleaned);
  };

  const handleAgeChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setAge(cleaned);
  };

  const validateInputs = (w, a) => {
    if (isNaN(w) || w < WEIGHT_MIN || w > WEIGHT_MAX) {
      Alert.alert("Error", `Weight must be between ${WEIGHT_MIN} and ${WEIGHT_MAX}`);
      return false;
    }
    if (isNaN(a) || a < AGE_MIN || a > AGE_MAX) {
      Alert.alert("Error", `Age must be between ${AGE_MIN} and ${AGE_MAX}`);
      return false;
    }
    return true;
  };

  // CALCULATE BMI
  const handleCalculate = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age, 10);

    if (!validateInputs(w, a)) return;

    const bmiValue = w / ((h / 100) ** 2);
    const bmiRounded = parseFloat(bmiValue.toFixed(1));
    setBmi(bmiRounded);

    // GUEST USER → SHOW RESULT ONLY
    if (!isLoggedUser) return;

    // LOGGED USER → SAVE BMI
    await createBMI({
      gender,
      height: h,
      weight: w,
      age: a,
      bmi: bmiRounded,
      date: new Date().toISOString(),
    });

    await loadHistory();
  };

  // DELETE ROW
  const handleDelete = async (id) => {
    await deleteBMI(id);
    await loadHistory();
  };

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
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>BMI Calculator</Text>

        {/* Gender */}
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

        {/* Height */}
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

        {/* Weight & Age */}
        <View style={styles.rowBox}>
          <View style={[styles.smallBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>WEIGHT (kg)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
              keyboardType="numeric"
              value={weight}
              onChangeText={handleWeightChange}
            />
          </View>

          <View style={[styles.smallBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>AGE</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
              keyboardType="numeric"
              value={age}
              onChangeText={handleAgeChange}
              maxLength={3}
            />
          </View>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleCalculate}
        >
          <Text style={styles.buttonText}>Calculate BMI</Text>
        </TouchableOpacity>

        {/* GUEST → show only result */}
        {!isLoggedUser && bmi !== null && (
          <View style={{ marginTop: 30 }}>
            <BmiResult
              bmi={bmi}
              history={[]}
              onDelete={() => {}}
              onRecalculate={() => setBmi(null)}
              colors={colors}
              isDarkMode={isDarkMode}
              isLoggedUser={false}
            />
          </View>
        )}

        {/* LOGGED USER ALWAYS SEES TABLE */}
        {isLoggedUser && (
          <View style={{ marginTop: 30 }}>
            <BmiResult
              bmi={bmi} // ignored in logged mode
              history={history}
              onDelete={handleDelete}
              onRecalculate={() => setBmi(null)}
              colors={colors}
              isDarkMode={isDarkMode}
              isLoggedUser={true}
            />
          </View>
        )}
      </ScrollView>

      <List onNavigate={(p) => router.push(p)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  genderContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  genderBox: {
    flex: 1,
    margin: 5,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  activeGender: { borderWidth: 2 },
  genderText: { fontSize: 18 },

  sliderBox: {
    width: "100%",
    borderRadius: 10,
    marginVertical: 15,
    padding: 20,
    alignItems: "center",
  },
  label: { fontSize: 14 },
  value: { fontSize: 24, marginVertical: 10 },

  rowBox: { flexDirection: "row", width: "100%", justifyContent: "space-between" },
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
});

export default BMI;
