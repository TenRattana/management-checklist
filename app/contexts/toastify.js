import React, { createContext, useContext } from "react";
import ToastManager, { Toast } from "toastify-react-native";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showSuccess = (message) => {
    Toast.success(message);
  };

  const showError = (message) => {
    Toast.error(message);
  };

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      <ToastManager />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
