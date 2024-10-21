import React, { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import Navigation from "@/app/navigations/Navigation";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from "react-redux";
import { store } from "@/stores";
import { AuthProvider } from "@/app/contexts/auth";
import { ToastProvider, ResponsiveProvider, ThemeProvider } from "@/app/contexts";
import * as Font from "expo-font";
import { ActivityIndicator } from "react-native";

const App = () => {
  console.log("App");
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      "Spacemono": require("../assets/fonts/SpaceMono-Regular.ttf"),
      "Poppins": require("../assets/fonts/Poppins-Regular.ttf"),
      "PoppinsB": require("../assets/fonts/Poppins-SemiBold.ttf"),
      "Sarabun": require("../assets/fonts/Sarabun-Regular.ttf"),
      "SarabunB": require("../assets/fonts/Sarabun-Bold.ttf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return  <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ToastProvider>
      <ResponsiveProvider>
        <ThemeProvider>
          <AuthProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <PaperProvider>
                <Provider store={store}>
                  <Navigation />
                </Provider>
              </PaperProvider>
            </GestureHandlerRootView>
          </AuthProvider>
        </ThemeProvider>
      </ResponsiveProvider>
    </ToastProvider>

  );
}

export default App;
