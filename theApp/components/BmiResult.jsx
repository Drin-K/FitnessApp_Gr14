import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BmiResult = ({
  bmi,
  history,
  onDelete,
  onRecalculate,
  colors,
  isDarkMode,
  isLoggedUser,
}) => {
  const getStatus = (value) => {
    if (value < 18.5) return "Underweight";
    if (value < 25) return "Normal";
    if (value < 30) return "Overweight";
    return "Obese";
  };

  const getStatusColor = (value) => {
    if (value < 18.5) return "#FFA500";
    if (value < 25) return "#4CAF50";
    if (value < 30) return "#FF9800";
    return "#F44336";
  };

  // ================================
  // GUEST MODE
  // ================================
  if (!isLoggedUser) {
    return (
      <View style={[styles.guestBox, { backgroundColor: colors.card }]}>
        <Text style={[styles.guestTitle, { color: colors.text }]}>Your Result</Text>

        <Text
          style={[
            styles.guestStatus,
            { color: getStatusColor(parseFloat(bmi)) },
          ]}
        >
          {getStatus(parseFloat(bmi)).toUpperCase()}
        </Text>

        <Text style={[styles.guestValue, { color: colors.text }]}>
          {bmi}
        </Text>

        <Text style={[styles.guestMessage, { color: colors.textSecondary }]}>
          {getStatus(parseFloat(bmi)) === "Normal"
            ? "You have a normal body weight. Good job!"
            : "Based on your BMI value, consider adjusting diet or exercise."}
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onRecalculate}
        >
          <Text style={styles.buttonText}>Recalculate</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ================================
  // LOGGED USER MODE — TABLE (NO FLATLIST)
  // ================================
  return (
    <SafeAreaView style={{ width: "100%", marginTop: 20 }}>
      <Text style={[styles.tableTitle, { color: colors.text }]}>
        BMI History
      </Text>

      {/* HEADER */}
      <View
        style={[
          styles.headerRow,
          { backgroundColor: isDarkMode ? "#333" : "#eaeaea" },
        ]}
      >
        <Text style={[styles.headerCell, styles.dateCell]}>
          Date
        </Text>
        <Text style={[styles.headerCell, styles.statusCell]}>
          Status
        </Text>
        <Text style={[styles.headerCell, styles.bmiCell]}>
          BMI
        </Text>
        <Text style={[styles.headerCell, styles.actionCell]}>
          Action
        </Text>
      </View>

      {/* ROWS MANUALLY */}
      <View style={{ maxHeight: 300 }}>
        {history.length === 0 && (
          <View style={[styles.emptyRow, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.textSecondary }}>No history yet.</Text>
          </View>
        )}

        {history.map((item) => (
          <View
            key={item.id}
            style={[styles.row, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.cell, styles.dateCell, { color: colors.text }]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>

            <Text
              style={[
                styles.cell,
                styles.statusCell,
                { color: getStatusColor(item.bmi) },
              ]}
            >
              {getStatus(item.bmi)}
            </Text>

            <Text style={[styles.cell, styles.bmiCell, { color: colors.text }]}>
              {item.bmi}
            </Text>

            <View style={styles.actionCell}>
              <TouchableOpacity
                onPress={() => onDelete(item.id)}
                style={[
                  styles.delButton,
                  { 
                    borderColor: "#ff4d4d",
                    backgroundColor: isDarkMode ? "transparent" : "transparent"
                  }
                ]}
              >
                <Text style={styles.delText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Guest mode
  guestBox: {
    padding: 25,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
    elevation: 5,
  },
  guestTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  guestStatus: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  guestValue: { fontSize: 60, fontWeight: "bold", marginVertical: 10 },
  guestMessage: { textAlign: "center", fontSize: 15, marginVertical: 10 },
  button: {
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // Table
  tableTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 15,
    textAlign: "center"
  },
  
  headerRow: { 
    flexDirection: "row", 
    paddingVertical: 12,
    alignItems: "center",
  },
  
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  
  // Cell styles with fixed widths
  headerCell: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  
  cell: {
    fontSize: 14,
    textAlign: "center",
  },
  
  dateCell: {
    flex: 1.2,
    textAlign: "center",
  },
  
  statusCell: {
    flex: 1.2,
    textAlign: "center",
  },
  
  bmiCell: {
    flex: 0.8,
    textAlign: "center",
  },
  
  actionCell: {
    flex: 0.8,
    alignItems: "center",
    justifyContent: "center",
  },

  delButton: {
    backgroundColor: "transparent",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    width: 30,
  },
  
  delText: { 
    color: "#ff4d4d", 
    fontWeight: "700", 
    fontSize: 14,
    textAlign: "center",
    lineHeight: 16,
  },

  emptyRow: { 
    padding: 15, 
    alignItems: "center" 
  },
});

export default BmiResult;