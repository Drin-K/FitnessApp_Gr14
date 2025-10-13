import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import List from "../components/list";

const Settings = () => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0a0a0a", "#001a10", "#000"]} style={styles.bg}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Profile Section */}
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: "https://i.imgur.com/3GvwNBf.png" }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>Floyd Miles</Text>
            <Text style={styles.profileEmail}>floydmiles@gmail.com</Text>
          </View>

          {/* Account Settings */}
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.card}>
            <SettingItem icon="person-outline" label="Edit Profile" />
            <SettingItem icon="lock-closed-outline" label="Change Password" />
            <SettingItem icon="notifications-outline" label="Notifications" />
          </View>

          {/* More Section */}
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.card}>
            <SettingItem icon="globe-outline" label="Language" />
            <SettingItem icon="shield-outline" label="Privacy" />
            <SettingItem icon="help-circle-outline" label="Help" />
          </View>

         
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
       <List />
    </SafeAreaView>
  );
};


const SettingItem = ({ icon, label }) => (
  <TouchableOpacity style={styles.item}>
    <View style={styles.itemLeft}>
      <Ionicons name={icon} size={22} color="#bfffd6" style={{ width: 28 }} />
      <Text style={styles.itemText}>{label}</Text>
    </View>
    <Feather name="chevron-right" size={20} color="#666" />
  </TouchableOpacity>
);

export default Settings;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  bg: { flex: 1 },
  scroll: { padding: 20 },
  profileContainer: {
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#00ff88",
  },
  profileName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },
  profileEmail: {
    color: "#bfffd6",
    fontSize: 13,
    marginTop: 3,
  },
  sectionTitle: {
    color: "#00ff88",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#0d1d16",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#002a1c",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#003321",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    color: "#fff",
    fontSize: 15,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff4c4c",
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: "#ff4c4c",
    fontWeight: "700",
    fontSize: 15,
  },
});