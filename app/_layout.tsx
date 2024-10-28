import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { ToastProvider, AuthProvider, ResponsiveProvider, ThemeProvider, useTheme, useAuth } from "@/app/contexts";
import * as Font from "expo-font";
import { Stack } from 'expo-router';


SplashScreen.preventAutoHideAsync();

const SetTheme = () => {
    const { theme } = useTheme();

    return (
        <PaperProvider theme={theme}>
            <Stack screenOptions={{ headerShown: false}} />
        </PaperProvider>
    );
}

const RootLayout = () => {
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

    console.log("RootLayout rendered");

    return (
        <ThemeProvider>
            <ResponsiveProvider>
                <ToastProvider>
                    <AuthProvider>
                        <SetTheme />
                    </AuthProvider>
                </ToastProvider>
            </ResponsiveProvider>
        </ThemeProvider>
    );
};

export default React.memo(RootLayout);
