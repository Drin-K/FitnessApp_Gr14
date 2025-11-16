import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

      <View style={[styles.tableContainer, { borderColor: isDarkMode ? "#444" : "#ddd" }]}>
        {/* HEADER */}
        <View
          style={[
            styles.headerRow,
            { backgroundColor: isDarkMode ? "#333" : "#eaeaea" },
          ]}
        >
          <View style={styles.headerCellWrapper}>
            <Text style={[styles.headerCellText, { color: colors.text }]}>
              Date
            </Text>
          </View>
          <View style={styles.headerCellWrapper}>
            <Text style={[styles.headerCellText, { color: colors.text }]}>
              Status
            </Text>
          </View>
          <View style={styles.headerCellWrapper}>
            <Text style={[styles.headerCellText, { color: colors.text }]}>
              BMI
            </Text>
          </View>
          <View style={styles.headerCellWrapperDel}>
            <Text style={[styles.headerCellText, { color: colors.text }]}>
              Del
            </Text>
          </View>
        </View>

        {/* ROWS MANUALLY */}
        <ScrollView style={{ maxHeight: 300 }}>
          {history.length === 0 ? (
            <View style={[styles.emptyRow, { backgroundColor: colors.card }]}>
              <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
                No history yet.
              </Text>
            </View>
          ) : (
            history.map((item) => (
              <View
                key={item.id}
                style={[styles.row, { backgroundColor: colors.card }]}
              >
                <View style={styles.cellWrapper}>
                  <Text style={[styles.cellText, { color: colors.text }]}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.cellWrapper}>
                  <Text
                    style={[
                      styles.cellText,
                      { color: getStatusColor(item.bmi) },
                    ]}
                  >
                    {getStatus(item.bmi)}
                  </Text>
                </View>

                <View style={styles.cellWrapper}>
                  <Text style={[styles.cellText, { color: colors.text }]}>
                    {item.bmi}
                  </Text>
                </View>

                <View style={styles.cellWrapperDel}>
                  <TouchableOpacity
                    onPress={() => onDelete(item.id)}
                    style={styles.delButton}
                  >
                    <Text style={styles.delText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
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
  tableTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  tableContainer: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  headerRow: { flexDirection: "row" },
  headerCellWrapper: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCellWrapperDel: {
    flex: 0.8,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCellText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  cellWrapper: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cellWrapperDel: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: { fontSize: 14, textAlign: "center" },

  delButton: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#fee",
    borderWidth: 1,
    borderColor: "#f44336",
  },
  delText: { color: "#f44336", fontSize: 16, fontWeight: "bold" },

  emptyRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
});

export default BmiResult;