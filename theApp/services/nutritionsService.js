// services/nutritionsService.js
import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  writeBatch,
  updateDoc
} from "firebase/firestore";
import { NutritionGoal, nutritionGoalConverter } from "../models/nutritionsModel";

const slugify = (text = "") => {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\_]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "") || `goal-${Date.now()}`;
};

export const saveNutritionGoal = async (userId, goalData) => {
  try {
    const userGoalsCollection = collection(db, "users", userId, "nutritionGoals");

    // Deactivate other goals if this one is active
    if (goalData.isActive) {
      const snapshot = await getDocs(userGoalsCollection.withConverter(nutritionGoalConverter));
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach(docSnap => {
          const ref = doc(db, "users", userId, "nutritionGoals", docSnap.id);
          batch.set(ref, { isActive: false }, { merge: true });
        });
        await batch.commit();
      }
    }

    // Generate unique ID
    const id = goalData.id ? goalData.id : `${slugify(goalData.name)}-${Date.now()}`;

    const goal = new NutritionGoal({
      name: goalData.name,
      calories: goalData.calories,
      img: goalData.img || null,
      originalName: goalData.originalName || goalData.name,
      isActive: !!goalData.isActive,
      Breakfast: goalData.Breakfast || "",
      Lunch: goalData.Lunch || "",
      Dinner: goalData.Dinner || "",
      Snacks: goalData.Snacks || "",
      mealLevels: goalData.mealLevels || { // Shto këtë
        Breakfast: 'Beginner',
        Lunch: 'Beginner',
        Dinner: 'Beginner',
        Snacks: 'Beginner',
      },
      tips: goalData.tips || [], // Shto këtë
      createdAt: new Date(),
      updatedAt: new Date(), // Shto updatedAt
      createdAtReadable: new Date().toLocaleString()
    });

    const goalRef = doc(db, "users", userId, "nutritionGoals", id).withConverter(nutritionGoalConverter);
    await setDoc(goalRef, goal);

    return { id, ...goal };
  } catch (error) {
    console.error("Error saving nutrition goal:", error);
    throw error;
  }
};

// Në services/nutritionsService.js - kontrollo këto funksione:
export const updateNutritionGoal = async (userId, goalId, data) => {
  try {
    const goalRef = doc(db, "users", userId, "nutritionGoals", goalId);
    await updateDoc(goalRef, {
      ...data,
      lastUpdated: new Date() // Shto këtë field
    });
    console.log("✅ Goal updated in Firebase:", goalId);
    return true;
  } catch (error) {
    console.error("❌ Error updating goal:", error);
    throw error;
  }
};

export const getNutritionGoals = async (userId) => {
  try {
    const goalsRef = collection(db, "users", userId, "nutritionGoals");
    const snapshot = await getDocs(goalsRef);
    const goals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log("✅ Goals retrieved from Firebase:", goals.length);
    return goals;
  } catch (error) {
    console.error("❌ Error getting goals:", error);
    return [];
  }
};

// Shto këtë funksion për fshirje
export const deleteNutritionGoal = async (userId, goalId) => {
  try {
    const goalRef = doc(db, "users", userId, "nutritionGoals", goalId);
    await deleteDoc(goalRef);
    return true;
  } catch (error) {
    console.error("Error deleting nutrition goal:", error);
    throw error;
  }
};