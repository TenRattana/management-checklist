import React, { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { ThemeProvider, ToastProvider, ResponsiveProvider } from "@/app/contexts";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // useEffect(() => {
  //   const hideSplashScreen = async () => {
  //     if (fontsLoaded) {
  //       await SplashScreen.hideAsync();
  //     }
  //   };

  //   hideSplashScreen();
  // }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  console.log("RootLayout");

  return (
    <ThemeProvider>
      <ToastProvider>
        <ResponsiveProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="+not-found" options={{ headerShown: true }} />
          </Stack>
        </ResponsiveProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
