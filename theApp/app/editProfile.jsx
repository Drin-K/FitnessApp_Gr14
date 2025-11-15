import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const Settings = () => {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState(null);
  const [base64Photo, setBase64Photo] = useState(null);

  const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

  // 🔥 Load Firestore user data
  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const d = snap.data();
          setUserData(d);

          setFirstName(d.firstName || "");
          setLastName(d.lastName || "");
          setHeight(d.height || "");
          setWeight(d.weight || "");
          setPhoto(
            d.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          );
        }
      } catch (err) {
        showAlert("Error", "Failed to load settings");
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // 📸 Pick Image (Web Compatible)
  const pickImageWeb = () =>
    new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return resolve(null);
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };

        reader.readAsDataURL(file);
      };

      input.click();
    });

  const pickImage = async () => {
    try {
      if (Platform.OS === "web") {
        const b64 = await pickImageWeb();
        if (!b64) return;

        setBase64Photo(b64);
        setPhoto(`data:image/jpeg;base64,${b64}`);
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        base64: true,
        quality: 0.8,
      });

      if (!res.canceled) {
        const asset = res.assets[0];
        setBase64Photo(asset.base64);
        setPhoto(asset.uri);
      }
    } catch (err) {
        showAlert("Error", "Failed to upload image");
    }
  };

  // 💾 Save changes
 const handleSave = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const ref = doc(db, "users", user.uid);

    // Firestore nuk lejon undefined → PRANDAJ i filtrojmë
    const cleanData = {
      firstName: firstName || "",
      lastName: lastName || "",
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      photo: base64Photo
        ? `data:image/jpeg;base64,${base64Photo}`
        : photo || null,
    };

    await updateDoc(ref, cleanData);

    showAlert("Success", "Profile updated!");
    router.back();
  } catch (err) {
    console.error("SAVE ERROR:", err);
    showAlert("Error", "Failed to save settings: " + err.message);
  }
};



  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
      ]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.primary }]}>Edit Profile</Text>

        {/* PHOTO */}
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: photo }} style={styles.avatar} />
          <Text style={[styles.changePhoto, { color: colors.primary }]}>
            Change Profile Photo
          </Text>
        </TouchableOpacity>

        {/* FORM */}
        <View style={styles.form}>
          <TextInput
            placeholder="First Name"
            placeholderTextColor="#888"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#888"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />

          <TextInput
            placeholder="Height (cm)"
            keyboardType="numeric"
            placeholderTextColor="#888"
            style={styles.input}
            value={height}
            onChangeText={setHeight}
          />

          <TextInput
            placeholder="Weight (kg)"
            keyboardType="numeric"
            placeholderTextColor="#888"
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity
  style={styles.discardButton}
  onPress={() => router.back()}
>
  <Text style={styles.discardText}>Discard</Text>
</TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 80 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 32, fontWeight: "800", marginBottom: 30, textAlign: "center" },

  avatar: { width: 130, height: 130, borderRadius: 65, alignSelf: "center" },
  changePhoto: { textAlign: "center", marginTop: 10, fontSize: 16, fontWeight: "600" },

  form: { marginTop: 30, gap: 15 },
  input: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    fontSize: 18,
  },

  saveButton: {
    marginTop: 40,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
  },
  discardButton: {
  marginTop: 15,
  paddingVertical: 15,
  borderRadius: 12,
  alignItems: "center",
  backgroundColor: "#ff3b30", // e kuqe
},

discardText: {
  fontSize: 20,
  fontWeight: "700",
  color: "#fff",
},
});
