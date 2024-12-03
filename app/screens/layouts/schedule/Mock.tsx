import { TimeScheduleProps } from "./TimescheduleScreen";

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