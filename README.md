# 🏋️‍♂️ Fitness Companion App

### 📱 Developed with React Native (Expo)

---

## 👥 Group Members
- **Drin Kurti**  
- **Bardh Tahiri**  
- **Mehmet Mehmeti**
- **Dion Haradinaj**  
- **Albin Bujupi**  
- **Enes Spahiu**

---

## 💡 Project Idea

The **Fitness Companion App** is a mobile application built using **React Native (Expo)** that helps users manage their fitness journey.  
It allows users to explore workout routines, track nutrition plans, calculate their **BMI (Body Mass Index)**, and set goals such as **weight loss**, **muscle gain**, or **daily energy maintenance**.

The goal of this app is to provide a simple, intuitive, and motivating environment for anyone who wants to improve their physical health and diet habits.

---

## ⚙️ Main Features

- 🏋️ **Workout Plans:** Explore categorized workout routines with easy navigation.  
- 🍎 **Nutrition Plans:** Choose a diet goal (Weight Loss, Muscle Gain, Daily Energy) and view recommended foods and nutrition tips.  
- ⚖️ **BMI Calculator:** Instantly calculate your BMI and get personalized feedback.  
- 👤 **User Profile:** Basic user signup and login flow for personalization.  
- 🌗 **Dark / Light Theme Support:** The app adapts its appearance using a custom Theme Context.

---

## 🧩 Components and Concepts Used

The app demonstrates the use of essential React Native and Expo components, including:

- **FlatList** → for displaying lists such as workout routines and nutrition items  
- **TextInput** → for user input fields in login and signup screens  
- **TouchableOpacity** → for interactive buttons and navigation  
- **StatusBar** → for managing the screen’s top status appearance  
- **SafeAreaView** → to ensure layouts fit safely within device boundaries  
- **ScrollView** → to handle vertical scrolling content in multiple screens  
- **LinearGradient** → for aesthetic gradient backgrounds  
- **useRouter (expo-router)** → for navigation between screens  
- **Custom Context (ThemeContext)** → to manage dark and light mode dynamically

---

## 📁 Project Structure

theApp/
├── app/
│ ├── _layout.jsx
│ ├── bmi.jsx
│ ├── dailyenergy.jsx
│ ├── index.jsx
│ ├── login.jsx
│ ├── musclegain.jsx
│ ├── nutrition.jsx
│ ├── profile.jsx
│ ├── signup.jsx
│ ├── weightloss.jsx
│ └── workouts.jsx
│ 
├── components/
│ ├── BmiResult.jsx
│ ├── InputField.jsx
│ ├── List.jsx
│ ├── NutritionItem.jsx
│ ├── ThemeToggle.jsx
│ └── WorkoutCard.jsx
│
├── assets/
├── context/
│ └── ThemeContext.jsx
│
|
├── app.json
├── package.json
└── README.md

---

## 🚀 Technologies Used
- **React Native (Expo)**
- **JavaScript (ES6+)**
- **Expo Router**
- **React Context API**
- **React Native Community Components**

---

## 🧠 Future Improvements
- Add **real-time nutrition tracking** via camera  
- Implement **backend using Firebase**  
- Integrate **cloud authentication and data sync**  

---

## 📸 Overview
This app provides a clean, minimalistic, and responsive design that ensures smooth user experience on both Android and iOS devices.  

---

> Built using **React Native + Expo** to make fitness more accessible and motivating.