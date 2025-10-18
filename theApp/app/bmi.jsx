import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import List from "../components/List";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const BMI = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const [gender, setGender] = useState(null);
  const [height, setHeight] = useState(167);
  const [weight, setWeight] = useState(60);
  const [age, setAge] = useState(20);

  const decreaseAge = () => {
    if (age > 13) setAge(age - 1);
  };

  const increaseAge = () => {
    if (age < 100) setAge(age + 1);
  };

  const decreaseWeight = () => {
    if (weight > 30) setWeight(weight - 1);
  };

  const increaseWeight = () => {
    if (weight < 200) setWeight(weight + 1);
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
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false} 
      />
      
      {/* main area fills screen so footer can stay fixed */}
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>BMI Calculator</Text>

          {/* Selektimi i Gjinise */}
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderBox, 
                { backgroundColor: colors.card },
                gender === "male" && [styles.activeGender, { borderColor: colors.primary }]
              ]}
              onPress={() => setGender("male")}
            >
              <Text style={[styles.genderText, { color: colors.text }]}>♂ Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderBox, 
                { backgroundColor: colors.card },
                gender === "female" && [styles.activeGender, { borderColor: colors.primary }]
              ]}
              onPress={() => setGender("female")}
            >
              <Text style={[styles.genderText, { color: colors.text }]}>♀ Female</Text>
            </TouchableOpacity>
          </View>

          {/* Gjatsia slider */}
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

          {/* Weight & Age boxes */}
          <View style={styles.rowBox}>
            <View style={[styles.smallBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>WEIGHT</Text>
              <Text style={[styles.value, { color: colors.text }]}>{weight} kg</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity 
                  style={[styles.circleBtn, { backgroundColor: colors.surface || '#222' }]} 
                  onPress={decreaseWeight}
                >
                  <Text style={[styles.btnText, { color: colors.primary }]}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.circleBtn, { backgroundColor: colors.surface || '#222' }]} 
                  onPress={increaseWeight}
                >
                  <Text style={[styles.btnText, { color: colors.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.smallBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>AGE</Text>
              <Text style={[styles.value, { color: colors.text }]}>{age}</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity 
                  style={[styles.circleBtn, { backgroundColor: colors.surface || '#222' }]} 
                  onPress={decreaseAge}
                >
                  <Text style={[styles.btnText, { color: colors.primary }]}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.circleBtn, { backgroundColor: colors.surface || '#222' }]} 
                  onPress={increaseAge}
                >
                  <Text style={[styles.btnText, { color: colors.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

<TouchableOpacity
  style={[styles.button, { backgroundColor: colors.primary }]}
  onPress={() => {
    const bmi = weight / ((height / 100) ** 2);
router.push({
  pathname: "/components/BmiResult", 
  params: { bmi: bmi.toFixed(1) },
});

  }}
>
  <Text style={styles.buttonText}>Calculate BMI</Text>
</TouchableOpacity>

        </ScrollView>

        {/* FIXED footer */}
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
  // scroll container: add paddingBottom to avoid footer overlap
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
  btnRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  btnText: {
    fontSize: 22,
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