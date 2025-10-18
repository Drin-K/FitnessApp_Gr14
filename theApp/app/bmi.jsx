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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import List from "../components/List";
import BmiResult from "../components/BmiResult";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const BMI = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const [gender, setGender] = useState(null);
  const [height, setHeight] = useState(167);
  const [weight, setWeight] = useState("60");
  const [age, setAge] = useState("20");
  const [bmi, setBmi] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h) || h <= 0) return;
    const bmiValue = w / ((h / 100) ** 2);
    setBmi(bmiValue.toFixed(1));
    setShowResult(true);
  };

  const handleRecalculate = () => {
    setShowResult(false);
  };

  // Nëse kemi rezultat, shfaq BmiResult komponentin
  if (showResult && bmi) {
    return (
      <BmiResult 
        bmi={bmi} 
        onRecalculate={handleRecalculate}
        colors={colors}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Kalkulatori normal
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

      <View style={{ flex: 1, marginTop:45 }}>
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
                onChangeText={setWeight}
              />
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
                onChangeText={setAge}
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