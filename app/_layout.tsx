import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { ThemeProvider, ToastProvider, ResponsiveProvider } from "@/app/contexts";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
