import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path to your firebase initialization

const bmiCollection = collection(db, "bmis"); // Collection name 'bmis' – you can change it

export const createBMI = async (record) => {
  try {
    const docRef = await addDoc(bmiCollection, record);
    return { id: docRef.id, ...record };
  } catch (error) {
    console.error("Error creating BMI record:", error);
    throw error;
  }
};

export const readBMIs = async () => {
  try {
    const snapshot = await getDocs(bmiCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error reading BMI records:", error);
    throw error;
  }
};
export const deleteBMI = async (id) => {
  try {
    await deleteDoc(doc(db, "bmis", id));
  } catch (error) {
    console.error("Error deleting BMI record:", error);
    throw error;
  }
};