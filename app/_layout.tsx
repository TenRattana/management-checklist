import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { ToastProvider, AuthProvider, ResponsiveProvider, ThemeProvider } from "@/app/providers";
import { QueryClient, QueryClientProvider } from 'react-query';
import * as Font from "expo-font";
import { Stack } from 'expo-router';
import { Provider } from "react-redux";
import { store } from "@/stores";
import { useTheme } from '@/app/contexts';

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
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    console.log("RootLayout rendered");

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

export default React.memo(RootLayout);
