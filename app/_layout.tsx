import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppProviders from "@/components/Appprovider";

const RootNavigation = React.lazy(() => import('./navigations/RootNavigation'))
const UseAppInitialization = React.lazy(() => import('@/hooks/useAppInitialization'))
const ErrorBoundary = React.lazy(() => import('@/hooks/ErrorBoundary'))

const RootLayout = () => {

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
