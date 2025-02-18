export interface Log {
  Start: string | null;
  Stop: string | null;
}

export interface GMachine {
  GMachineID: string;
  GMachineName: string;
}

export interface TimeTrack {
  ScheduleID: string;
  ScheduleName: string;
  GroupMachines: GMachine[];
  Track: Log[] | null;
}