import React, { createContext, ReactNode, useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import axios from "axios";

export interface ToastContextProps {
  showSuccess: (message: string | string[]) => void;
  showError: (messages: string | string[]) => void;
  handleError: (error: unknown) => void;
}

export interface ToastProviderProps {
  children: ReactNode;
}

interface Toast {
  id: string;
  message: string;
  status: "success" | "error";
}

export const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { theme } = useTheme();
  const { spacing } = useRes();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, status: "success" | "error") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, status }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const showSuccess = useCallback((messages: string | string[]) => {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    messageArray.forEach((message) => addToast(message, "success"));
  }, [addToast]);

  const showError = useCallback((messages: string | string[]) => {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    messageArray.forEach((message) => addToast(message, "error"));
  }, [addToast]);

  const handleError = useCallback(
    (error: unknown) => {
      let errorMsg: string[];

      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.errors ?? [
          "Something went wrong!",
        ];

      } else if (error instanceof Error) {
        errorMsg = [error.message, "An unexpected issue occurred."];
      } else {
        errorMsg = ["An unknown error occurred!", "Please contact support."];
      }

      showError(errorMsg);
    },
    [showError]
  );

  const value = useMemo(
    () => ({ showSuccess, showError, handleError }),
    [showSuccess, showError, handleError]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={Platform.OS === "web" ? styles.toastStackWeb : styles.toastStackMobile} pointerEvents="box-none">
        {toasts.map((toast, index) => {
          console.log(toast.message);

          return (
            <Animated.View
              key={toast.id}
              style={[
                styles.toastContainer,
                {
                  top: index * 15,
                  backgroundColor: toast.status === "error" ? theme.colors.error : theme.colors.succeass
                }
              ]}
            >
              <MaterialIcons
                name={toast.status === "error" ? "error" : "check-circle"}
                size={spacing.large}
                color="white"
                style={styles.icon}
              />
              <View style={styles.messageContainer}>
                <Text style={{ fontSize: spacing.small, color: theme.colors.fff }}>{toast.message}</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setToasts((prev) => prev.filter((item) => item.id !== toast.id))
                }
              >
                <MaterialIcons name="close" size={spacing.large} color="white" />
              </TouchableOpacity>
            </Animated.View>

          )
        })}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastStackWeb: {
    position: "absolute",
    top: '10%',
    right: '2%',
    // zIndex: 9999,
  },
  toastStackMobile: {
    position: "absolute",
    top: '10%',
    flex: 1,
    alignSelf: 'center',
    // zIndex: 9999,
  },
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "green",
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: 350,
  },
  icon: {
    marginRight: 8,
  },
  messageContainer: {
    maxWidth: 250,
    paddingRight: 8,
  },
});
