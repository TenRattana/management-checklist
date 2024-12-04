import { Day, TimeScheduleProps } from "./TimescheduleScreen";

export const timeSchedule: TimeScheduleProps[] = [
    {
        ScheduleID: "S00000001",
        ScheduleName: "Schedule test 1",
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
        ScheduleName: "Schedule test 2",
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
        IsActive: false,
        TimeWeek: {}
    },
    {
        ScheduleID: "S00000003",
        ScheduleName: "Schedule test 3",
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
        ScheduleID: "S00000004",
        ScheduleName: "Schedule test 4",
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
            {
                start: "02-12-2567 10:00",
                end: "02-12-2567 11:00"
            },
        ],
        IsActive: true,
        TimeWeek: {}
    },
    {
        ScheduleID: "S00000005",
        ScheduleName: "Schedule test 5",
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
            {
                start: "02-12-2567 10:00",
                end: "02-12-2567 11:00"
            },
        ],
        IsActive: true,
        TimeWeek: {}
    },
    {
        ScheduleID: "S00000006",
        ScheduleName: "Schedule test 6",
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
            {
                start: "02-12-2567 10:00",
                end: "02-12-2567 11:00"
            },
        ],
        IsActive: true,
        TimeWeek: {}
    }
]

export interface Tracking {
    ScheduleID: string;
    Tracking: boolean;
    Status: boolean;
    TrackingTime: Day[];
}

export const point: Tracking[] = [
    {
        ScheduleID: "S00000001",
        Tracking: true,
        Status: false,
        TrackingTime: [
            {
                start: "04-12-2024 10:00",
                end: "04-12-2024 12:00"
            }
        ]
    },
    {
        ScheduleID: "S00000002",
        Tracking: false,
        Status: true,
        TrackingTime: []
    },
    {
        ScheduleID: "S00000003",
        Tracking: true,
        Status: true,
        TrackingTime: []
    }
]