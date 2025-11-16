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

export const getNutritionGoals = async (userId) => {
  try {
    const ref = collection(db, "users", userId, "nutritionGoals").withConverter(nutritionGoalConverter);
    const snapshot = await getDocs(ref);

    const goals = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Sigurohu që mealLevels ekziston
        mealLevels: data.mealLevels || {
          Breakfast: 'Beginner',
          Lunch: 'Beginner',
          Dinner: 'Beginner',
          Snacks: 'Beginner',
        }
      };
    });

    goals.sort((a, b) => {
      if ((a.isActive || false) === (b.isActive || false)) {
        const aTime = a.createdAtReadable ? new Date(a.createdAtReadable).getTime() : 0;
        const bTime = b.createdAtReadable ? new Date(b.createdAtReadable).getTime() : 0;
        return bTime - aTime;
      }
      return a.isActive ? -1 : 1;
    });

    return goals;
  } catch (error) {
    console.error("Error fetching nutrition goals:", error);
    return [];
  }
};

export const updateNutritionGoal = async (userId, goalId, newData) => {
  try {
    const isActive = typeof newData.isActive === "boolean" ? newData.isActive : false;
    const oldId = goalId;
    
    // Përdor ID ekzistues, mos e ndrysho kur përditëson
    const newId = oldId;

    if (isActive) {
      // Deactivate other goals
      const goalsRef = collection(db, "users", userId, "nutritionGoals").withConverter(nutritionGoalConverter);
      const snapshot = await getDocs(goalsRef);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach(docSnap => {
          if (docSnap.id !== oldId) {
            const ref = doc(db, "users", userId, "nutritionGoals", docSnap.id);
            batch.set(ref, { isActive: false }, { merge: true });
          }
        });
        await batch.commit();
      }
    }

    // Përditëso dokumentin ekzistues
    const updateData = {
      name: newData.name,
      calories: newData.calories,
      isActive: isActive,
      Breakfast: newData.Breakfast || "",
      Lunch: newData.Lunch || "",
      Dinner: newData.Dinner || "",
      Snacks: newData.Snacks || "",
      mealLevels: newData.mealLevels || { // Shto këtë
        Breakfast: 'Beginner',
        Lunch: 'Beginner',
        Dinner: 'Beginner',
        Snacks: 'Beginner',
      },
      tips: newData.tips || [], // Shto këtë
      updatedAt: new Date(), // Shto updatedAt
    };

    if (newData.img !== undefined) updateData.img = newData.img;
    if (newData.originalName !== undefined) updateData.originalName = newData.originalName;

    const goalRef = doc(db, "users", userId, "nutritionGoals", oldId);
    await updateDoc(goalRef, updateData);
    
    return { id: oldId, ...updateData };
  } catch (error) {
    console.error("Error updating nutrition goal:", error);
    throw error;
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