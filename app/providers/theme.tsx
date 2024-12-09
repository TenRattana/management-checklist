import React, { createContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeContextProps {
  theme: typeof CustomDarkTheme | typeof CustomLightTheme;
  setDarkMode: (value: boolean) => void;
  darkMode: boolean;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    green: "#ffb11e",
    yellow: "#c8c400",
    blue: "rgb(20, 148, 255)",
    fff: '#fff',
    drag: '#37AFE1',
    subform: '#6439FF',
    field: '#4F75FF',
    succeass: '#4CAF50',
    error: '#ff2222'
  },
};

const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fc',
    accent: '#03dac4',
    background: '#121212',
    surface: '#121212',
    text: '#ffffff',
    green: "#ffb11e",
    yellow: "#c8c400",
    blue: "rgb(20, 148, 255)",
    fff: '#fff',
    drag: '#37AFE1',
    subform: '#071952',
    field: '#088395',
    succeass: '#4CAF50',
    error: '#ff2222'
  },
};

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

  const theme = darkMode ? CustomDarkTheme : CustomLightTheme;

  const value = useMemo(
    () => ({
      theme,
      darkMode,
      setDarkMode: handleDarkModeChange
    }),
    [darkMode]
  );

  return (
    <>
      <ThemeContext.Provider value={value}>
        <PaperProvider theme={theme}>
          {children}
        </PaperProvider>
      </ThemeContext.Provider>
    </>
  );
};
