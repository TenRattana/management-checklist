import * as React from "react";

// Domain-Specific Interfaces
export interface MachineGroup {
  MGroupID: string;
  MGroupName: string;
  Description: string;
  IsActive: boolean;
}

export interface Machine {
  MGroupID: string;
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
}

export interface Form {
    FormID: string;
    FormName: string;
    IsActive: boolean;
}

export interface MatchForm {
    MachineID: string;
    FormID: string;
    MachineName: string;
    FormName: string;
    IsActive:boolean;
}

export interface MatchCheckListOption {
    MCLOptionID: string;
    GCLOptionID: string;
    CheckListOptions: Array<{ CLOptionID: string }>;
    IsActive: boolean;
    GCLOptionName: string;
}

export type TypeConfig = 
  | MachineGroup 
  | Machine 
  | Checklist 
  | CheckListType 
  | CheckListOption 
  | DataType 
  | GroupCheckListOption
  | Form
  | MatchForm
  | MatchCheckListOption;