import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BmiResult = ({ bmi, onRecalculate, history, onDelete, colors, isDarkMode }) => {
  const value = parseFloat(bmi);

  let status = "";
  let message = "";
  let statusColor = colors.primary;

  if (value < 18.5) {
    status = "UNDERWEIGHT";
    message = "You have a lower than normal body weight. Try to eat more.";
    statusColor = "#FFA500";
  } else if (value < 25) {
    status = "NORMAL";
    message = "You have a normal body weight. Good job!";
    statusColor = "#4CAF50";
  } else if (value < 30) {
    status = "OVERWEIGHT";
    message = "You have a higher than normal body weight. Try to exercise more.";
    statusColor = "#FF9800";
  } else {
    status = "OBESE";
    message = "You have an obese body weight. Consult with a doctor.";
    statusColor = "#F44336";
  }

  // Helper function to get BMI status color for table rows
  const getBmiStatusColor = (bmiValue) => {
    const val = parseFloat(bmiValue);
    if (val < 18.5) return "#FFA500";
    if (val < 25) return "#4CAF50";
    if (val < 30) return "#FF9800";
    return "#F44336";
  };

  // Helper for formatted date
  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper for gender display
  const getGenderDisplay = (gender) => {
    if (!gender) return "N/A";
    if (gender === "male") return "♂ Male";
    if (gender === "female") return "♀ Female";
    return gender;
  };

  const renderHistoryItem = ({ item }) => (
    <View style={[styles.historyRow, { backgroundColor: colors.card }]}>
      <Text style={[styles.historyText, styles.colDate, { color: colors.text }]}>{formatDate(item.date)}</Text>
      <Text style={[styles.historyText, styles.colGender, { color: colors.text }]}>{getGenderDisplay(item.gender)}</Text>
      <Text style={[styles.historyText, styles.colNumber, { color: colors.text }]}>{item.height} cm</Text>
      <Text style={[styles.historyText, styles.colNumber, { color: colors.text }]}>{item.weight} kg</Text>
      <Text style={[styles.historyText, styles.colNumber, { color: colors.text }]}>{item.age}</Text>
      <Text style={[
        styles.historyText, 
        styles.colBmi, 
        { color: getBmiStatusColor(item.bmi) }
      ]}>{item.bmi}</Text>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.tableHeader, { backgroundColor: isDarkMode ? "#333" : "#f5f5f5" }]}>
      <Text style={[styles.headerText, styles.colDate, { color: colors.text }]}>Date</Text>
      <Text style={[styles.headerText, styles.colGender, { color: colors.text }]}>Gender</Text>
      <Text style={[styles.headerText, styles.colNumber, { color: colors.text }]}>Height</Text>
      <Text style={[styles.headerText, styles.colNumber, { color: colors.text }]}>Weight</Text>
      <Text style={[styles.headerText, styles.colNumber, { color: colors.text }]}>Age</Text>
      <Text style={[styles.headerText, styles.colBmi, { color: colors.text }]}>BMI</Text>
      <Text style={[styles.headerText, styles.colAction, { color: colors.text }]}>Action</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      
      <View style={styles.content}>
        <Text style={[styles.header, { color: colors.text }]}>Your Result</Text>

        <View style={[styles.resultBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{value.toFixed(1)}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
        </View>

        {/* BMI History Table */}
        <Text style={[styles.historyHeader, { color: colors.text }]}>BMI History</Text>
        <View style={styles.tableContainer}>
          {renderHeader()}
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            ListEmptyComponent={
              <View style={[styles.emptyRow, { backgroundColor: colors.card }]}>
                <Text style={{ color: colors.textSecondary, textAlign: "center", padding: 20 }}>
                  No history yet.
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onRecalculate}
        >
          <Text style={styles.buttonText}>Recalculate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  resultBox: {
    width: "100%",
    borderRadius: 20,
    alignItems: "center",
    padding: 40,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  status: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 60,
    fontWeight: "bold",
    marginVertical: 10,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
  button: {
    padding: 18,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  historyHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  tableContainer: {
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    backgroundColor: "#f8f9fa",
    maxHeight: 400, // Limit height for better UX
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  historyRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  historyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  colDate: {
    flex: 1.2,
  },
  colGender: {
    flex: 1,
  },
  colNumber: {
    flex: 0.9,
  },
  colBmi: {
    flex: 1,
    fontWeight: "700",
    fontSize: 16,
  },
  colAction: {
    flex: 0.8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fee",
    borderWidth: 1,
    borderColor: "#f44336",
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    fontSize: 16,
    color: "#f44336",
    fontWeight: "bold",
  },
  listContent: {
    maxHeight: 350,
  },
  emptyRow: {
    minHeight: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
});

export default BmiResult