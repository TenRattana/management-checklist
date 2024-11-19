import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ToastProvider, AuthProvider, ResponsiveProvider, ThemeProvider } from "@/app/providers";
import { QueryClient, QueryClientProvider } from 'react-query';
import * as Font from "expo-font";
import { Provider, useSelector } from "react-redux";
import { store } from "@/stores";
import { Slot, Stack, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useTheme } from './contexts';
import RouteGuard from './guard/GuardRoute';
import axiosInstance from '@/config/axios';
import { Asset } from 'expo-asset';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

const SetTheme = () => {
    const { theme } = useTheme();
    const currentRouteName = useSegments().join('/');
    const user = useSelector((state: any) => state.user);

    useEffect(() => {
        if (user) {
            const interceptor = axiosInstance.interceptors.request.use(config => {
                config.headers['Authorization'] = user.username;
                return config;
            });

            return () => {
                axiosInstance.interceptors.request.eject(interceptor);
            };
        }
    }, [user]);

    if (currentRouteName) {
        return (
            <PaperProvider theme={theme}>
                <RouteGuard route={currentRouteName}>
                    <Slot screenOptions={{ headerShown: false }} />
                </RouteGuard>
            </PaperProvider>
        );
    } else {
        return (
            <PaperProvider theme={theme}>
                <Stack screenOptions={{ headerShown: false }} />
            </PaperProvider>
        );
    }
};

const RootLayout = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    const prepare = async () => {
        try {
            await Font.loadAsync({
                "Poppins": require("../assets/fonts/Poppins-Regular.ttf"),
                "Sarabun": require("../assets/fonts/Sarabun-Regular.ttf"),
            });

            await Asset.loadAsync([
                require('../assets/images/bgs.jpg'),
                require('../assets/images/Icon.jpg'),
                require('../assets/images/Icon-app.png'),
            ]);
        } catch (error) {
            console.warn('Error loading fonts and assets:', error);
        } finally {
            setFontsLoaded(true);
            setAssetsLoaded(true);
        }
    };

    useEffect(() => {
        prepare();
    }, []);

    useEffect(() => {
        if (fontsLoaded && assetsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, assetsLoaded]);

    if (!fontsLoaded || !assetsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
    }

    return (
        <ThemeProvider>
            <ResponsiveProvider>
                <ToastProvider>
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <AuthProvider>
                                <StatusBar hidden={false} />
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
