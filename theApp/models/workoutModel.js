// workoutModel.js

// Model for a workout plan (for saving in Firestore)
export class Workout {
  constructor({
    id = null,
    title = "",
    duration = "",
    functionality = "",
    imageBase64 = null,       // <-- THELBËSORE
    routine = [],
    createdAt = Date.now(),
  }) {
    this.id = id;
    this.title = title;
    this.duration = duration;
    this.functionality = functionality;
    this.imageBase64 = imageBase64;  // <-- THELBËSORE
    this.routine = routine;
    this.createdAt = createdAt;
  }
}

// Firestore converter (best practice)
export const workoutConverter = {
  toFirestore(workout) {
    return {
      id: workout.id,
      title: workout.title,
      duration: workout.duration,
      functionality: workout.functionality,
      imageBase64: workout.imageBase64 || null, // <-- THELBËSORE
      routine: workout.routine || [],
      createdAt: workout.createdAt || Date.now(),
    };
  },

  fromFirestore(snapshot) {
    const data = snapshot.data();
    return new Workout({
      id: data.id ?? snapshot.id,   // <-- që id mos humbet
      title: data.title,
      duration: data.duration,
      functionality: data.functionality,
      imageBase64: data.imageBase64 ?? null, // <-- THELBËSORE
      routine: data.routine || [],
      createdAt: data.createdAt,
    });
  },
};
