// components/NutritionItem.jsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const NutritionItem = ({ img, name, desc, onPress }) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.8}>
      <Image source={img} style={styles.img} />
      <Text style={styles.name}>{name}</Text>
      {desc && <Text style={styles.desc}>{desc}</Text>}
    </TouchableOpacity>
  );
};

export default NutritionItem;

const styles = StyleSheet.create({
  item: {
    width: "31%",
    backgroundColor: "#0e0e0e",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#004d2b",
    borderRadius: 16,
    shadowColor: "#00ff88",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10,
  },
  img: {
    width: 60,
    height: 60,
    marginBottom: 8,
    borderRadius: 10,
  },
  name: {
    color: "#bfffd6",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  desc: {
    color: "#9fbfaa",
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
});
