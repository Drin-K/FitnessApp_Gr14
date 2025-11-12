// services/nutritionService.jsx
import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection
} from "firebase/firestore";
import { NutritionGoal, nutritionGoalConverter } from "../models/nutritionsModel";

// ✅ Save a single active nutrition goal per user
export const saveNutritionGoal = async (userId, goalData) => {
  try {
    // Step 1️⃣: Reference the nutritionGoals collection
    const userGoalsRef = collection(db, "users", userId, "nutritionGoals");
    const snapshot = await getDocs(userGoalsRef);

    // Step 2️⃣: Delete all existing goals first
    if (!snapshot.empty) {
      const deletions = snapshot.docs.map(async (goalDoc) => {
        await deleteDoc(goalDoc.ref);
      });
      await Promise.all(deletions);
      console.log("🗑️ Previous nutrition goals deleted.");
    }

    // Step 3️⃣: Create and save the new goal
    const goal = new NutritionGoal(goalData);
    const goalRef = doc(
      db,
      "users",
      userId,
      "nutritionGoals",
      goal.name
    ).withConverter(nutritionGoalConverter);

    await setDoc(goalRef, goal);
    console.log("✅ New nutrition goal saved:", goal.name);
    return goal;
  } catch (error) {
    console.error("❌ Error saving nutrition goal:", error);
    throw error;
  }
};

// ✅ Fetch user's saved goal(s)
export const getNutritionGoals = async (userId) => {
  const ref = collection(db, "users", userId, "nutritionGoals")
    .withConverter(nutritionGoalConverter);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => doc.data());
};

// ✅ Delete a specific goal manually
export const deleteNutritionGoal = async (userId, goalName) => {
  const ref = doc(db, "users", userId, "nutritionGoals", goalName);
  await deleteDoc(ref);
};

// ✅ Update an existing goal
export const updateNutritionGoal = async (userId, goalName, newData) => {
  const ref = doc(
    db,
    "users",
    userId,
    "nutritionGoals",
    goalName
  ).withConverter(nutritionGoalConverter);
  await setDoc(ref, { ...newData }, { merge: true });
};
