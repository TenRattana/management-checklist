import { ResponsiveContext, ResponsiveContextType } from "@/app/providers/responsive";
import { useContext } from "react";

export const useRes = (): ResponsiveContextType => {
    const context = useContext(ResponsiveContext);
    if (context === undefined) {
        throw new Error("useRes must be used within a ResponsiveProvider");
    }
    return context;
};