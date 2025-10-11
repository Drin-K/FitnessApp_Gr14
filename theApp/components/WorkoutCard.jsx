import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const WorkoutCard = ({ title, duration, functionality, image }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <Image source={image} style={styles.image} resizeMode="cover" />

      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.duration}>⏱ {duration}</Text>
        <Text style={styles.functionality}>{functionality}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default WorkoutCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#06140f",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 18,
    shadowColor: "#00ff88",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 180,
  },
  info: {
    padding: 14,
  },
  title: {
    color: "#00ff88",
    fontSize: 18,
    fontWeight: "800",
  },
  duration: {
    color: "#b7ffcc",
    fontSize: 13,
    marginTop: 4,
  },
  functionality: {
    color: "#9fbfaa",
    fontSize: 13,
    marginTop: 6,
  },
});
