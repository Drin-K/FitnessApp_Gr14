import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import WorkoutCard from "../components/WorkoutCard";
import * as ImagePicker from "expo-image-picker";
import List from "../components/List";
import { auth } from "../firebase";
import { saveWorkout, getWorkouts, deleteWorkout } from "../services/workoutService";

const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};


const defaultImages = {
  "default-1": require("../assets/images/workout1.jpg"),
  "default-2": require("../assets/images/workout2.jpg"),
  "default-3": require("../assets/images/workout3.webp"),
  "default-4": require("../assets/images/workout4.webp"),
  "default-5": require("../assets/images/workout5.webp"),
  "default-6": require("../assets/images/workout6.webp"),
};


const seedInitialWorkouts = async (userId) => {
  try {
    const data = await getWorkouts(userId);

    // Nëse user-i ka tashmë workouts → mos bëj seed
    if (data.length > 0) return false;

    // Përgatit workouts me ID reale
    const prepared = initialWorkouts.map((w) => ({
      id: `default-${w.id}`,
      title: w.title,
      duration: w.duration,
      functionality: w.functionality,
      routine: w.routine,
      imageBase64: null, // default images nuk jane base64
    }));

    // Ruaji në DB
    for (const workout of prepared) {
      await saveWorkout(userId, workout);
    }

    return true;
  } catch (err) {
    console.log("Seed error:", err);
    return false;
  }
};

// ✅ Default workouts
const initialWorkouts = [
  {
    id: "1",
    title: "Chest",
    duration: "45 min",
    functionality: "Build upper body strength with presses, flies, and push variations.",
    image: require("../assets/images/workout1.jpg"),
    routine: ["Bench Press - 4x10", "Incline Dumbbell Press - 3x12", "Chest Fly - 3x15", "Push-Ups - 3x20"],
  },
  {
    id: "2",
    title: "Back",
    duration: "40 min",
    functionality: "Enhance posture and pulling strength with rows and pull-ups.",
    image: require("../assets/images/workout2.jpg"),
    routine: ["Pull-Ups - 3x10", "Barbell Row - 4x10", "Lat Pulldown - 3x12", "Seated Cable Row - 3x15"],
  },
  {
    id: "3",
    title: "Biceps",
    duration: "30 min",
    functionality: "Tone and grow your arms with curls and isolation movements.",
    image: require("../assets/images/workout3.webp"),
    routine: ["Barbell Curl - 4x10", "Dumbbell Curl - 3x12", "Hammer Curl - 3x12", "Preacher Curl - 3x10"],
  },
  {
    id: "4",
    title: "Triceps",
    duration: "30 min",
    functionality: "Strengthen your arms with dips, extensions, and close-grip presses.",
    image: require("../assets/images/workout4.webp"),
    routine: ["Tricep Dips - 3x10", "Overhead Extension - 3x12", "Close-Grip Bench Press - 3x10", "Tricep Pushdown - 3x12"],
  },
  {
    id: "5",
    title: "Legs",
    duration: "50 min",
    functionality: "Develop explosive power with squats, lunges, and leg presses.",
    image: require("../assets/images/workout5.webp"),
    routine: ["Barbell Squat - 4x10", "Lunges - 3x12 per leg", "Leg Press - 4x10", "Calf Raises - 3x20"],
  },
  {
    id: "6",
    title: "Shoulders",
    duration: "35 min",
    functionality: "Build broad and stable shoulders with raises and presses.",
    image: require("../assets/images/workout6.webp"),
    routine: ["Overhead Press - 4x10", "Lateral Raise - 3x12", "Front Raise - 3x12", "Rear Delt Fly - 3x15"],
  },
];

