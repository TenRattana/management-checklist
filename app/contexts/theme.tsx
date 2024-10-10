import { useThemeColor } from "@/hooks/useThemeColor";
import React, { createContext, useContext, ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

interface ThemeContextProps {
  colors: ReturnType<typeof useThemeColor>;
}
console.log("them")

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colors = useThemeColor();

  return (
    <ThemeContext.Provider value={{ colors }}>
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