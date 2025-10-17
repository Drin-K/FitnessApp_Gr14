// constants/Theme.js
export const LightTheme = {
  // Backgrounds
  background: '#ffffff',
  card: '#f8f9fa',
  surface: '#ffffff', // ADD THIS - for bottom nav background
  
  // Text
  text: '#000000',
  textSecondary: '#666666',
  
  // Colors
  primary: '#06d68a',
  secondary: '#00ff88',
  accent: '#06d68a',
  
  // Borders & Shadows
  border: '#e0e0e0',
  shadow: '#000000',
  
  // Specific components
  ghostText: '#bfead0',
  subtitle: '#9fbfaa'
};

export const DarkTheme = {
  // Backgrounds
  background: '#000000',
  card: '#1a1a1a',
  surface: '#1a1a1a', // ADD THIS - for bottom nav background
  
  // Text
  text: '#ffffff',
  textSecondary: '#9fbfaa',
  
  // Colors
  primary: '#00ff88',
  secondary: '#06d68a',
  accent: '#00ff7f',
  
  // Borders & Shadows
  border: '#0c3f32',
  shadow: '#00ff7f',
  
  // Specific components
  ghostText: '#bfead0',
  subtitle: '#9fbfaa'
};

// Export as constants that can be used directly
export const COLORS = {
  light: LightTheme,
  dark: DarkTheme
};