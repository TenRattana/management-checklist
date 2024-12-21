import { getCurrentTime } from '@/config/timezoneUtils';
import {
    CalendarUtils,
    TimelineEventProps,
} from 'react-native-calendars';
import moment from 'moment';
import { CustomLightTheme } from '@/constants/CustomColor';
import { GroupMachine } from '@/typing/type';

type ScheduleType = 'Daily' | 'Weekly' | 'Custom';

type Day = {
    start: string | null;
    end: string | null;
};

export interface TimeScheduleProps {
    ScheduleID: string;
    ScheduleName: string;
    MachineGroup?: GroupMachine[];
    Type_schedule: ScheduleType;
    Tracking: boolean;
    IsActive: boolean;
    Custom: boolean;
    TimeSlots?: Day[];
    TimeCustom?: Day[];
    TimeWeek?: Record<string, Day[]>;
}

export interface TimelineItem {
    ScheduleID: string;
    date: string;
    name: string;
    time: string;
    status: boolean;
}

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
    info?: TimeScheduleProps;
    Tracking?: Tracking[];
    statustype: string;
}

type MarkedDates = Record<string, { dots: DOT[] }>;

type DOT = {
    color: string;
    selectedDotColor: string;
    type?: ScheduleType;
};

const optimizeMoment = (date: moment.Moment, time: string): string => {
    const [hour, minute] = time.split(':').map(Number);
    return date.clone().set({ hour, minute, second: 0, millisecond: 0 }).toISOString();
};

export const parseTimeScheduleToTimeline = (schedules: TimeScheduleProps[]): TimelineItem[] => {
    const timeline: TimelineItem[] = [];

    schedules?.forEach((schedule) => {
        const { ScheduleID, ScheduleName, Type_schedule, TimeSlots, TimeCustom, TimeWeek, IsActive } = schedule;

        if (Type_schedule === "Daily" && Array.isArray(TimeSlots)) {
            const dailySlots = TimeSlots.filter(slot => slot.start && slot.end);
            dailySlots.forEach((slot) => {
                timeline.push({
                    ScheduleID,
                    date: "Recurring Daily",
                    name: ScheduleName,
                    time: `${slot.start} - ${slot.end}`,
                    status: IsActive
                });
            });
        }

        if (Type_schedule === "Weekly" && TimeWeek && typeof TimeWeek === 'object') {
            Object.entries(TimeWeek).forEach(([day, slots]) => {
                if (Array.isArray(slots)) {
                    const weeklySlots = slots.filter(slot => slot.start && slot.end);
                    weeklySlots.forEach((slot) => {
                        timeline.push({
                            ScheduleID,
                            date: `Weekly (${day})`,
                            name: ScheduleName,
                            time: `${slot.start} - ${slot.end}`,
                            status: IsActive
                        });
                    });
                }
            });
        }

        if (Type_schedule === "Custom" && Array.isArray(TimeCustom)) {
            const customSlots = TimeCustom.filter(customSlot => customSlot.start && customSlot.end);

            customSlots.forEach((customSlot: Day) => {
                const [startDate = '', startTime = ''] = (customSlot.start ?? '').split(" ") || [];
                const [, endTime = ''] = (customSlot.end ?? '').split(" ") || [];

                timeline.push({
                    ScheduleID,
                    date: `Custom (${startDate})`,
                    name: ScheduleName,
                    time: `${startTime} - ${endTime}`,
                    status: IsActive
                });
            });
        }
    });

    return timeline;
};

