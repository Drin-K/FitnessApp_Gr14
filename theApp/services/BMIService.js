import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { bmiConverter, BMIRecord } from "../models/bmiModel";
import { auth } from "../firebase";

const bmiCollection = collection(db, "bmis");

export const createBMI = async (recordData) => {
  // userId është null nëse s'je loguar
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  const record = new BMIRecord({
    ...recordData,
    userId,
  });

  try {
    const docRef = await addDoc(bmiCollection, bmiConverter.toFirestore(record));
    return new BMIRecord({
      ...record,
      id: docRef.id,
    });
  } catch (error) {
    console.error("Error creating BMI:", error);
    throw error;
  }
};

export const readBMIs = async () => {
  const user = auth.currentUser;
  if (!user) return []; // ⬅️ Nëse sje loguar, mos kthe kurgjë

  try {
    const q = query(bmiCollection, where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => bmiConverter.fromFirestore(docSnap));
  } catch (error) {
    console.error("Error reading BMI:", error);
    throw error;
  }
};

export const deleteBMI = async (id) => {
  try {
    await deleteDoc(doc(db, "bmis", id));
  } catch (error) {
    console.error("Error deleting BMI:", error);
    throw error;
  }
};
