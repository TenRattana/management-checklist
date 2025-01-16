import React, { Suspense } from 'react';
import AppProviders from "@/components/Appprovider";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useAppInitialization from '@/hooks/useAppInitialization';
import { LoadingSpinner } from '@/components';
import { StatusBar } from 'react-native';

const RootNavigation = React.lazy(() => import('./navigations/RootNavigation'))
const ErrorBoundary = React.lazy(() => import('@/hooks/ErrorBoundary'))

const RootLayout = () => {
    const isInitialized = useAppInitialization();

    if (!isInitialized) {
        return <LoadingSpinner />;
    }

    return (
        <ErrorBoundary>
            <GestureHandlerRootView>
                <Suspense fallback={<LoadingSpinner />}>
                    <AppProviders>
                        <StatusBar hidden={false} translucent />
                        <RootNavigation />
                    </AppProviders>
                </Suspense>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
};

export default RootLayout;
