import { TimeLine, TimelineItem, TimeScheduleProps } from './timeline';
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

export const convertSchedule = (schedule: TimeScheduleProps[]): { timeline: TimeLine[]; markedDates: MarkedDates } => {
    const today = moment();
    const startOfYear = today.clone().startOf('week');
    const endOfYear = today.clone().endOf('week');
    const timeline: TimeLine[] = [];
    const markedDates: MarkedDates = {};

    const optimizeMoment = (date: moment.Moment, time: string): string => {
        const [hour, minute] = time.split(':').map(Number);
        return date.clone().set({ hour, minute, second: 0, millisecond: 0 }).toISOString();
    };

    const getColorForType = (type: ScheduleType): string =>
        CustomLightTheme[type === 'Weekly' ? 'drag' : type === 'Daily' ? 'green' : 'error'];

    const getSelectedColorForType = (type: ScheduleType): string => ({
        Weekly: '#f2f2f2',
        Daily: '#f4f4f4',
        Custom: '#f6f6f6',
    }[type] || '#f8f8f8');

    const addMarkedDate = (dateKey: string, type: ScheduleType) => {
        if (!markedDates[dateKey]) markedDates[dateKey] = { dots: [] };
        if (!markedDates[dateKey].dots.some((dot) => dot.type === type)) {
            markedDates[dateKey].dots.push({
                color: getColorForType(type),
                selectedDotColor: getSelectedColorForType(type),
                type,
            });
        }
    };

    schedule.forEach((item) => {
        item.TimelineItems.forEach(({ date, name, time, ScheduleID, status }) => {
            const now = moment(getCurrentTime());

            if (date.startsWith('Weekly')) {
                const weekday = date.match(/\((.*?)\)/)?.[1];
                if (!weekday) return;

                let day = startOfYear.clone().day(weekday);
                if (day.isBefore(startOfYear)) day.add(7, 'days');

                while (day.isBetween(startOfYear, endOfYear, 'days', '[]')) {
                    const [startTime, endTime] = time.split(' - ');
                    const start = optimizeMoment(day, startTime);
                    const end = optimizeMoment(day, endTime);
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
                        statustype: status ? (intime ? 'running' : now.isAfter(end) ? 'end' : 'wait') : 'stop',
                    });

                    addMarkedDate(day.format('YYYY-MM-DD'), 'Weekly');
                    day.add(7, 'days');
                }
            } else if (date === 'Recurring Daily') {
                for (let day = startOfYear.clone(); day.isBefore(endOfYear); day.add(1, 'day')) {
                    const [startTime, endTime] = time.split(' - ');
                    const start = optimizeMoment(day, startTime);
                    const end = optimizeMoment(day, endTime);
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
                        statustype: status ? (intime ? 'running' : now.isAfter(end) ? 'end' : 'wait') : 'stop',
                    });

                    addMarkedDate(day.format('YYYY-MM-DD'), 'Daily');
                }
            } else if (date.startsWith('Custom')) {
                const eventDate = moment(date.match(/\((.*?)\)/)?.[1], 'DD-MM-YYYY');
                if (!eventDate.isValid()) return;

                for (let year = startOfYear.year(); year <= endOfYear.year(); year++) {
                    const gregorianDate = eventDate.clone().year(year);

                    const [startTime, endTime] = time.split(' - ');
                    const start = optimizeMoment(gregorianDate, startTime);
                    const end = optimizeMoment(gregorianDate, endTime);
                    const intime = now.isBetween(moment(start), moment(end), undefined, '[]');

                    timeline.push({
                        ScheduleID,
                        title: name,
                        start,
                        end,
                        summary: `Schedule Custom : (${time})`,
                        color: getColorForType('Custom'),
                        type: 'Custom',
                        status,
                        statustype: status ? (intime ? 'running' : now.isAfter(end) ? 'end' : 'wait') : 'stop',
                    });

                    addMarkedDate(gregorianDate.format('YYYY-MM-DD'), 'Custom');
                }
            }
        })
    });

    return { timeline, markedDates };
};

