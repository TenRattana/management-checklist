import React, { createContext, ReactNode, useContext } from "react";
import moment from "moment-timezone";

const TimezoneContext = createContext("Asia/Bangkok");

export interface TimezoneProviderProps {
    children: ReactNode;
    timezone: string;
}

export const TimezoneProvider = ({ children, timezone = "Asia/Bangkok" }: TimezoneProviderProps) => {
    moment.tz.setDefault(timezone);
    return (
        <TimezoneContext.Provider value={timezone}>
            {children}
        </TimezoneContext.Provider>
    );
};

export const useTimezone = () => useContext(TimezoneContext);
