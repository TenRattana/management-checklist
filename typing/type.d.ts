import * as React from "react";

// Domain-Specific Interfaces
export interface GroupMachine {
  GMachineID: string;
  GMachineName: string;
  Description: string;
  IsActive: boolean;
  Disables: boolean;
}

export interface Machine {
  GMachineID: string;
  MachineID: string;
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

export interface CheckListType {
  CTypeID: string;
  CTypeName: string;
  Icon: string;
  IsActive: boolean;
  Disables: boolean;
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
  IsActive: boolean;
  GCLOptionName: string;
  Disables: boolean;
}

export interface ExpectedResult {
  TableID: string;
  MachineID: string;
  MachineName: string;
  UserID: string;
  ApporvedID:string;
  FormID: string;
  FormName: string;
  CreateDate: string;
}
export interface Users {
  User
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
export interface Menu {
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

export type ComponentNames =
  | "Create_form"
  | "InputFormMachine"
  | "Preview"
  | "Apporved";

export type ComponentNameNoLazy =
  | "Machine_group"
  | "Machine"
  | "Checklist"
  | "Home"
  | "ScanQR"
  | "GenerateQR"
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
  | "Test";

export type TypeConfig =
  | GroupMachine
  | Machine
  | Checklist
  | CheckListType
  | CheckListOption
  | DataType
  | GroupCheckListOption
  | Form
  | SubForm
  | MatchForm
  | MatchCheckListOption
  | Users
  | GroupUsers
  | UsersPermission;
