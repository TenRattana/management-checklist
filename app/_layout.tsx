import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { ToastProvider, AuthProvider, ResponsiveProvider, ThemeProvider, useTheme, useAuth } from "@/app/contexts";
import { QueryClient, QueryClientProvider } from 'react-query';
import * as Font from "expo-font";
import { Stack } from 'expo-router';
import { ReactQueryDevtools } from 'react-query/devtools';

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

    const loadFonts = async () => {
        await Font.loadAsync({
            "Poppins": require("../assets/fonts/Poppins-Regular.ttf"),
            "Sarabun": require("../assets/fonts/Sarabun-Regular.ttf"),
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
                    <QueryClientProvider client={queryClient}>
                        <AuthProvider>
                            <SetTheme />
                            <ReactQueryDevtools initialIsOpen={true}/>
                        </AuthProvider>
                    </QueryClientProvider>
                </ToastProvider>
            </ResponsiveProvider>
        </ThemeProvider>
    );
};

export default React.memo(RootLayout);
