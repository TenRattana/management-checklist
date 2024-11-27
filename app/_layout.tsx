import React, { useEffect, useState } from 'react';
import { ActivityIndicator, LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ToastProvider, AuthProvider, ResponsiveProvider, ThemeProvider } from "@/app/providers";
import { QueryClient, QueryClientProvider } from 'react-query';
import * as Font from "expo-font";
import { Provider } from "react-redux";
import { store } from "@/stores";
import { Asset } from 'expo-asset';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '.';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { TimezoneProvider } from './providers/timezone';
import TestComponent from './screens/TestComponent';
import { TimescheduleScreen } from './screens';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

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
        LogBox.ignoreLogs(['Require cycle:', 'shadow* style props are deprecated.']);
        prepare();
    }, []);

    if (!fontsLoaded || !assetsLoaded) {
        return (
            <ActivityIndicator
                size="large"
                color="#0000ff"
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            />
        );
    }

    return (
        <ResponsiveProvider>
            <ThemeProvider>
                <TimezoneProvider timezone="Asia/Bangkok">
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <ToastProvider>
                                <AuthProvider>
                                    <GestureHandlerRootView style={{ flex: 1 }}>
                                        <StatusBar hidden={true} />
                                        <NavigationContainer independent={true}>
                                            {/* <TestComponent /> */}
                                            <TimescheduleScreen />
                                        </NavigationContainer>
                                    </GestureHandlerRootView>
                                </AuthProvider>
                            </ToastProvider>
                        </QueryClientProvider>
                    </Provider>
                </TimezoneProvider>
            </ThemeProvider>
        </ResponsiveProvider>
    );
};

export default RootLayout;
