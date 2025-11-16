# 🏋️‍♂️ Fitness App

A modern Fitness & Health mobile application built using **React Native (Expo)**.  
The app helps users manage workouts, calculate BMI, track nutrition, follow diet plans,  
and customize their personal fitness profile – all inside a clean and intuitive UI.

---

## 👥 Group Members
- **Drin Kurti**
- **Bardh Tahiri**
- **Mehmet Mehmeti**      
- **Dion Haradinaj**  
- **Albin Bujupi**  
- **Enes Spahiu**

---

## 📌 Features

### 🏋️ Workout Management
- Predefined workouts  
- Add / Edit / Delete custom workouts  
- Workout session mode with timers and checklists  
- Local images + Base64 support for uploaded images  

### 🍎 Nutrition
- Weight Loss plan  
- Muscle Gain plan  
- Daily Energy plan  
- Nutrition list with details  

### ⚖️ BMI Calculation
- BMI formula  
- Health category interpretation  
- BmiResult component for clean output  

### 👤 User Account System
- Firebase Authentication  
- Signup / Login  
- Change Password  
- Edit Profile (Photo, Name, Height, Weight)  
- Real-time updates using **Firestore `onSnapshot()`**

### 🌙 Theme System
- Dark / Light mode  
- Handled via global **ThemeContext**

### ▶️ Navigation
- Expo Router  
- Layout file  
- Dynamic routes  

---

## 🚀 Technologies Used

### **Core**
- React Native  
- Expo  
- Expo Router  
- JavaScript (ES6+)  

### **Firebase**
- Firebase Auth  
- Firestore  
- Real-time listeners (onSnapshot)  

### **UI**
- LinearGradient  
- ScrollView  
- SafeAreaView  
- TouchableOpacity  
- FlatList  

### **Helpers**
- Base64 image picker  
- Expo ImagePicker  
- Custom Theme Context  

---

### 📁 **Project Structure**
- **app/**
  - `_layout.jsx`
  - `index.jsx`
  - `login.jsx`
  - `signup.jsx`
  - `profile.jsx`
  - `editProfile.jsx`
  - `changePassword.jsx`
  - `workouts.jsx`
  - `workoutsession.jsx`
  - `bmi.jsx`
  - `dailyenergy.jsx`
  - `musclegain.jsx`
  - `nutrition.jsx`
  - `weightloss.jsx`

- **assets/**
  - `images, icons, illustrations`

- **components/** 
  - `BmiResult.jsx`
  - `InputField.jsx`
  - `List.jsx`
  - `NutritionItem.jsx`
  - `ThemeToggle.jsx`
  - `WorkoutCard.jsx`

- **constants/**
  - `Theme.js`

- **context/**
  - `AuthContext.js`
  - `ThemeContext.jsx`

- **models/**
  - `bmiModel.js`
  - `nutritionsModel.js`
  - `workoutModel.js`

- **services/**
  - `authService.js`
  - `BMIService.js`
  - `nutritionsService.js`
  - `workoutService.js`
- `firebase.js`
- `app.json`
- `package-lock.json`
- `package.json`

---

## 🛠️ **Installation Guide**

Follow these steps to run the project from zero.

### **Install Node.js**
```sh
Download & install from:
👉 https://nodejs.org/
```

### **Clone the Project**
```sh
git clone https://github.com/Drin-K/FitnessApp_Gr14.git
```

### **Open the Project**
```sh
cd FitnessApp_Gr14/theApp
```

### **Install All Dependencies**
```sh
npm install
npm install firebase
expo install react-native-safe-area-context
```

### **Configure Firebase**
#### **Open firebase.js and paste your Firebase config:**
```sh
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```
---
## 🚀 **Running the App**
Start development server:
```sh
npm start
```
Then choose:
- "w" → run on Web
- "a" → Android emulator / real device
- "i" → iOS simulator (Mac only)
---
## 🧠 **Future Improvements**
- Full workout tracking per day
- Push notifications
- Weekly progress charts
---
## 📸 **Overview**
This app provides a clean, minimalistic, and responsive design that ensures smooth user experience on both Android and iOS devices.
