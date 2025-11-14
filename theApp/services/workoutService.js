// workoutService.js
import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
} from "firebase/firestore";

import { Workout, workoutConverter } from "../models/workoutModel";

// 🔥 CREATE or UPDATE workout (always uses workout.id as key)
export const saveWorkout = async (userId, workoutData) => {
  const workout = new Workout(workoutData);

  // Ensure every workout ALWAYS has a unique ID
  if (!workout.id) {
    workout.id = `workout-${Date.now()}`;
  }

  const ref = doc(
    db,
    "users",
    userId,
    "workouts",
    workout.id
  ).withConverter(workoutConverter);

  await setDoc(ref, workout, { merge: true });
  return workout;
};

// 🔥 GET workouts (ensures ID is included)
export const getWorkouts = async (userId) => {
  const ref = collection(
    db,
    "users",
    userId,
    "workouts"
  ).withConverter(workoutConverter);

  const snapshot = await getDocs(ref);

  return snapshot.docs.map((doc) => ({
    id: doc.id,      // <– SUPER IMPORTANT FIX
    ...doc.data(),
  }));
};

// 🔥 DELETE by ID (NOT by title)
export const deleteWorkout = async (userId, workoutId) => {
  const ref = doc(db, "users", userId, "workouts", workoutId);
  await deleteDoc(ref);
};

// 🔥 UPDATE workout
export const updateWorkout = async (userId, workoutId, newData) => {
  const ref = doc(
    db,
    "users",
    userId,
    "workouts",
    workoutId
  ).withConverter(workoutConverter);

  await setDoc(ref, newData, { merge: true });
};
