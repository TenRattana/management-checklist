import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
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
    fff: '#fff'
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
    fff: '#fff'
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
    console.log(value);

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
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};
