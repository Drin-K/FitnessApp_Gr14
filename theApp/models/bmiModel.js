// bmiModel.js

export class BMIRecord {
  constructor({
    id = null,
    gender = null,
    height = 0,
    weight = 0,
    age = 0,
    bmi = 0,
    date = Date.now(),
    userId = null, // ⬅️ shumë e rëndësishme për dallimin loguar / jo-loguar
  }) {
    this.id = id;
    this.gender = gender;
    this.height = height;
    this.weight = weight;
    this.age = age;
    this.bmi = bmi;
    this.date = date;
    this.userId = userId; // ⬅️ null = not logged in
  }
}

// Firestore converter
export const bmiConverter = {
  toFirestore(record) {
    return {
      gender: record.gender,
      height: record.height,
      weight: record.weight,
      age: record.age,
      bmi: record.bmi,
      date: record.date,
      userId: record.userId ?? null,
    };
  },

  fromFirestore(snapshot) {
    const data = snapshot.data();
    return new BMIRecord({
      id: snapshot.id,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      age: data.age,
      bmi: data.bmi,
      date: data.date,
      userId: data.userId ?? null,
    });
  },
};
