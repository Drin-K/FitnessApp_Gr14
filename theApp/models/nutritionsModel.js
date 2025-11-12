// nutritionModel.jsx

// A simple model for how a nutrition plan looks in your Firestore
export class NutritionGoal {
  constructor({ name, calories, img = null, createdAt = Date.now() }) {
    this.name = name;
    this.calories = calories;
    this.img = img;
    this.createdAt = createdAt;
  }
}

// Firestore converter (optional but best practice)
export const nutritionGoalConverter = {
  toFirestore(goal) {
    return {
      name: goal.name,
      calories: goal.calories,
      img: goal.img || null,
      createdAt: goal.createdAt || Date.now(),
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
