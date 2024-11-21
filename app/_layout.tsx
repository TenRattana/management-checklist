import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ToastProvider, AuthProvider, ResponsiveProvider, ThemeProvider } from "@/app/providers";
import { QueryClient, QueryClientProvider } from 'react-query';
import * as Font from "expo-font";
import { Provider } from "react-redux";
import { store } from "@/stores";
import { useSegments } from 'expo-router';
import { Asset } from 'expo-asset';
import NotFoundScreen404 from '@/app/screens/NotFoundScreen404';
import App from '.';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

const SetTheme = React.memo(() => {
    console.log("SetTheme");

    const currentRouteName = useSegments().join('/');

    if (currentRouteName) {
        console.log("if", currentRouteName);

        return (
            <NotFoundScreen404 />
        );
    } else {
        console.log("else", currentRouteName);

        return (
            <ToastProvider>
                <AuthProvider>
                    <NavigationContainer independent={true}>
                        <App />
                    </NavigationContainer>
                </AuthProvider>
            </ToastProvider>
        );
    }
});

const RootLayout = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    console.log("RootLayout");

    const prepare = async () => {
        console.log("prepare");

        try {
            await Font.loadAsync({
                "Poppins": require("../assets/fonts/Poppins-Regular.ttf"),
                "Sarabun": require("../assets/fonts/Sarabun-Regular.ttf"),
            });

            // ตรวจสอบว่า assets ถูกโหลดจากแคชแล้วหรือไม่
            const isAssetsLoaded = await AsyncStorage.getItem('assetsLoaded');
            if (isAssetsLoaded !== 'true') {
                // ถ้า assets ยังไม่ได้ถูกโหลด, ให้โหลดใหม่
                console.log('Assets not loaded from cache, loading assets...');
                await Asset.loadAsync([
                    require('../assets/images/bgs.jpg'),
                    require('../assets/images/Icon.jpg'),
                    require('../assets/images/Icon-app.png'),
                ]);

                // เก็บสถานะว่า assets ถูกโหลดแล้วใน AsyncStorage
                await AsyncStorage.setItem('assetsLoaded', 'true');
                console.log('Assets loaded and cached.');
            } else {
                // ถ้า assets ถูกโหลดจากแคช
                console.log('Assets are already loaded from cache.');
            }
        } catch (error) {
            console.warn('Error loading fonts and assets:', error);
        } finally {
            setFontsLoaded(true);
            setAssetsLoaded(true);
            SplashScreen.hideAsync();
        }
    };
    useEffect(() => {
        console.log("useEffect prepare");

        prepare();
    }, []);

    if (!fontsLoaded || !assetsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
    }

    return (
        <>
            <ResponsiveProvider>
                <ThemeProvider>
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <SetTheme />
                        </QueryClientProvider>
                    </Provider>
                </ThemeProvider>
            </ResponsiveProvider>
        </>
    );
};

export default RootLayout;
