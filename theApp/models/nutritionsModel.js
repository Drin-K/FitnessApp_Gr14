// models/nutritionsModel.js
export class NutritionGoal {
  constructor({
    name,
    calories,
    img = null,
    originalName,
    isActive = false,
    createdAt = null,
    createdAtReadable = null
  }) {
    this.name = name;
    this.calories = calories;
    this.img = img;
    this.originalName = originalName || name;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.createdAtReadable = createdAtReadable;
  }
}

export const nutritionGoalConverter = {
  toFirestore: (goal) => {
    // Krijoni një objekt të pastër pa vlera undefined
    const firestoreData = {
      name: goal.name,
      calories: goal.calories,
      originalName: goal.originalName,
      isActive: goal.isActive
    };

    // Shtoni fushat opsionale vetëm nëse ekzistojnë
    if (goal.img !== null && goal.img !== undefined) {
      firestoreData.img = goal.img;
    }

    if (goal.createdAt !== null && goal.createdAt !== undefined) {
      firestoreData.createdAt = goal.createdAt;
    }

    if (goal.createdAtReadable !== null && goal.createdAtReadable !== undefined) {
      firestoreData.createdAtReadable = goal.createdAtReadable;
    }

    return firestoreData;
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new NutritionGoal(data);
  }
};