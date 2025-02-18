import { FormikTouched } from "formik";
import { GroupMachine } from "./GroupMachine";
import { TimelineEventProps } from "react-native-calendars";

export interface TimeScheduleProps {
  ScheduleID: string;
  ScheduleName: string;
  MachineGroup?: GroupMachine[];
  Type_schedule: string;
  Tracking: boolean;
  IsActive: boolean;
  Custom: boolean;
  TimeSlots?: Day[];
  TimeCustom?: Day[];
  TimeWeek?: { [key: string]: Day[] };
}

export interface TimeScemaScheduleProps {
    ScheduleID: string;
    ScheduleName: string;
    MachineGroup?: GroupMachine[];
    Type_schedule: ScheduleType;
    Tracking: boolean;
    IsActive: boolean;
    Custom: boolean;
    TimelineItems: TimelineItem[];
}

export interface TimelineItem {
    ScheduleID: string;
    Date: string;
    Name: string;
    Time: string;
    Status: boolean;
}

type ScheduleType = 'Daily' | 'Weekly' | 'Custom';

type Day = {
    start: string | null;
    end: string | null;
};

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
    info?: TimeScemaScheduleProps;
    Tracking?: Tracking[];
    statustype: string;
}

export type MarkedDates = Record<string, { dots: DOT[] }>;

export type DOT = {
    color: string;
    selectedDotColor: string;
    type?: ScheduleType;
};

export type Event = {
    title: string;
    start: string;
    end: string;
    summary?: string;
    statustype?: string;
    type?: string;
};

export type TimelinesProps = {
    filterStatus: string;
    filterTitle: string[];
    computedTimeline: {
        timeline: TimeLine[];
        markedDates: MarkedDates;
    };
};

export interface ScheduleDialogProps {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    saveData: (values: any) => void;
    initialValues: TimeScheduleProps;
    isEditing: boolean;
}

export interface DailyProps {
    values: Day[];
    setFieldValue: (value: any) => void;
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    touched: boolean | FormikTouched<{
        start: string | null;
        end: string | null;
    }>[] | undefined;
    errors?: any
}

export interface WeekProps {
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    values: { [key: string]: Day[] };
    setFieldValue: (value: any) => void;
}

export interface Custom_scheduleProps {
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    setFieldValue: (value: any) => void;
    values: { start: string | null, end: string | null }[];
    touched: boolean | undefined;
    errors?: any
}

export interface InfoScheduleProps {
    visible: boolean;
    setVisible: (v: boolean) => void;
    setFieldValue: (value: any) => void;
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    values: { start: string | null, end: string | null }[];
    selectedDay: string;
}