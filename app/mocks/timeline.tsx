
import { getCurrentTime } from '@/config/timezoneUtils'
import {
    CalendarUtils,
} from 'react-native-calendars';

const today = getCurrentTime();

export const getDate = (offset = 0) => CalendarUtils.getCalendarDateString(today.setDate(today.getDate() + offset));

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