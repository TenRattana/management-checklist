import * as React from "react";
import { TypeConfig } from "./type";
import { FormConfig } from "./form";

export interface Active {
  isActive: boolean;
}

export interface Detail {
  description: string;
}

export interface InitialValuesMachine extends Detail, Active {
  machineGroupId?: string;
  machineId: string;
  machineCode:string | null;
  formId:string | null;
  building:string | null;
  floor:string | null;
  area:string | null;
  machineName: string;
  disables:boolean;
}

export interface InitialValuesGroupMachine extends Detail, Active {
  machineGroupId: string;
  machineGroupName: string;
  disables: boolean; 
}

export interface InitialValuesChecklist extends Active {
  checkListId: string;
  checkListName: string;
  disables:boolean;
}

export interface InitialValuesCheckListOption extends Active {
  checkListOptionId: string;
  checkListOptionName: string;
  disables:boolean;
}

export interface InitialValuesGroupCheckList extends  Active {
  groupCheckListOptionId: string;
  groupCheckListOptionName: string;
  disables:boolean;
}

export interface InitialValuesMatchFormMachine {
  machineId: string;
  formId: string;
  
}

export interface InitialValuesMatchCheckListOption extends Active {
  matchCheckListOptionId: string;
  checkListOptionId: string[];
  groupCheckListOptionId: string;
  disables:boolean;
}

export interface InitialValuesManagepermission {
  UserID?: string;
  UserName: string;
  GUserID: string;
  IsActive: boolean;
}

type Values =
  | InitialValuesMachine
  | InitialValuesGroupMachine
  | InitialValuesChecklist
  | InitialValuesCheckListOption
  | InitialValuesGroupCheckList
  | InitialValuesMatchFormMachine
  | InitialValuesMatchCheckListOption
  | InitialValuesManagepermission;

export type SaveDataFunction<V extends Values, D extends string | undefined> = (
  values: V,
  mode?: D
) => void;

export type OnDelete<V extends string> = (values: V) => void;

export interface SetInitial<V extends Values | FormConfig> {
  initialValues: V;
  isEditing: boolean;
}

export interface SetVisible {
  isVisible: boolean;
  setIsVisible: (v: boolean) => void;
}

export interface BaseDialogProps<V> extends SetVisible, SetInitial<V> {
  saveData: SaveDataFunction<V>;
}

export interface SubFormDialogProps<V extends FormConfig>
  extends BaseDialogProps<V> {
  onDelete: OnDelete<string>;
}

export interface SaveDialogProps extends SetVisible {
  state: any;
}

export interface MachineDialogProps<V extends Values, D extends TypeConfig>
  extends BaseDialogProps<V> {
  machineGroup?: D[];
  dropmachine?: D[];
}

export interface GroupMachineDialogProps<V extends Values>
  extends BaseDialogProps<V> {}

export interface CheckListDialogProps<V extends Values>
  extends BaseDialogProps<V> {}

export interface CheckListOptionProps<V extends Values>
  extends BaseDialogProps<V> {}

export interface ChecklistGroupDialogProps<V extends Values>
  extends BaseDialogProps<V> {}

export interface ManagepermissionDialogProps<
  V extends Values,
  D1 extends TypeConfig,
  D2 extends TypeConfig
> extends BaseDialogProps<V> {
  users: D1[];
  groupUser: D2[];
}
export interface MatchFormMachineDialogProps<
  V extends Values,
  D1 extends TypeConfig,
  D2 extends TypeConfig
> extends BaseDialogProps<V> {
  machine?: D1[];
  dropmachine?: D1[];
  forms?: D2[];
  dropform?: D2[];
}

export interface MatchChecklistOptionProps<
  V extends Values,
  D1 extends TypeConfig,
  D2 extends TypeConfig
> extends BaseDialogProps<V> {
  checkListOption: D1[];
  dropcheckListOption: D1[];
  groupCheckListOption: D2[];
  dropgroupCheckListOption: D2[];
}
