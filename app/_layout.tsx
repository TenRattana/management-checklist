import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppProviders from "@/components/Appprovider";
import { Platform } from 'react-native';

const RootNavigation = React.lazy(() => import('./navigations/RootNavigation'))
const UseAppInitialization = React.lazy(() => import('@/hooks/useAppInitialization'))
const ErrorBoundary = React.lazy(() => import('@/hooks/ErrorBoundary'))

const RootLayout = () => {
    // if (Platform.OS === 'web') {
    //     if ('serviceWorker' in navigator) {
    //       navigator.serviceWorker
    //         .register('/service-worker.js')
    //         .then(() => console.log('Service Worker registered'))
    //         .catch((err) => console.error('Service Worker registration failed:', err));
    //     }
    // } else {
    //     console.log('Running on Mobile platform');
    // }

    return (
        <ErrorBoundary>
            <UseAppInitialization />
            <AppProviders>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <StatusBar hidden={true} />
                    <RootNavigation />
                </GestureHandlerRootView>
            </AppProviders>
        </ErrorBoundary>
    );
};

export default RootLayout;
