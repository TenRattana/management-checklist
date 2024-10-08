import React, { createContext, useContext, ReactNode, useCallback } from "react";
import ToastManager, { Toast } from "toastify-react-native";
import axios from "axios";

interface ToastContextProps {
  showSuccess: (message: string) => void;
  showError: (messages: string[]) => void;
  handleError: (error: unknown) => void;
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

  const handleError = useCallback((error: unknown) => {
    let errorMsg: string[];

    if (axios.isAxiosError(error)) {
      errorMsg = error.response?.data?.errors ?? ["Something went wrong!"];
    } else if (error instanceof Error) {
      errorMsg = [error.message];
    } else {
      errorMsg = ["An unknown error occurred!"];
    }

    showError(errorMsg);
  }, [showError]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, handleError }}>
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
