import React, { lazy, Suspense } from "react";
import { QueryClientProvider, QueryClient } from "react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/stores";
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, TimezoneProvider } from "@/app/providers";
import { LoadingSpinner } from "./common";

const ToastProvider = lazy(() => import('@/app/providers/toastify').then(module => ({ default: module.ToastProvider })));
const AuthProvider = lazy(() => import('@/app/providers/auth').then(module => ({ default: module.AuthProvider })));
const ResponsiveProvider = lazy(() => import('@/app/providers/responsive').then(module => ({ default: module.ResponsiveProvider })));

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

const AppProviders = ({ children }: any) => (
    <Suspense fallback={<LoadingSpinner />}>
        <ResponsiveProvider>
            <ThemeProvider>
                <TimezoneProvider timezone="Asia/Bangkok">
                    <ReduxProvider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <ToastProvider>
                                <AuthProvider>
                                    {children}
                                </AuthProvider>
                            </ToastProvider>
                        </QueryClientProvider>
                    </ReduxProvider>
                </TimezoneProvider>
            </ThemeProvider>
        </ResponsiveProvider>
    </Suspense>
);

export default AppProviders;