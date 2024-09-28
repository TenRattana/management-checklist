import { colors, fonts, spacing } from "@/theme";
import React, { createContext, useContext } from "react";

export const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors, fonts, spacing }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
