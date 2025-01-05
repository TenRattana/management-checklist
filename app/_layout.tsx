import React, { Suspense } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppProviders from "@/components/Appprovider";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useAppInitialization from '@/hooks/useAppInitialization';
import { LoadingSpinner } from '@/components';

import * as serviceWorkerRegistration from "../web/serviceWorkerRegistration";

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
                        <StatusBar hidden={true} />
                        <RootNavigation />
                    </AppProviders>
                </Suspense>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
};

export default RootLayout;

serviceWorkerRegistration.register();
