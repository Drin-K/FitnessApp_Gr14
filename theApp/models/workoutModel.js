// workoutModel.js

// Model for a workout plan (for saving in Firestore)
export class Workout {
  constructor({
    title,
    duration,
    functionality,
    image = null,
    routine = [],
    createdAt = Date.now(),
  }) {
    this.title = title;
    this.duration = duration;
    this.functionality = functionality;
    this.image = image;
    this.routine = routine;
    this.createdAt = createdAt;
  }
}

// Firestore converter (best practice)
export const workoutConverter = {
  toFirestore(workout) {
    return {
      title: workout.title,
      duration: workout.duration,
      functionality: workout.functionality,
      image: workout.image || null,
      routine: workout.routine || [],
      createdAt: workout.createdAt || Date.now(),
    };
  },

  fromFirestore(snapshot) {
    const data = snapshot.data();
    return new Workout({
      title: data.title,
      duration: data.duration,
      functionality: data.functionality,
      image: data.image,
      routine: data.routine,
      createdAt: data.createdAt,
    });
  },
};
