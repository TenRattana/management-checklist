
import { getCurrentTime } from '@/config/timezoneUtils'
import {
    CalendarUtils,
} from 'react-native-calendars';

const EVENT_COLOR = '#e6add8';
const today = getCurrentTime();

export const getDate = (offset = 0) => CalendarUtils.getCalendarDateString(new Date().setDate(today.getDate() + offset));


export const timelineEvents = [
    {
        start: `${getDate(-1)} 09:20:00`,
        end: `${getDate(-1)} 12:00:00`,
        title: 'Merge Request to React Native Calendars',
        status: true,
        summary: 'Merge Timeline Calendar to React Native Calendars',
    },
    {
        start: `${getDate()} 01:15:00`,
        end: `${getDate()} 02:30:00`,
        title: 'Meeting A',
        status: true,
        summary: 'Summary for meeting A',
        color: EVENT_COLOR,
    },
    {
        start: `${getDate(-1)} 09:20:00`,
        end: `${getDate(-1)} 12:00:00`,
        title: 'Merge Request to React Native Calendars',
        status: true,
        summary: 'Merge Timeline Calendar to React Native Calendars',
    },
    {
        start: `${getDate()} 01:15:00`,
        end: `${getDate()} 02:30:00`,
        title: 'Meeting A',
        status: true,
        summary: 'Summary for meeting A',
        color: EVENT_COLOR,
    },
    {
        start: `${getDate()} 04:30:00`,
        end: `${getDate()} 05:30:00`,
        title: 'Meeting F',
        status: true,
        summary: 'Summary for meeting F',
        color: EVENT_COLOR,
    },
    {
        start: `${getDate(1)} 00:30:00`,
        end: ` ${getDate(1)} 01:30:00`,
        title: 'Visit Grand Mother',
        status: true,
        summary: 'Visit Grand Mother and bring some fruits.',
        color: 'lightblue',
    },
    {
        start: `${getDate()} 00:30:00`,
        end: `${getDate()} 23:30:00`,
        title: 'Visit Grand Mother',
        status: true,
        summary: 'Visit Grand Mother and bring some fruits.',
        color: 'lightblue',
    },
    {
        start: `${getDate()} 00: 30:00`,
        end: `${getDate()} 23: 30:00`,
        title: 'Visit Grand Mother',
        status: true,
        summary: 'Visit Grand Mother and bring some fruits.',
        color: 'lightblue',
    },
    {
        start: `${getDate()} 00: 30:00`,
        end: `${getDate()} 23: 30:00`,
        title: 'Visit Grand Mother',
        status: true,
        summary: 'Visit Grand Mother and bring some fruits.',
        color: 'lightblue',
    },
    {
        start: `${getDate()} 00: 30:00`,
        end: `${getDate()} 23: 30:00`,
        title: 'Visit Grand Mother',
        status: true,
        summary: 'Visit Grand Mother and bring some fruits.',
        color: 'lightblue',
    },
    {
        start: ` ${getDate()} 00: 30:00`,
        end: `${getDate()} 23: 30:00`,
        title: 'Visit Grand Mother',
        status: true,
        summary: 'Visit Grand Mother and bring some fruits.',
        color: 'lightblue',
    },
    {
        start: `${getDate(-1)} 00: 30:00`,
        end: `${getDate(-1)} 23: 30:00`,
        title: 'Visit Grand Mother',
        status: true,
        summary: 'Visit Grand Mother and bring some fruits.',
        color: 'lightblue',
    },
];
