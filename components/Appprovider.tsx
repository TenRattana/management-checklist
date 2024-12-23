import React, { lazy, Suspense } from "react";
import { QueryClientProvider, QueryClient } from "react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/stores";
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, TimezoneProvider } from "@/app/providers";
import { View, StyleSheet } from "react-native";
import LottieView from 'lottie-react-native';

const ToastProvider = lazy(() => import('@/app/providers/toastify').then(module => ({ default: module.ToastProvider })));
const AuthProvider = lazy(() => import('@/app/providers/auth').then(module => ({ default: module.AuthProvider })));
const ResponsiveProvider = lazy(() => import('@/app/providers/responsive').then(module => ({ default: module.ResponsiveProvider })));

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

const AppProviders = ({ children }: any) => (
    <Suspense fallback={<LoadingScreen />}>
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

const LoadingScreen = () => (
    <View style={styles.container}>
        <LottieView
            source={require('@/assets/animations/loading.json')}
            autoPlay
            loop
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default AppProviders;