export const convertScheduleToTimeline = (
    schedule: TimelineItem[]
): { timeline: TimeLine[]; markedDates: MarkedDates } => {
    const today = moment();
    const startOfYear = moment().startOf('year');
    const endOfYear = moment().endOf('year');
    const timeline: TimeLine[] = [];
    const markedDates: MarkedDates = {};

    const getColorForType = (type: ScheduleType): string => {
        return CustomLightTheme[
            type === 'Weekly' ? 'drag' : type === 'Daily' ? 'green' : 'error'
        ];
    };

    const getSelectedColorForType = (type: ScheduleType): string => {
        return {
            Weekly: '#f2f2f2',
            Daily: '#f4f4f4',
            Custom: '#f6f6f6',
        }[type] || '#f8f8f8';
    };

    schedule.forEach((item) => {
        const { date, name, time, ScheduleID, status } = item;

        if (date && date.startsWith('Weekly')) {
            const weekday = date.match(/\((.*?)\)/)?.[1];

            if (!weekday) return;

            let day = startOfYear.clone().day(weekday);

            if (day.isBefore(startOfYear)) {
                day.add(7, 'days');
            }

            while (day.isBetween(startOfYear, endOfYear, 'days', '[]')) {
                const [startTime, endTime] = time.split(' - ');
                const start = optimizeMoment(day, startTime);
                const end = optimizeMoment(day, endTime);
                const now = moment(getCurrentTime());
                const intime = now.isBetween(moment(start), moment(end), undefined, '[]');

                timeline.push({
                    ScheduleID,
                    title: name,
                    start,
                    end,
                    summary: `${date} (${time})`,
                    color: CustomLightTheme.drag,
                    type: 'Weekly',
                    status,
                    statustype:
                        status && intime
                            ? 'running'
                            : status && now.isAfter(end)
                                ? 'end'
                                : status
                                    ? 'wait'
                                    : 'stop',
                });


                const dateKey = day.format('YYYY-MM-DD');
                if (!markedDates[dateKey]) {
                    markedDates[dateKey] = { dots: [] };
                }

                if (!markedDates[dateKey].dots.some((dot) => dot.type === 'Weekly')) {
                    markedDates[dateKey].dots.push({
                        color: getColorForType('Weekly'),
                        selectedDotColor: getSelectedColorForType('Weekly'),
                        type: 'Weekly',
                    });
                }

                day.add(7, 'days');
            }
        } else if (date === 'Recurring Daily') {
            let day = startOfYear.clone();

            while (day.isBetween(startOfYear, endOfYear, 'days', '[]')) {
                const [startTime, endTime] = time.split(' - ');
                const start = optimizeMoment(day, startTime);
                const end = optimizeMoment(day, endTime);
                const now = moment(getCurrentTime());
                const intime = now.isBetween(moment(start), moment(end), undefined, '[]');

                timeline.push({
                    ScheduleID,
                    title: name,
                    start,
                    end,
                    summary: `${date} (${time})`,
                    color: CustomLightTheme.green,
                    type: 'Daily',
                    status,
                    statustype:
                        status && intime
                            ? 'running'
                            : status && now.isAfter(end)
                                ? 'end'
                                : status
                                    ? 'wait'
                                    : 'stop',
                });

                const dateKey = day.format('YYYY-MM-DD');
                if (!markedDates[dateKey]) {
                    markedDates[dateKey] = { dots: [] };
                }

                if (!markedDates[dateKey].dots.some((dot) => dot.type === 'Daily')) {
                    markedDates[dateKey].dots.push({
                        color: getColorForType('Daily'),
                        selectedDotColor: getSelectedColorForType('Daily'),
                        type: 'Daily',
                    });
                }

                day.add(1, 'day');
            }
        } else if (date && date.startsWith('Custom')) {
            const match = date.match(/\((.*?)\)/);
            const eventDate = match ? moment(match[1], 'DD-MM-YYYY') : null;

            if (!eventDate) return;

            const gregorianDate = eventDate.clone().subtract(543, 'years');
            const [startTime, endTime] = time.split(' - ');
            const start = optimizeMoment(gregorianDate, startTime);
            const end = optimizeMoment(gregorianDate, endTime);
            const now = moment(getCurrentTime());
            const intime = now.isBetween(moment(start), moment(end), undefined, '[]');

            timeline.push({
                ScheduleID,
                title: name,
                start,
                end,
                summary: `${date} (${time})`,
                color: CustomLightTheme.error,
                type: 'Custom',
                status,
                statustype:
                    status && intime
                        ? 'running'
                        : status && now.isAfter(end)
                            ? 'end'
                            : status
                                ? 'wait'
                                : 'stop',
            });

            const dateKey = gregorianDate.format('YYYY-MM-DD');
            if (!markedDates[dateKey]) {
                markedDates[dateKey] = { dots: [] };
            }

            if (!markedDates[dateKey].dots.some((dot) => dot.type === 'Custom')) {
                markedDates[dateKey].dots.push({
                    color: getColorForType('Custom'),
                    selectedDotColor: getSelectedColorForType('Custom'),
                    type: 'Custom',
                });
            }
        }
    });

    return { timeline, markedDates };
};
