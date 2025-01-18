import * as React from "react";

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
export interface Day {
  start: string | null;
  end: string | null;
}
export interface DataType {
  DTypeID: string;
  DTypeName: string;
  Icon: string;
  IsActive: boolean;
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
  PF_GroupMachine: string;
  PF_Machine: string;
  PF_CheckList: string;
  PF_GroupCheckList: string;
  PF_CheckListOption: string;
  PF_MatchCheckListOption: string;
  PF_MatchFormMachine: string;
  PF_Form: string;
  PF_SubForm: string;
  PF_ExpectedResult: string;
  PF_UsersPermission: string;
  PF_TimeSchedule: string;
}
export interface AppSetting {
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
export interface AppProps extends Prefixs , AppSetting {
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
  Icon:string;
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
  Icon:string;
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
