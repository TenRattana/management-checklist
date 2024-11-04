import React, { createContext, useContext, ReactNode, useCallback, useMemo } from "react";
import ToastManager, { Toast } from "toastify-react-native";
import axios from "axios";

export interface ToastContextProps {
  showSuccess: (message: string) => void;
  showError: (messages: string[]) => void;
  handleError: (error: unknown) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  console.log("ToastProvider");

  const showSuccess = useCallback((message: string) => {
    Toast.success(message);
  }, [Toast]);

  const showError = useCallback((messages: string[]) => {
    const formattedMessage = messages.join('\n');
    Toast.error(formattedMessage, "top");
  }, [Toast]);

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

  const value = useMemo(
    () => ({ showSuccess, showError, handleError }),
    [showSuccess, showError, handleError]
  );

  return (
    <ToastContext.Provider value={value}>
      <ToastManager />
      {children}
    </ToastContext.Provider>
  );
};
