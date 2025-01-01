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
    TimelineItems:TimelineItem[];
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
