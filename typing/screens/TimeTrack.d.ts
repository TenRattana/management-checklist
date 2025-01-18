export interface Log {
  start: string | null;
  stop: string | null;
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