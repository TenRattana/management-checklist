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
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';

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
                await Asset.loadAsync([
                    require('../assets/images/bgs.jpg'),
                    require('../assets/images/Icon.jpg'),
                ]);

                await new Promise(resolve => setTimeout(resolve, 2000));

                ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL);
            } catch (error) {
                console.warn('Error loading fonts:', error);
            } finally {
                setFontsLoaded(true);
            }
        };

        setTimeout(() => {
            setStatusBarStyle("light");
        }, 0);

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
                                <StatusBar style="light" hidden={true} />
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
