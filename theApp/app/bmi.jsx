import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import List from "../components/list";
import { ScrollView } from "react-native";
const BMI = () => {
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>BMI Calculator</Text>

      {/* Selektimi i Gjinise */}
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[styles.genderBox, gender === "male" && styles.activeGender]}
          onPress={() => setGender("male")}
        >
          <Text style={styles.genderText}>♂ Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderBox, gender === "female" && styles.activeGender]}
          onPress={() => setGender("female")}
        >
          <Text style={styles.genderText}>♀ Female</Text>
        </TouchableOpacity>
      </View>

      {/* Gjatsia slider */}
      <View style={styles.sliderBox}>
        <Text style={styles.label}>HEIGHT</Text>
        <Text style={styles.value}>{height} cm</Text>
        <Slider
          style={{ width: "100%" }}
          minimumValue={100}
          maximumValue={220}
          value={height}
          onValueChange={(value) => setHeight(Math.round(value))}
          minimumTrackTintColor="#28a745"
          thumbTintColor="#28a745"
        />
      </View>

      {/* Weight & Age boxes */}
      <View style={styles.rowBox}>
        <View style={styles.smallBox}>
          <Text style={styles.label}>WEIGHT</Text>
          <Text style={styles.value}>{weight} kg</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.circleBtn} onPress={decreaseWeight}>
              <Text style={styles.btnText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn} onPress={increaseWeight}>
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.smallBox}>
          <Text style={styles.label}>AGE</Text>
          <Text style={styles.value}>{age}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.circleBtn} onPress={decreaseAge}>
              <Text style={styles.btnText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn} onPress={increaseAge}>
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/*Butoni i kalkulimit */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Calculate BMI</Text>
      </TouchableOpacity>
      </ScrollView>
      <List onNavigate={(p) => router.push(p)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  container: { flex: 1, backgroundColor: "#000" },
    content: { 
    flex: 1, 
    paddingHorizontal: 16 
  },
  scroll: { 
    padding: 20 
  },
  title: {
    color: "#fff",
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
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  activeGender: {
    borderColor: "#28a745",
    borderWidth: 2,
  },
  genderText: {
    color: "#fff",
    fontSize: 18,
  },
  sliderBox: {
    backgroundColor: "#333",
    width: "100%",
    borderRadius: 10,
    marginVertical: 15,
    padding: 20,
    alignItems: "center",
  },
  label: {
    color: "#aaa",
    fontSize: 14,
  },
  value: {
    color: "#fff",
    fontSize: 24,
    marginVertical: 10,
  },
  rowBox: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  smallBox: {
    backgroundColor: "#333",
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
    backgroundColor: "#222",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  btnText: {
    color: "#28a745",
    fontSize: 22,
  },
  button: {
    backgroundColor: "#28a745",
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
