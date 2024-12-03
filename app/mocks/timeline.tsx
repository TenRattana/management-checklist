
import { getCurrentTime } from '@/config/timezoneUtils'
import {
    CalendarUtils,
} from 'react-native-calendars';
import { convertScheduleToTimeline } from '../screens/layouts/schedule/Mock';
import { useState } from 'react';

const EVENT_COLOR = '#e6add8';
const today = getCurrentTime();

export const getDate = (offset = 0) => CalendarUtils.getCalendarDateString(new Date().setDate(today.getDate() + offset));

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
        const { ScheduleName, Type_schedule, TimeSlots, TimeCustom, TimeWeek } = schedule;

        if (Type_schedule === "Daily" && Array.isArray(TimeSlots)) {
            TimeSlots?.forEach((slot) => {
                if (slot.start && slot.end) {
                    timeline.push({
                        date: "Recurring Daily",
                        name: ScheduleName,
                        time: `${slot.start} - ${slot.end}`,
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
                                date: `Weekly (${day})`,
                                name: ScheduleName,
                                time: `${slot.start} - ${slot.end}`,
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
                        date: `Custom (${startDate})`,
                        name: ScheduleName,
                        time: `${startTime} - ${endTime}`,
                    });
                }
            });
        }
    });

    return timeline;
};

export type TimelineItem = {
    date: string;
    name: string;
    time: string;
};

type Props = {
    schedules: TimeScheduleProps[];
};



// export const timelineEvents = [
//     {
//         start: `${getDate(-1)} 09:20:00`,
//         end: `${getDate(-1)} 12:00:00`,
//         title: 'Merge Request to React Native Calendars',
//         status: true,
//         summary: 'Merge Timeline Calendar to React Native Calendars',
//     },
//     {
//         start: `${getDate()} 01:15:00`,
//         end: `${getDate()} 02:30:00`,
//         title: 'Meeting A',
//         status: true,
//         summary: 'Summary for meeting A',
//         color: EVENT_COLOR,
//     },
//     {
//         start: `${getDate(-1)} 09:20:00`,
//         end: `${getDate(-1)} 12:00:00`,
//         title: 'Merge Request to React Native Calendars',
//         status: true,
//         summary: 'Merge Timeline Calendar to React Native Calendars',
//     },
//     {
//         start: `${getDate()} 01:15:00`,
//         end: `${getDate()} 02:30:00`,
//         title: 'Meeting A',
//         status: true,
//         summary: 'Summary for meeting A',
//         color: EVENT_COLOR,
//     },
//     {
//         start: `${getDate()} 04:30:00`,
//         end: `${getDate()} 05:30:00`,
//         title: 'Meeting F',
//         status: true,
//         summary: 'Summary for meeting F',
//         color: EVENT_COLOR,
//     },
//     {
//         start: `${getDate(1)} 00:30:00`,
//         end: ` ${getDate(1)} 01:30:00`,
//         title: 'Visit Grand Mother',
//         status: true,
//         summary: 'Visit Grand Mother and bring some fruits.',
//         color: 'lightblue',
//     },
//     {
//         start: `${getDate()} 00:30:00`,
//         end: `${getDate()} 23:30:00`,
//         title: 'Visit Grand Mother',
//         status: true,
//         summary: 'Visit Grand Mother and bring some fruits.',
//         color: 'lightblue',
//     },
//     {
//         start: `${getDate()} 00: 30:00`,
//         end: `${getDate()} 23: 30:00`,
//         title: 'Visit Grand Mother',
//         status: true,
//         summary: 'Visit Grand Mother and bring some fruits.',
//         color: 'lightblue',
//     },
//     {
//         start: `${getDate()} 00: 30:00`,
//         end: `${getDate()} 23: 30:00`,
//         title: 'Visit Grand Mother',
//         status: true,
//         summary: 'Visit Grand Mother and bring some fruits.',
//         color: 'lightblue',
//     },
//     {
//         start: `${getDate()} 00: 30:00`,
//         end: `${getDate()} 23: 30:00`,
//         title: 'Visit Grand Mother',
//         status: true,
//         summary: 'Visit Grand Mother and bring some fruits.',
//         color: 'lightblue',
//     },
//     {
//         start: ` ${getDate()} 00: 30:00`,
//         end: `${getDate()} 23: 30:00`,
//         title: 'Visit Grand Mother',
//         status: true,
//         summary: 'Visit Grand Mother and bring some fruits.',
//         color: 'lightblue',
//     },
//     {
//         start: `${getDate(-1)} 00: 30:00`,
//         end: `${getDate(-1)} 23: 30:00`,
//         title: 'Visit Grand Mother',
//         status: true,
//         summary: 'Visit Grand Mother and bring some fruits.',
//         color: 'lightblue',
//     },
// ];
