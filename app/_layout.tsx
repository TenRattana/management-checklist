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
    const currentRouteName = useSegments().join('/');
    if (currentRouteName) {
        return <NotFoundScreen404 />;
    }
    return (
        <ToastProvider>
            <SetAuth />
        </ToastProvider>
    );

});

const SetAuth = React.memo(() => {
    return (
        <AuthProvider>
            <NavigationContainer independent={true}>
                <App />
            </NavigationContainer>
        </AuthProvider>
    )
})

const RootLayout = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    const prepare = async () => {

        try {
            await Font.loadAsync({
                "Poppins": require("../assets/fonts/Poppins-Regular.ttf"),
                "Sarabun": require("../assets/fonts/Sarabun-Regular.ttf"),
            });

            const isAssetsLoaded = await AsyncStorage.getItem('assetsLoaded');
            if (isAssetsLoaded !== 'true') {
                await Asset.loadAsync([
                    require('../assets/images/bgs.jpg'),
                    require('../assets/images/Icon.jpg'),
                    require('../assets/images/Icon-app.png'),
                ]);

                await AsyncStorage.setItem('assetsLoaded', 'true');
            } else {
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
