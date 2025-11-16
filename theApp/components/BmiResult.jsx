import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
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
  // Status për GUEST user (vetem kur ska login)
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
  // CASE 1: USER IS NOT LOGGED → SHOW ONLY RESULT
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
  // CASE 2: USER LOGGED → SHOW ONLY TABLE
  // ================================

  const renderItem = ({ item }) => (
    <View style={[styles.row, { backgroundColor: colors.card }]}>
      <Text style={[styles.cell, { flex: 1, color: colors.text }]}>
        {new Date(item.date).toLocaleDateString()}
      </Text>

      <Text style={[styles.cell, { flex: 1, color: getStatusColor(item.bmi) }]}>
        {getStatus(item.bmi)}
      </Text>

      <Text style={[styles.cell, { flex: 1, color: colors.text }]}>
        {item.bmi}
      </Text>

      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.delButton}>
        <Text style={styles.delText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ width: "100%", marginTop: 20 }}>
      <Text style={[styles.tableTitle, { color: colors.text }]}>
        BMI History
      </Text>

      {/* TABLE HEADER */}
      <View
        style={[
          styles.headerRow,
          { backgroundColor: isDarkMode ? "#333" : "#eaeaea" },
        ]}
      >
        <Text style={[styles.headerCell, { flex: 1, color: colors.text }]}>
          Date
        </Text>
        <Text style={[styles.headerCell, { flex: 1, color: colors.text }]}>
          Status
        </Text>
        <Text style={[styles.headerCell, { flex: 1, color: colors.text }]}>
          BMI
        </Text>
        <Text style={[styles.headerCell, { flex: 0.8, color: colors.text }]}>
          Del
        </Text>
      </View>

      {/* LIST */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View
            style={[
              styles.emptyRow,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={{ color: colors.textSecondary }}>
              No history yet.
            </Text>
          </View>
        }
        style={{ maxHeight: 320 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // === Guest mode UI ===
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

  // === Table mode UI ===
  tableTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  headerRow: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  headerCell: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cell: {
    fontSize: 14,
    textAlign: "center",
  },

  delButton: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#fee",
    borderWidth: 1,
    borderColor: "#f44336",
    marginRight: 5,
  },
  delText: {
    color: "#f44336",
    fontSize: 16,
    fontWeight: "bold",
  },

  emptyRow: {
    padding: 15,
    alignItems: "center",
  },
});

export default BmiResult;
