import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import List from "../components/List";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { logoutUser } from "../services/authService";
import { onSnapshot } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

// Helper function to compress base64 string (reduces size by ~30-50%)
const compressBase64 = (base64String) => {
  // Remove data URL prefix if present
  const base64Data = base64String.includes('base64,') 
    ? base64String.split('base64,')[1] 
    : base64String;
  
  return base64Data;
};

// Helper function to check if base64 string is too large for Firestore (1MB limit)
const isBase64TooLarge = (base64String) => {
  // Approximate base64 size calculation (base64 is about 33% larger than binary)
  const sizeInBytes = (base64String.length * 3) / 4;
  return sizeInBytes > 900000; // Keep under 1MB with some buffer
};

const ProfileScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", firebaseUser.uid);

      const unsubscribeFirestore = onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            
            // Check if photo is stored as base64
            let photoUrl = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
            
            if (data.photo) {
              // If it's a base64 string, create data URL
              if (data.photo.startsWith('data:image') || data.photo.length > 1000) {
                // It's already a data URL or base64
                photoUrl = data.photo;
              } else if (data.photo.includes('firebasestorage') || data.photo.includes('http')) {
                // It's a regular URL (from previous Firebase Storage uploads)
                photoUrl = data.photo;
              }
            }

            setUser({
              uid: firebaseUser.uid,
              fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "User",
              email: data.email || firebaseUser.email,
              photo: photoUrl,
              height: data.height || "",
              weight: data.weight || "",
              photoType: data.photoType || 'url', // 'url' or 'base64'
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              fullName: firebaseUser.displayName || "User",
              email: firebaseUser.email,
              photo: firebaseUser.photoURL || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              height: "",
              weight: "",
              photoType: 'url',
            });
          }

          setLoading(false);
        },
        (error) => {
          console.error("Firestore real-time error:", error);
          setLoading(false);
        }
      );

      return () => unsubscribeFirestore();
    });

    return () => unsubscribeAuth();
  }, []);

  // Request permissions when component mounts
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        await ImagePicker.requestCameraPermissionsAsync();
      }
    })();
  }, []);

  const saveBase64ToFirestore = async (base64String, originalUri) => {
    try {
      setUploading(true);
      console.log("Starting base64 upload...");
      
      // Check if base64 is too large for Firestore
      if (isBase64TooLarge(base64String)) {
        Alert.alert(
          "Image Too Large", 
          "The selected image is too large. Please choose a smaller image or take a photo with lower resolution.",
          [{ text: "OK" }]
        );
        setUploading(false);
        return;
      }
      
      // Compress the base64 string
      const compressedBase64 = compressBase64(base64String);
      console.log("Base64 compressed, length:", compressedBase64.length);
      
      // Create data URL for display
      const dataUrl = `data:image/jpeg;base64,${compressedBase64}`;
      
      // Update Firestore with base64 string
      const userRef = doc(db, "users", user.uid);
      console.log("Updating Firestore with base64...");
      
      await updateDoc(userRef, {
        photo: compressedBase64, // Store compressed base64 (without data URL prefix)
        photoType: 'base64',
        photoUpdatedAt: new Date().toISOString(),
        // Also store a thumbnail for faster loading if needed
        photoThumbnail: compressedBase64.substring(0, 5000), // First 5000 chars as thumbnail
      });
      
      console.log("Firestore updated successfully with base64");
      
      // Update local state with data URL for immediate display
      setUser(prev => ({ 
        ...prev, 
        photo: dataUrl,
        photoType: 'base64'
      }));
      
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      
      let errorMessage = "Failed to save profile picture. ";
      
      if (error.code === 'permission-denied') {
        errorMessage += "You don't have permission to update your profile. Check your Firestore rules.";
      } else if (error.code === 'failed-precondition') {
        errorMessage += "The document might not exist or is in an invalid state.";
      } else if (error.message.includes('size')) {
        errorMessage += "The image is too large for Firestore. Please choose a smaller image.";
      } else {
        errorMessage += error.message;
      }
      
      Alert.alert("Save Error", errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera access to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4, // Lower quality for smaller file size (0.4 instead of 0.5)
        base64: true, // Get base64 string
      });

      if (!result.canceled && result.assets[0].base64) {
        console.log("Photo taken, base64 length:", result.assets[0].base64.length);
        await saveBase64ToFirestore(result.assets[0].base64, result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need photo library access to select images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4, // Lower quality for smaller file size
        base64: true, // Get base64 string
      });

      if (!result.canceled && result.assets[0].base64) {
        console.log("Image picked, base64 length:", result.assets[0].base64.length);
        await saveBase64ToFirestore(result.assets[0].base64, result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleImageOption = () => {
    if (!user) return;
    
    Alert.alert(
      "Update Profile Picture",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: takePhoto
        },
        {
          text: "Choose from Gallery",
          onPress: pickImage
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      setUser(null);
      router.replace("/login");
    } else {
      Alert.alert("Logout Error", result.message);
    }
  };

  const gradientColors = isDarkMode
    ? [colors.background, "#1a1a1a", colors.background]
    : ["#ffffff", "#f8f9fa", "#ffffff"];

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <LinearGradient colors={gradientColors} style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {!user ? (
            <View style={styles.guestContainer}>
              <Text style={[styles.infoText, { color: colors.text }]}>
                You need to log in or sign up to see your profile.
              </Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.authButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push("/login")}
                >
                  <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.authButton, { backgroundColor: "#6c757d" }]}
                  onPress={() => router.push("/signup")}
                >
                  <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
                <View style={styles.avatarContainer}>
                  {uploading ? (
                    <View style={[styles.avatar, styles.avatarLoading]}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : (
                    <Image
                      source={{ 
                        uri: user.photo.startsWith('data:image') 
                          ? user.photo 
                          : user.photo.includes('firebasestorage') || user.photo.includes('http')
                            ? user.photo
                            : `data:image/jpeg;base64,${user.photo}`
                      }}
                      style={styles.avatar}
                      onError={(error) => {
                        console.error("Image load error:", error.nativeEvent.error);
                        // Fallback to default avatar
                        setUser(prev => ({ 
                          ...prev, 
                          photo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                          photoType: 'url'
                        }));
                      }}
                    />
                  )}
                  <TouchableOpacity
                    style={[styles.cameraButton, { backgroundColor: colors.primary }]}
                    onPress={handleImageOption}
                    disabled={uploading}
                  >
                    <Text style={styles.cameraEmoji}>📷</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.name, { color: colors.text }]}>
                  {user.fullName}
                </Text>
                <Text style={[styles.email, { color: colors.textSecondary }]}>
                  {user.email}
                </Text>

                <View style={styles.statsContainer}>
                  <View style={[styles.statItem, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {user.height ? `${user.height} cm` : "Not set"}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Height
                    </Text>
                  </View>

                  <View style={[styles.statItem, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {user.weight ? `${user.weight} kg` : "Not set"}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Weight
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.options}>
                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.primary }]}
                  onPress={() => router.push("/editProfile")}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>Edit Profile</Text>
                  <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                    Update your personal information
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.primary }]}
                  onPress={() => router.push("/changePassword")}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>Change Password</Text>
                  <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                    Update your security settings
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: "#dc3545" }]}
                  onPress={handleLogout}
                >
                  <Text style={[styles.optionText, { color: "#dc3545" }]}>Logout</Text>
                  <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                    Sign out of your account
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Profile Information
                </Text>
                <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
                  {user.height && user.weight 
                    ? "Your profile is complete. You can track your BMI progress with accurate data."
                    : "Add your height and weight for personalized BMI tracking and better insights."
                  }
                </Text>
                <Text style={[styles.infoNote, { color: colors.textSecondary, fontStyle: 'italic', marginTop: 8 }]}>
                  Profile pictures are stored as base64 strings in Firestore
                </Text>
              </View>
            </>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.footer}>
          <List onNavigate={(p) => router.push(p)} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: {
    height: 120,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: "700",
  },
  content: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 100 
  },
  guestContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  infoText: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 28,
    marginTop:80
  },
  buttonGroup: { 
    alignItems: "center",
    width: "100%",
  },
  authButton: {
    width: "100%",
    maxWidth: 300,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "white" 
  },
  profileCard: { 
    alignItems: "center", 
    marginBottom: 24,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#dee2e6",
  },
  avatarLoading: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cameraEmoji: {
    fontSize: 18,
  },
  name: { 
    fontSize: 22, 
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center"
  },
  email: { 
    fontSize: 15, 
    marginBottom: 20,
    textAlign: "center"
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  options: { 
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  optionText: { 
    fontSize: 16, 
    fontWeight: "600",
    marginBottom: 4,
  },
  optionSubtext: {
    fontSize: 13,
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoNote: {
    fontSize: 12,
  },
  footer: { 
    flexShrink: 0, 
    backgroundColor: "transparent" 
  },
});

export default ProfileScreen;