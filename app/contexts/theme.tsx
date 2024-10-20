import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { dark, light } from '@/constants/CustomColor';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextProps {
  theme: typeof dark | typeof light;
  setDarkMode: (value: boolean) => void;
  darkMode: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const loadSettings = async () => {
      const storedDarkMode = await AsyncStorage.getItem('darkMode');

      setDarkMode(storedDarkMode === "darkMode");
    };

    loadSettings();
  }, [setDarkMode, AsyncStorage]);

  const handleDarkModeChange = async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem('darkMode', value ? "darkMode" : "");
  };

  const theme = darkMode ? dark : light;

  const value = useMemo(
    () => ({
      theme,
      darkMode,
      setDarkMode: handleDarkModeChange
    }),
    [darkMode, setDarkMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