const Workouts = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("Workouts");
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = !!auth.currentUser;



  // Form state
  const [customTitle, setCustomTitle] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customRoutine, setCustomRoutine] = useState("");
  const [image, setImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const pickImageWeb = () => {
  return new Promise((resolve) => {
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
};

  // 📸 Pick image (base64)
  const pickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setImage(asset.uri);
    if (asset.base64) setBase64Image(asset.base64);
  } catch (error) {
    console.error("❌ Error in pickImage:", error);
    Alert.alert("Error", "Failed to pick image. Try again.");
  }
};


  // 🔥 Fetch workouts
  useEffect(() => {
  const loadWorkouts = async () => {
    const user = auth.currentUser;
    if (!user) {
  const mappedDefaults = initialWorkouts.map((w) => ({
    ...w,
    id: `default-${w.id}`,   // TRANSFORMO ID-të që të përputhen me defaultImages
  }));

  setWorkouts(mappedDefaults);
  return;
}


    setLoading(true);

    // 1) Provo me seed default workouts herën e parë
    await seedInitialWorkouts(user.uid);

    // 2) Pastaj i merr 100% nga Firebase
    const data = await getWorkouts(user.uid);

    const sanitized = data.map((w, index) => ({
      ...w,
      id: w.id ?? `custom-${index}-${Date.now()}`,
    }));

    setWorkouts(data);
    setLoading(false);
  };

  loadWorkouts();
}, []);


  // ✏️ Handle Edit
  const handleEditWorkout = (workout) => {
    setEditingWorkoutId(workout.id);
    setCustomTitle(workout.title);
    setCustomDuration(workout.duration);
    setCustomDescription(workout.functionality);
    setCustomRoutine(workout.routine.join("\n"));

    if (workout.imageBase64) {
      setBase64Image(workout.imageBase64);
      setImage(`data:image/jpeg;base64,${workout.imageBase64}`);
    } else if (typeof workout.image === "string") {
      setImage(workout.image);
    } else {
      setImage(null);
    }

    setActiveTab("Custom");
  };

  // 💾 Add or Update
  const handleAddOrUpdate = async () => {
    if (!customTitle.trim() || !customRoutine.trim())
      return showAlert("Error", "Please fill all fields.");;

    const user = auth.currentUser;
    if (!user) return Alert.alert("Error", "You must be logged in.");

    try {
      const workoutData = {
  title: customTitle,
  duration: customDuration || "30 min",
  functionality: customDescription,
  imageBase64: base64Image ??  null,
  routine: customRoutine.split("\n").filter((r) => r.trim() !== ""),
};

      if (editingWorkoutId) {
        const updatedList = workouts.map((w) =>
          w.id === editingWorkoutId ? { ...w, ...workoutData } : w
        );
        setWorkouts(updatedList);
        await saveWorkout(user.uid, { ...workoutData, id: editingWorkoutId });
        showAlert("Updated", "Workout updated successfully!");
      } else {
        const newWorkout = {
          id: (workouts.length + 1).toString(),
          ...workoutData,
        };
        await saveWorkout(user.uid, newWorkout);
        setWorkouts([...workouts, newWorkout]);
        showAlert("Success","Workout added succesfully !");
      }

      setEditingWorkoutId(null);
      setCustomTitle("");
      setCustomDuration("");
      setCustomDescription("");
      setCustomRoutine("");
      setImage(null);
      setBase64Image(null);
      setActiveTab("Workouts");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // 🗑️ Delete
const handleDeleteWorkout = async (workoutId) => {
  const user = auth.currentUser;
  if (!user) return Alert.alert("Error", "You must be logged in.");

  // Get workout object to display the title in the alert
  const workout = workouts.find((w) => w.id === workoutId);
  const workoutTitle = workout?.title ?? "this workout";

  if (Platform.OS === "web") {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${workoutTitle}"?`
    );
    if (!confirmDelete) return;

    try {
      await deleteWorkout(user.uid, workoutId);
      setWorkouts(workouts.filter((w) => w.id !== workoutId));
      alert("✅ Workout deleted successfully.");
    } catch (err) {
      alert("Error deleting workout: " + err.message);
    }
  } else {
    Alert.alert(
      "Delete Workout",
      `Are you sure you want to delete "${workoutTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWorkout(user.uid, workoutId);
              setWorkouts(workouts.filter((w) => w.id !== workoutId));
              Alert.alert("Deleted", "Workout removed successfully.");
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  }
};



  // ⏳ Loading
  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  // 🧱 UI
  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        },
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={[styles.header, { color: colors.primary }]}>Plans</Text>

            {/* Tabs */}
            <View style={[styles.toggleContainer, { backgroundColor: colors.card }]}>
              {(isLoggedIn ? ["Workouts", "Custom"] : ["Workouts"]).map((tab) => (
  <TouchableOpacity
    key={tab}
    style={[
      styles.toggleButton,
      activeTab === tab && [styles.toggleActive, { backgroundColor: colors.primary }],
    ]}
    onPress={() => setActiveTab(tab)}
  >
    <Text
      style={[
        styles.toggleText,
        { color: colors.text },
        activeTab === tab && styles.toggleTextActive,
      ]}
    >
      {tab}
    </Text>
  </TouchableOpacity>
))}
            </View>

            {/* Workouts List */}
            {activeTab === "Workouts" ? (
              <FlatList
                data={workouts}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={{ marginBottom: 45 }}>
                    <WorkoutCard
                      title={item.title}
                      duration={item.duration}
                      functionality={item.functionality}
                      image={
  item.imageBase64
    ? { uri: `data:image/jpeg;base64,${item.imageBase64}` }
    : defaultImages[item.id] ?? null
}
                      onEdit={() => handleEditWorkout(item)}
                      isLoggedIn={isLoggedIn}


                    />

                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: colors.primary }]}
                      onPress={() =>
  router.push({
    pathname: "/workoutsession",
    params: {
      title: item.title,
      duration: item.duration,
      routine: item.routine.join("|"),
    },
  })
}

                    >
                     <Text style={styles.buttonText}>Start Workout</Text>
                    </TouchableOpacity>

                    {auth.currentUser && (
  <TouchableOpacity
    style={styles.deleteButton}
    onPress={() => handleDeleteWorkout(item.id)}
  >
    <Text style={styles.deleteButtonText}>Delete Workout</Text>
  </TouchableOpacity>
)}

                    {expandedId === item.id && (
                      <View style={[styles.routineContainer, { backgroundColor: colors.card }]}>
                        <Text style={[styles.routineTitle, { color: colors.primary }]}>
                          Workout Routine
                        </Text>
                        {item.routine.map((r, i) => (
  <Text
    key={`${item.id}-${i}`}
    style={[styles.routineText, { color: colors.textSecondary }]}
  >
    • {r}
  </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              />
            ) : (
              // Custom Form
              <View style={[styles.customContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.customTitle, { color: colors.primary }]}>
                  {editingWorkoutId ? "Edit Workout" : "Create Custom Workout"}
                </Text>

                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Workout Title"
                  placeholderTextColor={colors.textSecondary}
                  value={customTitle}
                  onChangeText={setCustomTitle}
                />

                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Duration (e.g. 30 min)"
                  placeholderTextColor={colors.textSecondary}
                  value={customDuration}
                  onChangeText={setCustomDuration}
                />

                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Description"
                  placeholderTextColor={colors.textSecondary}
                  value={customDescription}
                  onChangeText={setCustomDescription}
                />

                <TextInput
                  style={[styles.input, { height: 100, color: colors.text, borderColor: colors.border }]}
                  placeholder="Workout Routine (one exercise per line)"
                  placeholderTextColor={colors.textSecondary}
                  value={customRoutine}
                  multiline
                  onChangeText={setCustomRoutine}
                />

                <TouchableOpacity
                  style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                  onPress={pickImage}
                >
                  <Text style={styles.addButtonText}>
                    {image ? "Change Photo" : "Upload Photo"}
                  </Text>
                </TouchableOpacity>

                {image && <Image source={{ uri: image }} style={styles.preview} />}

                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.primary }]}
                  onPress={handleAddOrUpdate}
                >
                  <Text style={styles.addButtonText}>
                    {editingWorkoutId ? "Update Workout" : "Add Custom Workout"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        <List onNavigate={(p) => router.push(p)} />
      </View>
    </SafeAreaView>
  );
};

export default Workouts;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  scroll: { padding: 20, paddingBottom: 100 },
  header: { fontSize: 28, fontWeight: "900", textAlign: "center", marginTop: 10, letterSpacing: 1 },
  toggleContainer: { flexDirection: "row", borderRadius: 30, marginTop: 20, marginBottom: 15 },
  toggleButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
  toggleActive: { borderRadius: 30 },
  toggleText: { fontWeight: "700", fontSize: 16 },
  toggleTextActive: { color: "#fff" },
  button: { paddingVertical: 10, borderRadius: 10, marginTop: -12, alignItems: "center" },
  buttonText: { color: "#000", fontWeight: "700", fontSize: 16 },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },
  deleteButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  routineContainer: { borderRadius: 10, padding: 12, marginTop: 8 },
  routineTitle: { fontWeight: "800", fontSize: 16, marginBottom: 6 },
  routineText: { fontSize: 14, marginVertical: 2, marginLeft: 4 },
  customContainer: { borderRadius: 12, padding: 16, marginTop: 10 },
  customTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10, textAlign: "center" },
  input: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  addButton: { paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  addButtonText: { color: "#000", fontWeight: "700", fontSize: 16 },
  uploadButton: { borderRadius: 8, paddingVertical: 10, alignItems: "center", marginBottom: 8 },
  preview: { width: 100, height: 100, borderRadius: 8, alignSelf: "center", marginBottom: 12 },
});
