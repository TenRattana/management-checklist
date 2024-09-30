import React, { createContext, useContext, ReactNode } from "react";
import ToastManager, { Toast } from "toastify-react-native";

interface ToastContextProps {
  showSuccess: (message: string) => void;
  showError: (messages: string[]) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const showSuccess = (message: string) => {
    Toast.success(message);
  };

  const showError = (messages: string[]) => {
    const formattedMessage = messages.join('\n');

    Toast.error(formattedMessage, "top");
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
