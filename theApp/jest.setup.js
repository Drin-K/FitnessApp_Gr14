import "@testing-library/jest-native/extend-expect";

// Mock expo vector icons to avoid act warnings
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const MockIcon = (props) => React.createElement(Text, props, "Icon");
  return { Ionicons: MockIcon };
});
