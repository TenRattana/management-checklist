
import { getCurrentTime } from '@/config/timezoneUtils'
import {
    CalendarUtils,
    TimelineEventProps,
} from 'react-native-calendars';
import moment from "moment";
import { CustomLightTheme } from '@/constants/CustomColor';

export const getDate = (offset = 0) => CalendarUtils.getCalendarDateString(getCurrentTime().setDate(getCurrentTime().getDate() + offset));

export interface TimeScheduleProps {
    ScheduleID: string;
    ScheduleName: string;
    MachineGroup?: string | string[];
    Type_schedule: string;
    Tracking: boolean;
    IsActive: boolean;
    Custom: boolean;
    TimeSlots?: Day[];
    TimeCustom?: Day[];
    TimeWeek?: { [key: string]: Day[] };
}

export interface Day {
    start: string | null;
    end: string | null;
}

export const parseTimeScheduleToTimeline = (schedules: TimeScheduleProps[]): TimelineItem[] => {
    const timeline: TimelineItem[] = [];

    schedules?.forEach((schedule) => {
        const { ScheduleID, ScheduleName, Type_schedule, TimeSlots, TimeCustom, TimeWeek, IsActive } = schedule;

        if (Type_schedule === "Daily" && Array.isArray(TimeSlots)) {
            TimeSlots?.forEach((slot) => {
                if (slot.start && slot.end) {
                    timeline.push({
                        ScheduleID: ScheduleID,
                        date: "Recurring Daily",
                        name: ScheduleName,
                        time: `${slot.start} - ${slot.end}`,
                        status: IsActive
                    });
                }
            });
        }

        if (Type_schedule === "Weekly" && TimeWeek && typeof TimeWeek === 'object') {
            Object.entries(TimeWeek)?.forEach(([day, slots]) => {
                if (Array.isArray(slots)) {
                    slots?.forEach((slot) => {
                        if (slot.start && slot.end) {
                            timeline.push({
                                ScheduleID: ScheduleID,
                                date: `Weekly (${day})`,
                                name: ScheduleName,
                                time: `${slot.start} - ${slot.end}`,
                                status: IsActive
                            });
                        }
                    });
                }
            });
        }

        if (Type_schedule === "Custom" && Array.isArray(TimeCustom)) {
            TimeCustom?.forEach((customSlot) => {
                if (customSlot.start && customSlot.end) {
                    const [startDate, startTime] = customSlot.start.split(" ");
                    const [, endTime] = customSlot.end.split(" ");
                    timeline.push({
                        ScheduleID: ScheduleID,
                        date: `Custom (${startDate})`,
                        name: ScheduleName,
                        time: `${startTime} - ${endTime}`,
                        status: IsActive
                    });
                }
            });
        }
    });

    return timeline;
};

export type TimelineItem = {
    ScheduleID: string;
    date: string;
    name: string;
    time: string;
    status: boolean;
};
export interface Tracking {
    ScheduleID: string;
    Tracking: boolean;
    Status: boolean;
    TrackingTime: Day[];
}

export interface TimeLine extends TimelineEventProps {
    ScheduleID: string;
    status: boolean;
    type?: string;
    info?: TimeScheduleProps
    Tracking?: Tracking[],
    statustype: string;
}

interface MarkedDates {
    [date: string]: { dots: DOT[] };
}

interface DOT {
    color: string;
    selectedDotColor: string;
    type?: string; // Optional type property
}

/**
 * Converts a schedule into timeline items, including recurring weekly and daily events.
 * @param {Array} schedule - Array of schedule items.
 * @returns {Array} Timeline items with recurring events and markedDates.
 */
