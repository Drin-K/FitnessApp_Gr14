import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

// ---------- MOCKS ----------

// router
const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: (...args) => mockReplace(...args),
    push: (...args) => mockPush(...args),
    back: (...args) => mockBack(...args),
  }),
}));

// theme
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

// authService
const mockSignUpUser = jest.fn();
jest.mock("../services/authService", () => ({
  signUpUser: (...args) => mockSignUpUser(...args),
}));

// import Signup AFTER mocks
const Signup = require("../app/signup").default;

// ---------- TESTS ----------

describe("Signup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form elements correctly", () => {
    const { getAllByText, getByPlaceholderText } = render(<Signup />);

    const [title, buttonText] = getAllByText("Create Account");
    expect(title).toBeTruthy();
    expect(buttonText).toBeTruthy();

    expect(getByPlaceholderText("Enter your full name")).toBeTruthy();
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Create a password")).toBeTruthy();
    expect(getByPlaceholderText("Confirm your password")).toBeTruthy();

    expect(getAllByText("Already have an account?")[0]).toBeTruthy();
    expect(getAllByText(" Sign In")[0]).toBeTruthy();
  });

  it("updates inputs when user types", () => {
    const { getByPlaceholderText } = render(<Signup />);

    fireEvent.changeText(getByPlaceholderText("Enter your full name"), "John Doe");
    fireEvent.changeText(getByPlaceholderText("Enter your email"), "john@site.com");
    fireEvent.changeText(getByPlaceholderText("Create a password"), "123456");
    fireEvent.changeText(getByPlaceholderText("Confirm your password"), "123456");

    expect(getByPlaceholderText("Enter your full name").props.value).toBe("John Doe");
    expect(getByPlaceholderText("Enter your email").props.value).toBe("john@site.com");
    expect(getByPlaceholderText("Create a password").props.value).toBe("123456");
    expect(getByPlaceholderText("Confirm your password").props.value).toBe("123456");
  });

  it("shows error when full name is empty", () => {
    const { getAllByText, getByText } = render(<Signup />);

    fireEvent.press(getAllByText("Create Account")[1]);

    expect(getByText("Please enter your full name.")).toBeTruthy();
  });

  it("shows error when email is invalid", () => {
    const { getAllByText, getByPlaceholderText, getByText } = render(<Signup />);

    fireEvent.changeText(getByPlaceholderText("Enter your full name"), "John Doe");
    fireEvent.changeText(getByPlaceholderText("Enter your email"), "badEmail");
    fireEvent.changeText(getByPlaceholderText("Create a password"), "123456");
    fireEvent.changeText(getByPlaceholderText("Confirm your password"), "123456");

    fireEvent.press(getAllByText("Create Account")[1]);

    expect(getByText("Please enter a valid email.")).toBeTruthy();
  });

  it("shows error when password is less than 6 chars", () => {
    const { getAllByText, getByPlaceholderText, getByText } = render(<Signup />);

    fireEvent.changeText(getByPlaceholderText("Enter your full name"), "John Doe");
    fireEvent.changeText(getByPlaceholderText("Enter your email"), "john@site.com");
    fireEvent.changeText(getByPlaceholderText("Create a password"), "12345");
    fireEvent.changeText(getByPlaceholderText("Confirm your password"), "12345");

    fireEvent.press(getAllByText("Create Account")[1]);

    expect(getByText("Password must be at least 6 characters.")).toBeTruthy();
  });

  it("shows error when passwords do not match", () => {
    const { getAllByText, getByPlaceholderText, getByText } = render(<Signup />);

    fireEvent.changeText(getByPlaceholderText("Enter your full name"), "John Doe");
    fireEvent.changeText(getByPlaceholderText("Enter your email"), "john@site.com");
    fireEvent.changeText(getByPlaceholderText("Create a password"), "123456");
    fireEvent.changeText(getByPlaceholderText("Confirm your password"), "1234567");

    fireEvent.press(getAllByText("Create Account")[1]);

    expect(getByText("Passwords do not match.")).toBeTruthy();
  });

  it("calls signUpUser and navigates to '/' on success", async () => {
    mockSignUpUser.mockResolvedValueOnce({ success: true, user: { uid: "123" } });

    const { getAllByText, getByPlaceholderText } = render(<Signup />);

    fireEvent.changeText(getByPlaceholderText("Enter your full name"), "John Doe");
    fireEvent.changeText(getByPlaceholderText("Enter your email"), "john@site.com");
    fireEvent.changeText(getByPlaceholderText("Create a password"), "123456");
    fireEvent.changeText(getByPlaceholderText("Confirm your password"), "123456");

    fireEvent.press(getAllByText("Create Account")[1]);

    await waitFor(() => {
      expect(mockSignUpUser).toHaveBeenCalledWith(
        "John Doe",
        "",
        "john@site.com",
        "123456"
      );
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("shows backend error message on signUpUser failure", async () => {
    mockSignUpUser.mockResolvedValueOnce({
      success: false,
      message: "This email is already in use.",
    });

    const { getAllByText, getByPlaceholderText, getByText } = render(<Signup />);

    fireEvent.changeText(getByPlaceholderText("Enter your full name"), "John Doe");
    fireEvent.changeText(getByPlaceholderText("Enter your email"), "john@site.com");
    fireEvent.changeText(getByPlaceholderText("Create a password"), "123456");
    fireEvent.changeText(getByPlaceholderText("Confirm your password"), "123456");

    fireEvent.press(getAllByText("Create Account")[1]);

    await waitFor(() => {
      expect(getByText("This email is already in use.")).toBeTruthy();
    });
  });

  it('navigates to "/login" when Sign In is pressed', () => {
    const { getByText } = render(<Signup />);

    fireEvent.press(getByText(" Sign In"));
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("goes back when Back button is pressed", () => {
    const { getByText } = render(<Signup />);

    fireEvent.press(getByText("← Back"));
    expect(mockBack).toHaveBeenCalled();
  });
});
