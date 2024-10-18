import { useThemeColor } from "@/hooks/useThemeColor";
import React, { createContext, useContext, ReactNode, useMemo } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

interface ThemeContextProps {
  colors: ReturnType<typeof useThemeColor>;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colors = useThemeColor();

  const value = useMemo(
    () => ({ colors }),
    [colors]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {

  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};