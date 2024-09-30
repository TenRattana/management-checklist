import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { useSpacing } from "@/hooks/useSpacing";

interface ResponsiveContextType {
  responsive: "small" | "medium" | "large";
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

interface ResponsiveProviderProps {
  children: ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const { width } = useWindowDimensions();
  const spacingValues = useSpacing();
  const [responsive, setResponsive] = useState<"small" | "medium" | "large">("small");

  useEffect(() => {
    if (width > spacingValues.breakpoints.large) {
      setResponsive("large");
    } else if (width > spacingValues.breakpoints.medium) {
      setResponsive("medium");
    } else {
      setResponsive("small");
    }
  }, [width]);

  const spacing = useMemo(() => {
    switch (responsive) {
      case "large":
        return {
          small: spacingValues.xxmedium,
          medium: spacingValues.large,
          large: spacingValues.xLarge,
        };
      case "medium":
        return {
          small: spacingValues.medium,
          medium: spacingValues.xmedium,
          large: spacingValues.xxmedium,
        };
      case "small":
      default:
        return {
          small: spacingValues.medium,
          medium: spacingValues.xmedium,
          large: spacingValues.xxmedium,
        };
    }
  }, [responsive, spacingValues]);

  const value = useMemo(() => ({ responsive, spacing }), [responsive, spacing]);

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useRes = (): ResponsiveContextType => {
  const context = useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error("useRes must be used within a ResponsiveProvider");
  }
  return context;
};
