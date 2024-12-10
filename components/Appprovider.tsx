import React from "react";
import { ToastProvider, AuthProvider, ResponsiveProvider, ThemeProvider, TimezoneProvider } from "@/app/providers";
import { QueryClientProvider, QueryClient } from "react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/stores";

const queryClient = new QueryClient();

const AppProviders = ({ children }: any) => (
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
);

export default AppProviders;
