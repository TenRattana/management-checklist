import { getCurrentTime } from "@/config/timezoneUtils";
import { TimeScheduleProps } from "./TimescheduleScreen";
import { TimelineEventProps } from "react-native-calendars";
import { TimelineItem } from "../HomeScreen";

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
        ],
        IsActive: true,
        TimeWeek: {}
    }
]


const today = getCurrentTime();

const getDate = (offset = 0) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

const getWeeklyDate = (dayOfWeek) => {
    const date = new Date(today);
    const daysToAdd = (7 + dayOfWeek - date.getDay()) % 7;
    date.setDate(date.getDate() + daysToAdd);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

export const convertScheduleToTimeline = (schedule: TimelineItem[]) => {
    const timelineEvents: TimelineEventProps[] = [];

    schedule.forEach(item => {
        if (item.date.includes('Weekly')) {
            const weekDayMap = {
                'MonDay': 1,
                'Tuesday': 2,
                'Wednesday': 3
            };

            const weekDate = getWeeklyDate(weekDayMap[item.date.split('(')[1].split(')')[0]]);

            item.time.split(',').forEach(timeSlot => {
                const [start, end] = timeSlot.split(' - ');
                timelineEvents.push({
                    start: `${weekDate} ${start}:00`,
                    end: `${weekDate} ${end}:00`,
                    title: item.name,
                    summary: `Mocktest on ${item.date}`
                });
            });
        } else if (item.date === 'Recurring Daily') {
            item.time.split(',').forEach(timeSlot => {
                const [start, end] = timeSlot.split(' - ');
                const dayDate = getDate();
                timelineEvents.push({
                    start: `${dayDate} ${start}:00`,
                    end: `${dayDate} ${end}:00`,
                    title: item.name,
                    summary: `Mocktest on Recurring Daily`
                });
            });
        } else if (item.date.includes('Custom')) {
            const customDate = item.date.split('(')[1].split(')')[0];
            const [day, month, year] = customDate.split('-');

            item.time.split(',').forEach(timeSlot => {
                const [start, end] = timeSlot.split(' - ');
                timelineEvents.push({
                    start: `${year}-${month}-${day} ${start}:00`,
                    end: `${year}-${month}-${day} ${end}:00`,
                    title: item.name,
                    summary: `Mocktest on ${item.date}`
                });
            });
        }
    });

    return timelineEvents;
};
