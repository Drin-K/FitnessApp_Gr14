// nutritionService.jsx
import { db } from "../firebase";
import { 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  collection 
} from "firebase/firestore";

import { NutritionGoal, nutritionGoalConverter } from "../models/nutritionsModel";

// ✅ Save a nutrition goal for a specific user
export const saveNutritionGoal = async (userId, goalData) => {
  const goal = new NutritionGoal(goalData);

  const ref = doc(
    db, 
    "users", 
    userId, 
    "nutritionGoals", 
    goal.name
  ).withConverter(nutritionGoalConverter);

  await setDoc(ref, goal);
  return goal;
};

// ✅ Get all saved goals for user
export const getNutritionGoals = async (userId) => {
  const ref = collection(
    db,
    "users",
    userId,
    "nutritionGoals"
  ).withConverter(nutritionGoalConverter);

  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => doc.data());
};

// ✅ Delete a saved goal
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
