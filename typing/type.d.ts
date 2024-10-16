import * as React from "react";

// Domain-Specific Interfaces
export interface GroupMachine {
  GMachineID: string;
  GMachineName: string;
  Description: string;
  IsActive: boolean;
}

export interface Machine {
  GMachineID: string;
  MachineID: string;
  MachineName: string;
  Description: string;
  IsActive: boolean;
}

export interface CheckListType {
  CTypeID: string;
  CTypeName: string;
  Icon: string;
  IsActive: boolean;
}

export interface CheckListOption {
  CLOptionName: string;
  IsActive: boolean;
  CLOptionID: string;
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
}

export interface GroupCheckListOption {
  GCLOptionID: string;
  GCLOptionName: string;
  Description: string;
  IsActive: boolean;
  CheckListOptions?: CheckListOption[];
}

export interface Form {
  FormID: string;
  FormName: string;
  IsActive: boolean;
  Description: string;
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
}

export interface ExpectedResult {
  TableID: string;
  MachineID: string;
  MachineName: string;
  FormID: string;
  FormName: string;
  CreateDate: string;
}
export interface Users {
  UserName: string;
}
export interface UsersPermission {
  UserID: string;
  UserName: string;
  GUserID : string;
  IsActive: boolean;
}

export interface Userset {
  UserName: string;
}

export interface GroupUsers {
  GUserID: string; 
  GUserName:string;
  IsActive: boolean;
}

export type TypeConfig =
  | GroupMachine
  | Machine
  | Checklist
  | CheckListType
  | CheckListOption
  | DataType
  | GroupCheckListOption
  | Form
  | MatchForm
  | MatchCheckListOption
  | Users
  | GroupUsers
  | UsersPermission ;
