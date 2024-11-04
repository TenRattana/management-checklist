import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { ToastProvider, AuthProvider, ResponsiveProvider, ThemeProvider } from "@/app/providers";
import { QueryClient, QueryClientProvider } from 'react-query';
import * as Font from "expo-font";
import { Stack } from 'expo-router';
import { Provider, useSelector } from "react-redux";
import { store } from "@/stores";
import { useAuth, useTheme } from '@/app/contexts';
import RouteGuard from './guard/GuardRoute';

const queryClient = new QueryClient();
SplashScreen.preventAutoHideAsync();

const SetTheme = () => {
    const { theme } = useTheme();
    const user = useSelector((state: any) => state.user);
    const screens = user.screens || [];
    const { loading } = useAuth();

    return (
        <PaperProvider theme={theme}>
            {loading && user.isAuthenticated && (
                screens.map((screen: { name: string; route: string; permissions: string[] }) => {
                    return (
                        <RouteGuard key={screen.name} permissions={screen.permissions} route={screen.route} name={screen.name}>
                            <Stack />
                        </RouteGuard>
                    );
                })
            )}
        </PaperProvider>
    );
};

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

export default React.memo(RootLayout);
