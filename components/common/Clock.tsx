import { useState, useEffect, useRef, useMemo } from "react";
import moment from "moment-timezone";

const DEFAULT_TIMEZONE = "Asia/Bangkok";

export function Clock(): string {
    const [time, setTime] = useState<string>("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const updateTime = () => {
        const currentTime = moment().tz(DEFAULT_TIMEZONE).format("HH:mm");
        setTime(currentTime);
    };

    useEffect(() => {
        updateTime();
        intervalRef.current = setInterval(updateTime, 60000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return time
};

