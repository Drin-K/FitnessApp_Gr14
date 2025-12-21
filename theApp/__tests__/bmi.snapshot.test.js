import React from "react";
import { render } from "@testing-library/react-native";

// SafeAreaView -> View
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }) =>
      React.createElement(View, props, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock Slider -> View (prevents native crash)
jest.mock("@react-native-community/slider", () => {
  const React = require("react");
  const { View } = require("react-native");
  return function MockSlider(props) {
    return React.createElement(View, { ...props, testID: "mockSlider" });
  };
});

// Mock Alert (so it doesn't show real alert)
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

// Mock ThemeContext
jest.mock("../context/ThemeContext", () => ({
  useTheme: () => ({
    colors: {
      background: "#ffffff",
      primary: "#00aa66",
      card: "#f4f4f4",
      border: "#dddddd",
      text: "#111111",
      textSecondary: "#666666",
    },
    isDarkMode: false,
  }),
}));

// Mock footer List
jest.mock("../components/List", () => {
  const React = require("react");
  const { View } = require("react-native");
  return function MockList() {
    return React.createElement(View, null);
  };
});

// Mock BmiResult (optional but makes snapshot smaller/cleaner)
jest.mock("../components/BmiResult", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function MockBmiResult() {
    return React.createElement(
      View,
      null,
      React.createElement(Text, null, "BmiResult")
    );
  };
});

// Mock BMIService (prevents any Firestore access)
jest.mock("../services/BMIService", () => ({
  createBMI: jest.fn(),
  readBMIs: jest.fn(async () => []),
  deleteBMI: jest.fn(),
}));

// Mock firebase auth user (guest by default => no history loading)
jest.mock("../firebase", () => ({
  auth: { currentUser: null },
  db: {},
}));

test("BMI snapshot matches snapshot", () => {
  // ✅ CHANGE THIS path if your file is elsewhere
  // Examples:
  // const BMI = require("../app/BMI").default;
  // const BMI = require("../app/(tabs)/bmi").default;
  const BMI = require("../app/bmi").default;

  const { toJSON } = render(<BMI />);
  expect(toJSON()).not.toBeNull();
  expect(toJSON()).toMatchSnapshot();
});
