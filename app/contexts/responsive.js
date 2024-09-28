import React, { createContext, useContext, useState, useEffect } from "react";
import { useWindowDimensions } from "react-native";

export const ResponsiveContext = createContext();

export const ResponsiveProvider = ({ children }) => {
  const { width } = useWindowDimensions();
  const [responsive, setResponsive] = useState("small");

  console.log("useResponsive");

  useEffect(() => {
    if (width > 900) {
      setResponsive("large");
    } else if (width > 600) {
      setResponsive("medium");
    } else {
      setResponsive("small");
    }
  }, [width]);

  return (
    <ResponsiveContext.Provider value={{ responsive }}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useRes = () => useContext(ResponsiveContext);
