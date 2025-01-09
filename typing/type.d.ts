import * as React from "react";

// Domain-Specific Interfaces
export interface GroupMachine {
  GMachineID: string;
  GMachineName: string;
  Description: string;
  IsActive: boolean;
  Disables: boolean;
  Deletes:boolean;
}

export interface Machine {
  GMachineID: string;
  MachineID: string;
  GMachineName?: string;
  FormID: string | null;
  MachineCode: string | null;
  MachineName: string;
  Description: string;
  Building: string | null;
  Floor: string | null;
  Area: string | null;
  IsActive: boolean;
  Disables: boolean;
}

export interface TimeDetail {
  TDetailID: string;
  StartTime: string;
  EndTime: string;
}
export interface TimeSchedule {
  TScheduleID: string;
  TScheduleName: string;
  IsActive: boolean;
  Machine?: { MachineID: string; MachineName: string }[];
  TimeDetail?: TimeDetail[];
}
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

export interface Day {
  start: string | null;
  end: string | null;
}
export interface CheckList {
  CTypeID: string;
  CTypeName: string;
  CTypeTitle: string;
  Icon: string;
  IsActive: boolean;
  Disables: boolean;
}

export interface CheckListType {
  GTypeID: string;
  GTypeName: string;
  IsActive: boolean;
  CheckList?: CheckList[];
}

export interface CheckListOption {
  CLOptionName: string;
  IsActive: boolean;
  CLOptionID: string;
  Disables: boolean;
}

export interface DataType {
  DTypeID: string;
  DTypeName: string;
  Icon: string;
  IsActive: boolean;
}

export interface Checklist {
  CListID: string;
  CListName: string;
  IsActive: boolean;
  Disables: boolean;
}

export interface GroupCheckListOption {
  GCLOptionID: string;
  GCLOptionName: string;
  IsActive: boolean;
  CheckListOptions?: CheckListOption[];
  Disables: boolean;
}

export interface Form {
  FormID: string;
  FormName: string;
  IsActive: boolean;
  FormState?: string;
  Description: string;
  Disables: boolean;
}

export interface MatchForm {
  MachineID: string;
  FormID: string;
  MachineName: string;
  FormName: string;
  IsActive: boolean;
}

export interface MatchCheckListOption {
  MCLOptionID: string;
  GCLOptionID: string;
  CheckListOptions: Array<{ CLOptionID: string }>;
  GCLOptionName?:string;
  CLOptionName?:string;
  IsActive: boolean;
  GCLOptionName: string;
  Disables: boolean;
  Deletes:boolean;
}

export interface ExpectedResult {
  TableID: string;
  MachineID: string;
  MachineName: string;
  UserID: string;
  UserName ?: string;
  ApporvedID: string;
  ApporvedName?: string;
  FormID: string;
  FormName: string;
  CreateDate: string;
}
export interface Users {
  User;
  UserName: string;
}
export interface UsersPermission {
  UserID: string;
  UserName: string;
  GUserID: string;
  IsActive: boolean;
}

export interface Userset {
  UserName: string;
}

export interface GroupUsers {
  GUserID: string;
  GUserName: string;
  IsActive: boolean;
}

export interface Prefixs {
  AppID: string;
  GroupMachine: string;
  Machine: string;
  CheckList: string;
  GroupCheckList: string;
  CheckListOption: string;
  MatchCheckListOption: string;
  MatchFormMachine: string;
  Form: string;
  SubForm: string;
  ExpectedResult: string;
  UsersPermission: string;
  TimeSchedule: string;
}

export interface AppProps extends Prefixs {
  AppName: string;
}

export interface ParentMenu {
  MenuID: number;
  MenuPermission: string;
  MenuLabel: string;
  ParentMenuID: string | null;
  PermissionID: number;
  Path: string | null;
  NavigationTo: string;
  OrderNo: number | null;
  IsActive: boolean;
}
export interface Menus {
  MenuID: number;
  MenuPermission: string;
  MenuLabel: string;
  ParentMenuID: string | null;
  PermissionID: number;
  Path: string | null;
  NavigationTo: string;
  OrderNo: number | null;
  IsActive: boolean;
  ParentMenu: ParentMenu[];
}
export interface Permissions {
  PermissionID: number;
  PermissionName: string;
  Description: string;
  IsActive: boolean;
}
export interface TimeScheduleMachine {
  MachineName: string;
  Area?: string;
  Building?: string;
  Floor?: string;
  MachineCode?: string;
  FormName: string;
  IsActive: boolean;
}

export type ComponentNames =
  | "InputFormMachine"
  | "Preview"
  | "Create_form"
  | "Home"
  | "Apporved"
  | "Machine_group"
  | "Machine"
  | "Checklist"
  | "Login"
  | "ScanQR"
  | "Setting"
  | "Config"
  | "Permission_deny"
  | "Checklist_option"
  | "Checklist_group"
  | "Form"
  | "Expected_result"
  | "Match_checklist_option"
  | "Match_form_machine"
  | "Managepermissions"
  | "Time"
  | "TimeTrack";

export type ComponentNameNoLazy =
  | "Create_form"
  | "Home"
  | "Apporved"
  | "Machine_group"
  | "Machine"
  | "Checklist"
  | "Login"
  | "ScanQR"
  | "Setting"
  | "Config"
  | "Permission_deny"
  | "Checklist_option"
  | "Checklist_group"
  | "Form"
  | "Expected_result"
  | "Match_checklist_option"
  | "Match_form_machine"
  | "Managepermissions"
  | "Test"
  | "Time"
  | "TimeTrack";

export type TypeConfig =
  | GroupMachine
  | Machine
  | Checklist
  | CheckListType
  | CheckList
  | CheckListOption
  | DataType
  | GroupCheckListOption
  | Form
  | SubForm
  | MatchForm
  | MatchCheckListOption
  | Users
  | GroupUsers
  | UsersPermission
  | TimeSchedule;
