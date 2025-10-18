// context/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';
import { COLORS } from '../constants/Theme';

const ThemeContext = createContext();

export const ThemeProvider = (props) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  return (
    <ThemeContext.Provider
      value={{ colors, toggleTheme, isDarkMode }}
    >
      {props.children}
    </ThemeContext.Provider>
  );
};


export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};