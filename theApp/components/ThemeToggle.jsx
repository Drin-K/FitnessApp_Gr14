import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ style }) => {
  const { colors, toggleTheme, isDarkMode } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.button, 
        { 
          backgroundColor: colors.card || colors.surface,
          borderColor: colors.primary 
        }, 
        style
      ]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: colors.text }]}>
        {isDarkMode ? "☀️ Light" : "🌙 Dark"}
      </Text>
    </TouchableOpacity>
  );
};

export default ThemeToggle;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontWeight: "700",
    fontSize: 12,
  },
});