import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { useWindowDimensions } from "react-native";
import { useSpacing } from "@/hooks/useSpacing";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ResponsiveContextType {
  responsive: "small" | "medium" | "large";
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
  fontSize: string;
  setFontSize: (value: string) => void;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

interface ResponsiveProviderProps {
  children: ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  console.log("ResponsiveProvider");

  const { width } = useWindowDimensions();
  const spacingValues = useSpacing();

  const [responsive, setResponsive] = useState<"small" | "medium" | "large">("small");
  const [fontSize, setFontSize] = useState<string>('small');

  useEffect(() => {
    const loadSettings = async () => {
      const storedFontSize = await AsyncStorage.getItem('fontSize');
      setFontSize(storedFontSize ?? "small");
    };

    loadSettings();
  }, [setFontSize, AsyncStorage]);

  useEffect(() => {
    if (width > spacingValues.breakpoints.large) {
      setResponsive("large");
    } else if (width > spacingValues.breakpoints.medium) {
      setResponsive("medium");
    } else {
      setResponsive("small");
    }
  }, [width, spacingValues.breakpoints, setResponsive]);

  const spacing = useMemo(() => {
    switch (fontSize) {
      case "large":
        return {
          small: spacingValues.large,
          medium: spacingValues.xLarge,
          large: spacingValues.xxLarge,
        };
      case "medium":
        return {
          small: spacingValues.xmedium,
          medium: spacingValues.xxmedium,
          large: spacingValues.large,
        };
      case "small":
      default:
        return {
          small: spacingValues.medium,
          medium: spacingValues.xmedium,
          large: spacingValues.xxmedium,
        };
    }
  }, [fontSize, spacingValues]);

  const handleFontSizeChange = useCallback(async (value: string) => {
    setFontSize(value);
    await AsyncStorage.setItem('fontSize', value);
  }, []);

  const value = useMemo(() => ({
    responsive,
    spacing,
    fontSize,
    setFontSize: handleFontSizeChange,
  }), [responsive, spacing, fontSize, setFontSize]);

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useRes = (): ResponsiveContextType => {
  console.log("useRes");

  const context = useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error("useRes must be used within a ResponsiveProvider");
  }
  return context;
};
