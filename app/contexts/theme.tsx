import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextProps {
  theme: typeof MD3DarkTheme | typeof MD3LightTheme;
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
  }, []);

  const handleDarkModeChange = async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem('darkMode', value ? "darkMode" : "");
  };

  const theme = darkMode ? MD3DarkTheme : MD3LightTheme;

  const value = useMemo(
    () => ({
      theme,
      darkMode,
      setDarkMode: handleDarkModeChange
    }),
    [darkMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
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
