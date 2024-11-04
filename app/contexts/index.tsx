import { ResponsiveContext, ResponsiveContextType } from "@/app/providers/responsive";
import { ThemeContext, ThemeContextProps } from "@/app/providers/theme";
import { AuthContext, AuthContextType } from "@/app/providers/auth";
import { ToastContext, ToastContextProps } from "@/app/providers/toastify";

import { useContext } from "react";

export const useRes = (): ResponsiveContextType => {
    const context = useContext(ResponsiveContext);
    if (context === undefined) {
        throw new Error("useRes must be used within a ResponsiveProvider");
    }
    return context;
};

export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const useToast = (): ToastContextProps => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
