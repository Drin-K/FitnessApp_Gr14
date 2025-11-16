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
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const EditProfile = () => {
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>Edit Profile</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Update your personal information
            </Text>
          </View>

          {/* PHOTO */}
          <View style={styles.photoContainer}>
            <TouchableOpacity onPress={pickImage}>
              <Image source={{ uri: photo }} style={styles.avatar} />
              <Text style={[styles.changePhoto, { color: colors.primary }]}>
                Change Profile Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrap}>
              <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
              <TextInput
                placeholder="Enter first name"
                placeholderTextColor="#888"
                style={[
                  styles.input,
                  { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.card
                  }
                ]}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
              <TextInput
                placeholder="Enter last name"
                placeholderTextColor="#888"
                style={[
                  styles.input,
                  { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.card
                  }
                ]}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.label, { color: colors.text }]}>Height (cm)</Text>
              <TextInput
                placeholder="Enter height in cm"
                keyboardType="numeric"
                placeholderTextColor="#888"
                style={[
                  styles.input,
                  { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.card
                  }
                ]}
                value={height}
                onChangeText={setHeight}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.label, { color: colors.text }]}>Weight (kg)</Text>
              <TextInput
                placeholder="Enter weight in kg"
                keyboardType="numeric"
                placeholderTextColor="#888"
                style={[
                  styles.input,
                  { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.card
                  }
                ]}
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>

          {/* BUTTONS */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]} 
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.discardButton, { borderColor: colors.border }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.discardText, { color: colors.text }]}>Discard</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 },
  backButton: { marginBottom: 10 },
  backText: { fontSize: 16, fontWeight: "600" },

  header: { alignItems: "center", marginTop: 20 },
  title: { fontSize: 32, fontWeight: "900" },
  subtitle: { fontSize: 14, marginTop: 5 },

  photoContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    alignSelf: "center" 
  },
  changePhoto: { 
    textAlign: "center", 
    marginTop: 10, 
    fontSize: 16, 
    fontWeight: "600" 
  },

  formContainer: { 
    width: "100%", 
    marginTop: 20 
  },
  inputWrap: { 
    marginBottom: 20 
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
  },

  buttonContainer: {
    width: "100%",
    marginTop: 30,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16 
  },
  discardButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  discardText: { 
    fontSize: 16, 
    fontWeight: "600" 
  },

  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});