import React from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import App from '.';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppProviders from "@/components/Appprovider";

import { useAppInitialization } from "@/hooks/useAppInitialization";

const RootLayout = () => {
    const isInitialized = useAppInitialization();

    if (!isInitialized) {
        return (
            <ActivityIndicator
                size="large"
                color="#0000ff"
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            />
        );
    }

    return (
        <AppProviders>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <StatusBar hidden={true} />
                <NavigationContainer independent={true}>
                    <App />
                </NavigationContainer>
            </GestureHandlerRootView>
        </AppProviders>
    );
};

export default RootLayout;
