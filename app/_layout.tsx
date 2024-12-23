import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppProviders from "@/components/Appprovider";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const RootNavigation = React.lazy(() => import('./navigations/RootNavigation'))
const UseAppInitialization = React.lazy(() => import('@/hooks/useAppInitialization'))
const ErrorBoundary = React.lazy(() => import('@/hooks/ErrorBoundary'))

const RootLayout = () => {
    return (
        <ErrorBoundary>
            <GestureHandlerRootView>
                <UseAppInitialization />
                <AppProviders>
                    <StatusBar hidden={true} />
                    <RootNavigation />
                </AppProviders>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
};

export default RootLayout;
