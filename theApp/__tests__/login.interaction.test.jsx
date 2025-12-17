import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

// 1) Mock expo-router/useRouter
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
  }),
}));

// 2) Mock ThemeContext
jest.mock("../context/ThemeContext", () => ({
  useTheme: () => ({
    colors: {
      background: "#fff",
      primary: "#0a0",
      card: "#eee",
      border: "#ccc",
      text: "#111",
      textSecondary: "#666",
    },
    isDarkMode: false,
  }),
}));

// 3) Mock List component
jest.mock("../components/List", () => {
  const React = require("react");
  const { View } = require("react-native");
  return function MockList() {
    return React.createElement(View, null);
  };
});

// 4) Mock authService
const mockLoginUser = jest.fn();
jest.mock("../services/authService", () => ({
  loginUser: (...args) => mockLoginUser(...args),
  signUpUser: jest.fn(),
  logoutUser: jest.fn(),
  subscribeToAuthChanges: jest.fn(),
}));

// 5) Mock firebase.js
jest.mock("../firebase", () => ({
  auth: {},
  db: {},
}));

// 6) Mock firebase/auth used in login.jsx
jest.mock("firebase/auth", () => ({
  GoogleAuthProvider: function GoogleAuthProviderMock() {},
  signInWithPopup: jest.fn(() => Promise.resolve()),
}));

describe("Login interactions", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockLoginUser.mockClear();
  });

  test("shows validation errors when Sign In pressed with empty fields", async () => {
    const LoginScreen = require("../app/login").default;

    const { getByText, queryByText } = render(<LoginScreen />);

    fireEvent.press(getByText("Sign In"));

    // Must show these exact messages (based on your validate())
    expect(queryByText("Please enter your email.")).toBeTruthy();
    expect(queryByText("Please enter your password.")).toBeTruthy();

    // loginUser should NOT be called because validation fails
    expect(mockLoginUser).not.toHaveBeenCalled();
  });

  test("successful login calls loginUser and navigates to '/'", async () => {
    const LoginScreen = require("../app/login").default;

    mockLoginUser.mockResolvedValueOnce({ success: true, user: { uid: "1" } });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("Email address"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith("test@example.com", "123456");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("pressing Sign up navigates to /signup", () => {
    const LoginScreen = require("../app/login").default;

    const { getByText } = render(<LoginScreen />);

    // In your UI the inner clickable text is "Sign up"
    fireEvent.press(getByText("Sign up"));

    expect(mockPush).toHaveBeenCalledWith("/signup");
  });
});
