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

// ✅ Save a workout plan for a specific user
export const saveWorkout = async (userId, workoutData) => {
  const workout = new Workout(workoutData);

  const ref = doc(
    db,
    "users",
    userId,
    "workouts",
    workout.title
  ).withConverter(workoutConverter);

  await setDoc(ref, workout);
  return workout;
};

// ✅ Get all saved workouts for a user
export const getWorkouts = async (userId) => {
  const ref = collection(db, "users", userId, "workouts").withConverter(workoutConverter);

  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => doc.data());
};

// ✅ Delete a workout plan
export const deleteWorkout = async (userId, workoutTitle) => {
  const ref = doc(db, "users", userId, "workouts", workoutTitle);
  await deleteDoc(ref);
};

// ✅ Update an existing workout plan
export const updateWorkout = async (userId, workoutTitle, newData) => {
  const ref = doc(db, "users", userId, "workouts", workoutTitle).withConverter(workoutConverter);
  await setDoc(ref, { ...newData }, { merge: true });
};
