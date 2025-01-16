import React, { createContext, ReactNode, useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, Platform, Animated } from "react-native";
import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import axios from "axios";
import useMasterdataStyles from "@/styles/common/masterdata";
import { IconButton } from "react-native-paper";

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
  progressAnim: Animated.Value;
}

export const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { theme } = useTheme();
  const { spacing } = useRes();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const masterdataStyles = useMasterdataStyles();

  const addToast = useCallback((message: string, status: "success" | "error") => {
    const id = Math.random().toString(36).substring(7);
    const progressAnim = new Animated.Value(1);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 5000,
      useNativeDriver: false,
    }).start();

    setToasts((prev) => [...prev, { id, message, status, progressAnim }]);

    const timeoutId = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);

    return () => clearTimeout(timeoutId);
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
          return (
            <Animated.View
              key={toast.id}
              style={[
                styles.toastContainer,
                {
                  backgroundColor: theme.colors.background,
                  top: index * 10,
                  ...Platform.select({
                    web: {
                      boxShadow: `${theme.colors.onBackground || "#000"} 0px 2px 4px`,
                    },
                    ios: {
                      shadowColor: theme.colors.onBackground || "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 4,
                    },
                    android: {
                      elevation: 4,
                    },
                  }),
                },
              ]}
            >
              <View style={{
                padding: 5,
                flexBasis: '90%',
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                <View style={{
                  borderColor: toast.status === "error" ? theme.colors.error : theme.colors.succeass,
                  borderRadius: 10,
                  borderLeftWidth: 4,
                }}>

                </View>
                <View style={{ paddingHorizontal: 10, alignSelf: 'center', minWidth: 200 }}>
                  <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
                    <Text style={[masterdataStyles.title, { color: toast.status === "error" ? theme.colors.error : theme.colors.succeass }]}>
                      {toast.status}
                    </Text>
                  </View>

                  <View style={styles.messageContainer}>
                    <Text style={masterdataStyles.text}>
                      {toast.message}
                    </Text>
                  </View>
                </View>

                <View>
                  <IconButton
                    icon={"close"}
                    size={spacing.large}
                    iconColor={theme.colors.onBackground}
                    style={{ top: -5 }}
                    onPress={() =>
                      setToasts((prev) => prev.filter((item) => item.id !== toast.id))
                    }
                  />
                </View>
              </View>

              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: toast.status === "error" ? theme.colors.error : theme.colors.succeass,
                    width: toast.progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider >
  );
};

const styles = StyleSheet.create({
  toastStackWeb: {
    position: "absolute",
    top: '7%',
    right: '2%',
    zIndex: 9999,
  },
  toastStackMobile: {
    position: "absolute",
    top: '7%',
    flex: 1,
    alignSelf: 'center',
    zIndex: 9999,
  },
  toastContainer: {
    justifyContent: 'space-between',
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    paddingLeft: 20,
    borderRadius: 3,
    marginVertical: 5,
    maxWidth: 350,
    overflow: 'hidden',
  },
  icon: {
    marginRight: 8,
  },
  messageContainer: {
    maxWidth: 250,
    padding: 5,
    paddingRight: 8,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    marginTop: 5
  },
});
