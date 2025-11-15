// services/nutritionsService.js
import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { NutritionGoal, nutritionGoalConverter } from "../models/nutritionsModel";

/**
 * Helper: slugify name -> safe doc id
 */
const slugify = (text = "") => {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\_]+/g, "-")
    .replace(/[^\w\-]+/g, "") // remove non-word chars
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "") || `goal-${Date.now()}`;
};

/**
 * Save a nutrition goal.
 */
export const saveNutritionGoal = async (userId, goalData) => {
  try {
    const userGoalsCollection = collection(db, "users", userId, "nutritionGoals");

    // If marking as active, deactivate others
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

    // Determine doc id
    const id = goalData.id ? goalData.id : slugify(goalData.name);

    const goal = new NutritionGoal({
      name: goalData.name,
      calories: goalData.calories,
      img: goalData.img || null,
      originalName: goalData.originalName || goalData.name,
      isActive: !!goalData.isActive,
      createdAt: new Date(), // Use regular Date instead of serverTimestamp
      createdAtReadable: new Date().toLocaleString()
    });

    const goalRef = doc(db, "users", userId, "nutritionGoals", id).withConverter(nutritionGoalConverter);
    
    // Use setDoc without merge for new documents
    await setDoc(goalRef, goal);

    // Return representation including the id
    return { id, ...goal };
  } catch (error) {
    console.error("❌ Error saving nutrition goal:", error);
    throw error;
  }
};

/**
 * Get all nutrition goals for a user.
 */
export const getNutritionGoals = async (userId) => {
  try {
    const ref = collection(db, "users", userId, "nutritionGoals").withConverter(nutritionGoalConverter);
    const snapshot = await getDocs(ref);

    const goals = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data
      };
    });

    // Sort: active first, then by createdAtReadable (newest first)
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
    console.error("❌ Error fetching nutrition goals:", error);
    return [];
  }
};

/**
 * Delete a specific goal by document id.
 */
export const deleteNutritionGoal = async (userId, goalId) => {
  try {
    const ref = doc(db, "users", userId, "nutritionGoals", goalId);
    await deleteDoc(ref);
    console.log("🗑️ Nutrition goal deleted:", goalId);
    return true;
  } catch (error) {
    console.error("❌ Error deleting nutrition goal:", error);
    throw error;
  }
};

/**
 * Update an existing goal (by document id).
 */
export const updateNutritionGoal = async (userId, goalId, newData) => {
  try {
    const isActive = typeof newData.isActive === "boolean" ? newData.isActive : false;
    const oldId = goalId;
    const newIdCandidate = slugify(newData.name);

    // If rename to a different slug-id => create new doc and delete old one
    if (oldId !== newIdCandidate) {
      // If new should be active, deactivate others first
      if (isActive) {
        const goalsRef = collection(db, "users", userId, "nutritionGoals").withConverter(nutritionGoalConverter);
        const snapshot = await getDocs(goalsRef);
        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.docs.forEach(docSnap => {
            const ref = doc(db, "users", userId, "nutritionGoals", docSnap.id);
            batch.set(ref, { isActive: false }, { merge: true });
          });
          await batch.commit();
        }
      }

      const newGoal = new NutritionGoal({
        name: newData.name,
        calories: newData.calories,
        img: newData.img || null,
        originalName: newData.originalName || newData.name,
        isActive: isActive,
        createdAt: new Date(), // Use regular Date
        createdAtReadable: new Date().toLocaleString()
      });

      const newGoalRef = doc(db, "users", userId, "nutritionGoals", newIdCandidate).withConverter(nutritionGoalConverter);
      await setDoc(newGoalRef, newGoal);

      // Delete old doc
      const oldGoalRef = doc(db, "users", userId, "nutritionGoals", oldId);
      await deleteDoc(oldGoalRef);

      return { id: newIdCandidate, ...newGoal };
    } else {
      // Update in place (merge) - Only update specific fields
      const goalRef = doc(db, "users", userId, "nutritionGoals", oldId);

      // If becoming active, deactivate others first
      if (isActive) {
        const goalsRef = collection(db, "users", userId, "nutritionGoals").withConverter(nutritionGoalConverter);
        const snapshot = await getDocs(goalsRef);
        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.docs.forEach(docSnap => {
            const ref = doc(db, "users", userId, "nutritionGoals", docSnap.id);
            batch.set(ref, { isActive: false }, { merge: true });
          });
          await batch.commit();
        }
      }

      // Prepare update data - only include fields that are provided
      const updateData = {
        name: newData.name,
        calories: newData.calories,
        isActive: isActive
      };

      // Only add these fields if they are provided
      if (newData.img !== undefined) updateData.img = newData.img;
      if (newData.originalName !== undefined) updateData.originalName = newData.originalName;

      await setDoc(goalRef, updateData, { merge: true });
      return { id: oldId, ...updateData };
    }
  } catch (error) {
    console.error("❌ Error updating nutrition goal:", error);
    throw error;
  }
};

/**
 * Set a goal as active (by id) and deactivate others.
 */
export const setActiveNutritionGoal = async (userId, goalId) => {
  try {
    const goalsRef = collection(db, "users", userId, "nutritionGoals").withConverter(nutritionGoalConverter);
    const snapshot = await getDocs(goalsRef);

    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach(docSnap => {
        const id = docSnap.id;
        const ref = doc(db, "users", userId, "nutritionGoals", id);
        const shouldBeActive = !!goalId && id === goalId;
        batch.set(ref, { isActive: shouldBeActive }, { merge: true });
      });
      await batch.commit();
    }

    console.log("✅ Active goal set to:", goalId);
  } catch (error) {
    console.error("❌ Error setting active goal:", error);
    throw error;
  }
};

/**
 * Toggle: if a goal exists -> delete, else -> save it (set active).
 */
export const toggleNutritionGoal = async (userId, goalData) => {
  try {
    const existingGoals = await getNutritionGoals(userId);
    const existing = existingGoals.find(g => g.name === goalData.name || g.originalName === goalData.originalName);

    if (existing) {
      await deleteNutritionGoal(userId, existing.id);
      return null;
    } else {
      return await saveNutritionGoal(userId, { ...goalData, isActive: true });
    }
  } catch (error) {
    console.error("❌ Error toggling nutrition goal:", error);
    throw error;
  }
};

/**
 * Delete ALL nutrition goals for a user
 */
export const deleteAllNutritionGoals = async (userId) => {
  try {
    const goalsRef = collection(db, "users", userId, "nutritionGoals");
    const snapshot = await getDocs(goalsRef);
    
    const deletionPromises = snapshot.docs.map(async (goalDoc) => {
      await deleteDoc(goalDoc.ref);
    });
    
    await Promise.all(deletionPromises);
    console.log("🗑️ All nutrition goals deleted for user:", userId);
    return true;
  } catch (error) {
    console.error("❌ Error deleting all nutrition goals:", error);
    throw error;
  }
};