export const convertScheduleToTimeline = (
    schedule: TimelineItem[]
): { timeline: TimeLine[]; markedDates: MarkedDates } => {
    const today = moment();
    const startOfYear = moment().startOf("year");
    const endOfYear = moment().endOf("year");
    const timeline: TimeLine[] = [];
    const markedDates: MarkedDates = {};

    const getColorForType = (type: string) => {
        switch (type) {
            case "Weekly":
                return CustomLightTheme.drag;
            case "Daily":
                return CustomLightTheme.green;
            case "Custom":
                return CustomLightTheme.error;
            default:
                return CustomLightTheme.text;
        }
    };

    const getSelectedColorForType = (type: string) => {
        switch (type) {
            case "Weekly":
                return '#f2f2f2';
            case "Daily":
                return '#f4f4f4';
            case "Custom":
                return '#f6f6f6';
            default:
                return '#f8f8f8';
        }
    };

    schedule.forEach((item) => {
        const { date, name, time, ScheduleID, status }: any = item;

        if (date.startsWith("Weekly")) {
            const weekday = date.match(/\((.*?)\)/)[1];

            let day = startOfYear.clone().day(weekday);

            if (day.isBefore(startOfYear)) {
                day.add(7, "days");
            }

            while (day.isBetween(startOfYear, endOfYear, "days", "[]")) {
                const [startTime, endTime] = time.split(" - ");
                const start = day
                    .clone()
                    .set({
                        hour: parseInt(startTime.split(":")[0], 10),
                        minute: parseInt(startTime.split(":")[1], 10),
                    })
                    .toISOString();
                const end = day
                    .clone()
                    .set({
                        hour: parseInt(endTime.split(":")[0], 10),
                        minute: parseInt(endTime.split(":")[1], 10),
                    })
                    .toISOString();

                const starts = moment(start).tz("Asia/Bangkok").toDate();
                const ends = moment(end).tz("Asia/Bangkok").toDate();
                const now = moment(getCurrentTime());
                const intime = now.isBetween(starts, ends, undefined, "[]");

                timeline.push({
                    ScheduleID: ScheduleID,
                    title: name,
                    start,
                    end,
                    summary: `${date} (${time})`,
                    color: CustomLightTheme.drag,
                    type: "Weekly",
                    status: status,
                    statustype: status && intime ? "running" : status && (now.toISOString() > end) ? "end" : status ? "wait" : "stop",
                });

                const dateKey = day.format("YYYY-MM-DD");
                if (!markedDates[dateKey]) {
                    markedDates[dateKey] = { dots: [] };
                }

                const weeklyDotExists = markedDates[dateKey].dots.some(dot => dot.type === "Weekly");
                if (!weeklyDotExists) {
                    markedDates[dateKey].dots.push({
                        color: getColorForType("Weekly"),
                        selectedDotColor: getSelectedColorForType("Weekly"),
                        type: "Weekly",
                    });
                }

                day.add(7, "days");
            }
        } else if (date === "Recurring Daily") {
            let day = startOfYear.clone();

            while (day.isBetween(startOfYear, endOfYear, "days", "[]")) {
                const [startTime, endTime] = time.split(" - ");
                const start = day
                    .clone()
                    .set({
                        hour: parseInt(startTime.split(":")[0], 10),
                        minute: parseInt(startTime.split(":")[1], 10),
                    })
                    .toISOString();
                const end = day
                    .clone()
                    .set({
                        hour: parseInt(endTime.split(":")[0], 10),
                        minute: parseInt(endTime.split(":")[1], 10),
                    })
                    .toISOString();

                const starts = moment(start).tz("Asia/Bangkok").toDate();
                const ends = moment(end).tz("Asia/Bangkok").toDate();
                const now = moment(getCurrentTime());
                const intime = now.isBetween(starts, ends, undefined, "[]");

                timeline.push({
                    ScheduleID: ScheduleID,
                    title: name,
                    start,
                    end,
                    summary: `${date} (${time})`,
                    color: CustomLightTheme.green,
                    type: "Daily",
                    status: status,
                    statustype: status && intime ? "running" : status && (now.toISOString() > end) ? "end" : status ? "wait" : "stop"
                });

                const dateKey = day.format("YYYY-MM-DD");
                if (!markedDates[dateKey]) {
                    markedDates[dateKey] = { dots: [] };
                }

                const dailyDotExists = markedDates[dateKey].dots.some(dot => dot.type === "Daily");
                if (!dailyDotExists) {
                    markedDates[dateKey].dots.push({
                        color: getColorForType("Daily"),
                        selectedDotColor: getSelectedColorForType("Daily"),
                        type: "Daily"
                    });
                }

                day.add(1, "day");
            }
        } else if (date.startsWith("Custom")) {
            const match = date.match(/\((.*?)\)/);

            if (match && match[1]) {
                const eventDate = moment(match[1], "DD-MM-YYYY");

                const gregorianDate = eventDate.clone().subtract(543, 'years');

                const [startTime, endTime] = time.split(" - ");

                const start = gregorianDate
                    .clone()
                    .set({
                        hour: parseInt(startTime.split(":")[0], 10),
                        minute: parseInt(startTime.split(":")[1], 10),
                    })
                    .toISOString();

                const end = gregorianDate
                    .clone()
                    .set({
                        hour: parseInt(endTime.split(":")[0], 10),
                        minute: parseInt(endTime.split(":")[1], 10),
                    })
                    .toISOString();

                const starts = moment(start).tz("Asia/Bangkok").toDate();
                const ends = moment(end).tz("Asia/Bangkok").toDate();
                const now = moment(getCurrentTime())
                const intime = now.isBetween(starts, ends, undefined, "[]");

                timeline.push({
                    ScheduleID: ScheduleID,
                    title: name,
                    start,
                    end,
                    summary: `${date} (${time})`,
                    color: CustomLightTheme.error,
                    type: "Custom",
                    status: status,
                    statustype: status && intime ? "running" : status && (now.toISOString() > end) ? "end" : status ? "wait" : "stop"
                });

                const dateKey = gregorianDate.format("YYYY-MM-DD");

                if (!markedDates[dateKey]) {
                    markedDates[dateKey] = { dots: [] };
                }

                const customDotExists = markedDates[dateKey].dots.some(dot => dot.type === "Custom");

                if (!customDotExists) {
                    markedDates[dateKey].dots.push({
                        color: getColorForType("Custom"),
                        selectedDotColor: getSelectedColorForType("Custom"),
                        type: "Custom",
                    });
                }
            }
        }
    });

    return { timeline, markedDates };
};

