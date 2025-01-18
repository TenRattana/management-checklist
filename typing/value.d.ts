import * as React from "react";
import { TypeConfig } from "./type";
import { FormConfig } from "./form";

export interface Active {
  isActive: boolean;
}
export interface Detail {
  description: string;
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

export interface SubFormDialogProps<V extends FormConfig> extends BaseDialogProps<V> {
  onDelete: OnDelete<string>;
}

export interface SaveDialogProps extends SetVisible {
  state: any;
}
export interface ManagepermissionDialogProps<V extends Values,D1 extends TypeConfig,D2 extends TypeConfig> extends BaseDialogProps<V> {
  users: D1[];
  groupUser: D2[];
}