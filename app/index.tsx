import React, { useEffect, useState } from "react";
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import Navigation from "@/app/navigations/Navigation";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from "react-redux";
import { store } from "@/stores";
import { AuthProvider } from "@/app/contexts/auth";
import { ToastProvider, ResponsiveProvider, useTheme, ThemeProvider } from "@/app/contexts";
import * as Font from "expo-font";
import { ActivityIndicator } from "react-native";

const App = () => {
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
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ToastProvider>
      <ResponsiveProvider>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
              <ThemedApp />
            </ThemeProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </ResponsiveProvider>
    </ToastProvider>
  );
};

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee', 
    accent: '#03dac4', 
    background: '#ffffff', 
    surface: '#ffffff', 
    text: '#000000', 
    
  },
};

const ThemedApp = () => {
  return (
    <PaperProvider theme={CustomTheme}>
      <Provider store={store}>
        <Navigation />
      </Provider>
    </PaperProvider>
  );
};

export default App;
