import React, { useState, useEffect, useRef } from "react";
import moment from "moment-timezone";
import { Text, View } from "react-native";

const DEFAULT_TIMEZONE = "Asia/Bangkok";

const Clock: React.FC = () => {
    const [time, setTime] = useState<string>("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // ฟังก์ชันที่อัปเดตเวลา
    const updateTime = () => {
        const currentTime = moment().tz(DEFAULT_TIMEZONE).format("YYYY-MM-DD HH:mm:ss");
        setTime(currentTime);
    };

    // ใช้ useEffect เพื่อเริ่มจับเวลาเมื่อคอมโพเนนต์ mount
    useEffect(() => {
        updateTime(); // เรียกใช้ฟังก์ชันครั้งแรกเพื่อแสดงเวลาทันที
        intervalRef.current = setInterval(updateTime, 1000); // เรียกใช้ทุกๆ 1 วินาที

        // Cleanup เมื่อคอมโพเนนต์ unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current); // หยุด setInterval เมื่อคอมโพเนนต์ unmount
            }
        };
    }, []); // ทำงานแค่ครั้งเดียวเมื่อคอมโพเนนต์ mount

    return (
        <View>
            <Text>Current Time in {DEFAULT_TIMEZONE}:</Text>
            <Text>{time}</Text>
        </View>
    );
};

export default Clock;
