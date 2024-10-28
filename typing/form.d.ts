import * as React from "react";

export interface BaseForm {
  FormID: string;
  FormName: string;
  Description: string;
  MachineID: string;
  MachineName?: string;
}

export interface Form extends BaseForm {
  subForms: BaseSubForm[];
}

export interface BaseSubForm {
  SFormID: string;
  SFormName: string;
  FormID: string;
  Columns?: number;
  DisplayOrder?: number;
  MachineID: string;
  Fields:BaseFormState[]
}

export interface SubForm extends BaseSubForm {
  MatchCheckList?: BaseFormState[];
}

export interface FormData extends BaseForm {
  SubForm?: SubForm[];
}

export interface BaseFormState {
  MCListID: string;
  CListID: string;
  GCLOptionID?: string;
  CTypeID: string;
  DTypeID: string;
  DTypeValue?: number;
  SFormID: string;
  Required: boolean;
  MinLength?: number;
  MaxLength?: number;
  Placeholder?: string;
  Hint?: string;
  DisplayOrder?: number;
  EResult?: any;
  CTypeName?:string;
  CListName?:string;
}
export interface RowItemProps <V extends BaseFormState | BaseSubForm> {
    item: V;
    drag: () => void;
    isActive: boolean;
};
export type FormConfig = BaseForm | BaseSubForm | BaseFormState;
