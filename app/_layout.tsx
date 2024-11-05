import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ToastProvider, AuthProvider, ResponsiveProvider, ThemeProvider } from "@/app/providers";
import { QueryClient, QueryClientProvider } from 'react-query';
import * as Font from "expo-font";
import { Provider } from "react-redux";
import { store } from "@/stores";
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useTheme } from './contexts';

console.log("Root");

const queryClient = new QueryClient();
SplashScreen.preventAutoHideAsync();

const SetTheme = () => {
    const { theme } = useTheme();

    return (
        <PaperProvider theme={theme}>
            <Stack screenOptions={{ headerShown: false }} />
        </PaperProvider>
    );
}
const RootLayout = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    console.log("RootLayout is being rendered");

    useEffect(() => {
        const prepare = async () => {
            try {
                await Font.loadAsync({
                    "Poppins": require("../assets/fonts/Poppins-Regular.ttf"),
                    "Sarabun": require("../assets/fonts/Sarabun-Regular.ttf"),
                });
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.warn('Error loading fonts:', error);
            } finally {
                setFontsLoaded(true);
            }
        };

        prepare();
    }, []);

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" style={{ alignContent: 'center', justifyContent: 'center', height: '100%' }} />;
    }

    return (
        <ThemeProvider>
            <ResponsiveProvider>
                <ToastProvider>
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <AuthProvider>
                                <SetTheme />
                            </AuthProvider>
                        </QueryClientProvider>
                    </Provider>
                </ToastProvider>
            </ResponsiveProvider>
        </ThemeProvider>
    );
};

export default RootLayout;
