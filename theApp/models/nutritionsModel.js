// models/nutritionModel.jsx

// A simple model for how a nutrition plan looks in your Firestore
export class NutritionGoal {
  constructor({ name, calories, img = null, createdAt = Date.now() }) {
    this.name = name;
    this.calories = calories;
    this.img = img;
    this.createdAt = createdAt;

    // Format a readable date like "12 Nov 2025, 21:47"
    const date = new Date(createdAt);
    this.createdAtReadable = date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

// Firestore converter (best practice)
export const nutritionGoalConverter = {
  toFirestore(goal) {
    return {
      name: goal.name,
      calories: goal.calories,
      img: goal.img || null,
      createdAt: goal.createdAt,
      createdAtReadable: goal.createdAtReadable,
    };
  },

  fromFirestore(snapshot) {
    const data = snapshot.data();
    return new NutritionGoal({
      name: data.name,
      calories: data.calories,
      img: data.img,
      createdAt: data.createdAt,
    });
  },
};
