import { TimeLine, TimelineItem } from './timeline';
import moment from 'moment-timezone';
import { CustomLightTheme } from '@/constants/CustomColor';
import { getCurrentTime } from '@/config/timezoneUtils';

type ScheduleType = 'Daily' | 'Weekly' | 'Custom';
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

export const convertSchedule = (schedule: TimelineItem[]): { timeline: TimeLine[]; markedDates: MarkedDates } => {
    const today = moment();
    const startOfYear = today.clone().startOf('week');
    const endOfYear = today.clone().endOf('week');
    const timeline: TimeLine[] = [];
    const markedDates: MarkedDates = {};

    const getColorForType = (type: ScheduleType): string => {
        return CustomLightTheme[type === 'Weekly' ? 'drag' : type === 'Daily' ? 'green' : 'error'];
    };

    const getSelectedColorForType = (type: ScheduleType): string => {
        return { Weekly: '#f2f2f2', Daily: '#f4f4f4', Custom: '#f6f6f6' }[type] || '#f8f8f8';
    };

    schedule.forEach((item) => {
        const { date, name, time, ScheduleID, status } = item;
        let day: moment.Moment;

        if (date.startsWith('Weekly')) {
            const weekday = date.match(/\((.*?)\)/)?.[1];
            if (!weekday) return;

            day = startOfYear.clone().day(weekday);
            if (day.isBefore(startOfYear)) day.add(7, 'days');

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
                    color: getColorForType('Weekly'),
                    type: 'Weekly',
                    status,
                    statustype: status ? (intime ? 'running' : (now.isAfter(end) ? 'end' : 'wait')) : 'stop',
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
                    color: getColorForType('Daily'),
                    type: 'Daily',
                    status,
                    statustype: status ? (intime ? 'running' : (now.isAfter(end) ? 'end' : 'wait')) : 'stop',
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
        } else if (date.startsWith('Custom')) {
            const match = date.match(/\((.*?)\)/);
            const eventDate = match ? moment(match[1], 'DD-MM-YYYY') : null;
            if (!eventDate) return;

            const currentYear = moment().year();
            const eventYear = eventDate.year();
            const yearDifference = currentYear - eventYear;
            const gregorianDate = eventDate.clone().add(yearDifference, 'years');

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
                color: getColorForType('Custom'),
                type: 'Custom',
                status,
                statustype: status ? (intime ? 'running' : (now.isAfter(end) ? 'end' : 'wait')) : 'stop',
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
