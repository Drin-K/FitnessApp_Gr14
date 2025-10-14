import React, { useState } from "react";
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
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import WorkoutCard from "../components/WorkoutCard";
import * as ImagePicker from "expo-image-picker";
import List from "../components/list";

// 👇 moved into state inside component (so we can update it)
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

  // 👇 use state for workouts
  const [workouts, setWorkouts] = useState(initialWorkouts);

  // Custom workout form state
  const [customTitle, setCustomTitle] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customRoutine, setCustomRoutine] = useState("");
  const [image, setImage] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddCustom = () => {
    if (!customTitle.trim() || !customRoutine.trim()) return Alert.alert("Error", "Please fill all fields.");

    const newWorkout = {
      id: (workouts.length + 1).toString(),
      title: customTitle,
      duration: customDuration || "30 min",
      functionality: customDescription,
      image: image ? { uri: image } : require("../assets/images/workout1.jpg"), // fallback image
      routine: customRoutine.split("\n").filter((r) => r.trim() !== ""),
    };

    setWorkouts([...workouts, newWorkout]);
    setCustomTitle("");
    setCustomDuration("");
    setCustomRoutine("");
    setCustomDescription("");
    setImage(null);
    setActiveTab("Workouts");
    Alert.alert("Success", "✅ Workout added successfully");
  };

 return (
  <SafeAreaView
    style={[
      styles.container, 
      { 
        backgroundColor: colors.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 
      }
    ]}
  >
    <StatusBar 
      barStyle={isDarkMode ? "light-content" : "dark-content"}
      backgroundColor={colors.background}
      translucent={false} 
    />
    
    <View style={styles.content}>
      {/* Header */}
      <Text style={[styles.header, { color: colors.primary }]}>Plans</Text>

      {/* Toggle Switch */}
      <View style={[
        styles.toggleContainer, 
        { backgroundColor: colors.card }
      ]}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "Workouts" && [styles.toggleActive, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveTab("Workouts")}
        >
          <Text
            style={[
              styles.toggleText,
              { color: colors.text },
              activeTab === "Workouts" && styles.toggleTextActive
            ]}
          >
            Workouts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "Custom" && [styles.toggleActive, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveTab("Custom")}
        >
          <Text
            style={[
              styles.toggleText,
              { color: colors.text },
              activeTab === "Custom" && styles.toggleTextActive
            ]}
          >
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      {/* Workouts Section */}
      {activeTab === "Workouts" ? (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 45 }}>
              <WorkoutCard
                title={item.title}
                duration={item.duration}
                functionality={item.functionality}
                image={item.image}
              />
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => toggleExpand(item.id)}
              >
                <Text style={styles.buttonText}>
                  {expandedId === item.id ? "Hide Workout" : "See Workout"}
                </Text>
              </TouchableOpacity>

              {expandedId === item.id && (
                <View style={[styles.routineContainer, { backgroundColor: colors.card }]}>
                  <Text style={[styles.routineTitle, { color: colors.primary }]}>
                    Workout Routine
                  </Text>
                  {item.routine.map((routine, index) => (
                    <Text key={index} style={[styles.routineText, { color: colors.textSecondary }]}>
                      • {routine}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListHeaderComponent={<View />} // Empty header to maintain spacing
        />
      ) : (
        // Custom Workout Section - Now wrapped in ScrollView since it's not a FlatList
        <ScrollView 
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.customContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.customTitle, { color: colors.primary }]}>
              Create Custom Workout
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface || '#222', 
                color: colors.text,
                borderColor: colors.border 
              }]}
              placeholder="Workout Title"
              placeholderTextColor={colors.textSecondary}
              value={customTitle}
              onChangeText={setCustomTitle}
            />
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface || '#222', 
                color: colors.text,
                borderColor: colors.border 
              }]}
              placeholder="Duration (e.g. 30 min)"
              placeholderTextColor={colors.textSecondary}
              value={customDuration}
              onChangeText={setCustomDuration}
            />
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface || '#222', 
                color: colors.text,
                borderColor: colors.border 
              }]}
              placeholder="Description"
              placeholderTextColor={colors.textSecondary}q
              value={customDescription}
              onChangeText={setCustomDescription}
            />
            <TextInput
              style={[styles.input, { 
                height: 100, 
                backgroundColor: colors.surface || '#222', 
                color: colors.text,
                borderColor: colors.border 
              }]}
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
              onPress={handleAddCustom}
            >
              <Text style={styles.addButtonText}>Add Custom Workout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
    
    <List onNavigate={(p) => router.push(p)} />
  </SafeAreaView>
);
};

export default Workouts;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  content: { 
    paddingHorizontal: 16 
  },
   scroll: { 
    padding: 20 
  },
  header: { 
    fontSize: 28, 
    fontWeight: "900", 
    textAlign: "center", 
    marginTop: 10, 
    letterSpacing: 1 
  },
  toggleContainer: { 
    flexDirection: "row", 
    borderRadius: 30, 
    marginTop: 20, 
    marginBottom: 15, 
    overflow: "hidden" 
  },
  toggleButton: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  toggleActive: { 
    borderRadius: 30 
  },
  toggleText: { 
    fontWeight: "700", 
    fontSize: 16 
  },
  toggleTextActive: { 
    color: "#fff" 
  },
  button: { 
    paddingVertical: 10, 
    borderRadius: 10, 
    marginTop: -12, 
    alignItems: "center" 
  },
  buttonText: { 
    color: "#000", 
    fontWeight: "700", 
    fontSize: 16 
  },
  routineContainer: { 
    borderRadius: 10, 
    padding: 12, 
    marginTop: 8 
  },
  routineTitle: { 
    fontWeight: "800", 
    fontSize: 16, 
    marginBottom: 6 
  },
  routineText: { 
    fontSize: 14, 
    marginVertical: 2, 
    marginLeft: 4 
  },
  customContainer: { 
    borderRadius: 12, 
    padding: 16, 
    marginTop: 10 
  },
  customTitle: { 
    fontSize: 18, 
    fontWeight: "800", 
    marginBottom: 10, 
    textAlign: "center" 
  },
  input: { 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    marginBottom: 12, 
    fontSize: 14,
    borderWidth: 1
  },
  addButton: { 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: "center" 
  },
  addButtonText: { 
    color: "#000", 
    fontWeight: "700", 
    fontSize: 16 
  },
  uploadButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 12,
  }
});