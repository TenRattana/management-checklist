import { TimelineItem } from "@/app/mocks/timeline";
import { TimeScheduleProps } from "./TimescheduleScreen";
import { CalendarUtils } from "react-native-calendars";

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

import moment from 'moment';

/**
 * Converts a schedule into timeline items, including recurring weekly and daily events.
 * @param {Array} schedule - Array of schedule items.
 * @returns {Array} Timeline items with recurring events.
 */
export const convertScheduleToTimeline = (schedule: TimelineItem[]) => {
    const today = moment();
    const startOfWeek = today.clone().startOf('week');
    const endOfWeek = today.clone().endOf('week');
    const result: any = [];

    schedule.forEach((item) => {
        const { date, name, time }: any = item;

        if (date.startsWith('Weekly')) {
            const weekday = date.match(/\((.*?)\)/)[1];
            const day = moment().day(weekday).startOf('day');

            if (day.isBetween(startOfWeek, endOfWeek, 'days', '[]')) {
                const [startTime, endTime] = time.split(' - ');
                result.push({
                    title: name,
                    start: day.clone().set({
                        hour: parseInt(startTime.split(':')[0]),
                        minute: parseInt(startTime.split(':')[1]),
                    }).toISOString(),
                    end: day.clone().set({
                        hour: parseInt(endTime.split(':')[0]),
                        minute: parseInt(endTime.split(':')[1]),
                    }).toISOString(),
                    summary: `${date} (${time})`,
                });
            }
        } else if (date === 'Recurring Daily') {
            for (let i = 0; i < 7; i++) {
                const day = startOfWeek.clone().add(i, 'days');
                const [startTime, endTime] = time.split(' - ');

                result.push({
                    title: name,
                    start: day.clone().set({
                        hour: parseInt(startTime.split(':')[0]),
                        minute: parseInt(startTime.split(':')[1]),
                    }).toISOString(),
                    end: day.clone().set({
                        hour: parseInt(endTime.split(':')[0]),
                        minute: parseInt(endTime.split(':')[1]),
                    }).toISOString(),
                    summary: `${date} (${time})`,
                });
            }
        } else if (date.startsWith('Custom')) {
            const eventDate = moment(date.match(/\((.*?)\)/)[1], 'DD-MM-YYYY');
            const [startTime, endTime] = time.split(' - ');
            
            result.push({
                title: name,
                start: eventDate.clone().set({
                        year: eventDate.year() - 543, 
                        hour: parseInt(startTime.split(':')[0], 10),
                        minute: parseInt(startTime.split(':')[1], 10), 
                    }).toISOString(),
                end: eventDate.clone().set({
                    year: eventDate.year() - 543, 
                    hour: parseInt(endTime.split(':')[0], 10),
                    minute: parseInt(endTime.split(':')[1], 10), 
                }).toISOString(),
                summary: `${date} (${time})`,
            });
        }
    });

    return result;
};

