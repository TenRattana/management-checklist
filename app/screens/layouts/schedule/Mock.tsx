import { TimelineItem } from "@/app/mocks/timeline";
import { TimeScheduleProps } from "./TimescheduleScreen";
import { TimelineEventProps } from "react-native-calendars";

export const timeSchedule: TimeScheduleProps[] = [
    {
        ScheduleID: "S00000001",
        ScheduleName: "Mocktest 1",
        MachineGroup: ["GMmm00003", "GMmm00002"],
        Type_schedule: "Weekly",
        Tracking: true,
        Custom: false,
        TimeSlots: [],
        TimeCustom: [],
        IsActive: true,
        TimeWeek: {
            MonDay: [
                {
                    start: "00:00",
                    end: "04:00"
                },
                {
                    start: "04:00",
                    end: "08:00"
                },
                {
                    start: "08:00",
                    end: "12:00"
                },
                {
                    start: "12:00",
                    end: "16:00"
                },
                {
                    start: "16:00",
                    end: "20:00"
                },
                {
                    start: "20:00",
                    end: "24:00"
                }
            ],
            Tuesday: [
                {
                    start: "00:00",
                    end: "06:00"
                },
                {
                    start: "06:00",
                    end: "12:00"
                },
                {
                    start: "12:00",
                    end: "18:00"
                },
                {
                    start: "18:00",
                    end: "24:00"
                }
            ],
            Wednesday: [
                {
                    start: "00:00",
                    end: "12:00"
                },
                {
                    start: "12:00",
                    end: "24:00"
                }
            ]
        }
    },
    {
        ScheduleID: "S00000002",
        ScheduleName: "Mocktest 2",
        MachineGroup: ["GMmm00001"],
        Type_schedule: "Daily",
        Tracking: false,
        Custom: false,
        TimeSlots: [
            {
                start: "00:00",
                end: "04:00"
            },
            {
                start: "04:00",
                end: "08:00"
            },
            {
                start: "08:00",
                end: "12:00"
            },
            {
                start: "12:00",
                end: "16:00"
            },
            {
                start: "16:00",
                end: "20:00"
            },
            {
                start: "20:00",
                end: "24:00"
            }
        ],
        TimeCustom: [],
        IsActive: true,
        TimeWeek: {}
    },
    {
        ScheduleID: "S00000003",
        ScheduleName: "Mocktest 3",
        MachineGroup: ["GMmm00004"],
        Type_schedule: "Custom",
        Tracking: true,
        Custom: false,
        TimeSlots: [],
        TimeCustom: [
            {
                start: "20-11-2567 10:00",
                end: "20-11-2567 11:00"
            },
            {
                start: "20-11-2567 12:00",
                end: "20-11-2567 13:00"
            },
            {
                start: "20-02-2567 10:00",
                end: "21-02-2567 10:00"
            },
            {
                start: "02-12-2567 10:00",
                end: "02-12-2567 11:00"
            },
        ],
        IsActive: true,
        TimeWeek: {}
    }
]

import moment from "moment";
import { useTheme } from "@/app/contexts/useTheme";

export interface TimeLine extends TimelineEventProps {
    type?: string;
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
    const startOfWeek = today.clone().startOf("week");
    const endOfWeek = today.clone().endOf("week");
    const timeline: TimeLine[] = [];
    const markedDates: MarkedDates = {};
    const { theme } = useTheme();

    const getColorForType = (type: string) => {
        switch (type) {
            case "Weekly":
                return theme.colors.primary;
            case "Daily":
                return theme.colors.secondary;
            case "Custom":
                return theme.colors.error;
            default:
                return theme.colors.text;
        }
    };

    const getSelectedColorForType = (type: string) => {
        switch (type) {
            case "Weekly":
                return theme.colors.accent;
            case "Daily":
                return theme.colors.primary;
            case "Custom":
                return theme.colors.error;
            default:
                return theme.colors.green;
        }
    };

    schedule.forEach((item) => {
        const { date, name, time }: any = item;

        if (date.startsWith("Weekly")) {
            const weekday = date.match(/\((.*?)\)/)[1];
            const day = moment().day(weekday).startOf("day");

            if (day.isBetween(startOfWeek, endOfWeek, "days", "[]")) {
                const [startTime, endTime] = time.split(" - ");
                const start = day
                    .clone()
                    .set({
                        hour: parseInt(startTime.split(":")[0]),
                        minute: parseInt(startTime.split(":")[1]),
                    })
                    .toISOString();
                const end = day
                    .clone()
                    .set({
                        hour: parseInt(endTime.split(":")[0]),
                        minute: parseInt(endTime.split(":")[1]),
                    })
                    .toISOString();

                timeline.push({
                    title: name,
                    start,
                    end,
                    summary: `${date} (${time})`,
                    color: theme.colors.blue,
                    type: "Weekly",
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
                        type: "Weekly"
                    });
                }
            }
        } else if (date === "Recurring Daily") {
            for (let i = 0; i < 7; i++) {
                const day = startOfWeek.clone().add(i, "days");
                const [startTime, endTime] = time.split(" - ");
                const start = day
                    .clone()
                    .set({
                        hour: parseInt(startTime.split(":")[0]),
                        minute: parseInt(startTime.split(":")[1]),
                    })
                    .toISOString();
                const end = day
                    .clone()
                    .set({
                        hour: parseInt(endTime.split(":")[0]),
                        minute: parseInt(endTime.split(":")[1]),
                    })
                    .toISOString();

                timeline.push({
                    title: name,
                    start,
                    end,
                    summary: `${date} (${time})`,
                    color: theme.colors.green,
                    type: "Daily",
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

                timeline.push({
                    title: name,
                    start,
                    end,
                    summary: `${date} (${time})`,
                    color: theme.colors.error,
                    type: "Custom",
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
