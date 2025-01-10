import * as React from "react";

export interface BaseForm {
  FormID: string;
  FormName: string;
  Description: string;
  MachineID: string;
  MachineName?: string;
  UserID?: string;
  UserName?: string;
  ApporvedID?: string;
  ApporvedName?: string;
  Status?: boolean;
}

export interface Form extends BaseForm {
  subForms: BaseSubForm[];
  itemsMLL?: ({
    label: string;
    value: string;
  } & GroupCheckListOption)[];
  itemCLL?: ({
    label: string;
    value: string;
  } & Checklist)[];
}

export interface BaseSubForm {
  SFormID: string;
  SFormName: string;
  Number: boolean;
  FormID: string;
  Columns?: number;
  DisplayOrder?: number;
  MachineID: string;
  Fields: BaseFormState[];
  Open?: boolean;
}

export interface SubForm extends BaseSubForm {
  MatchCheckList?: BaseFormState[];
}

export interface FormData extends BaseForm {
  SubForm?: SubForm[];
}
export interface BaseImportant {
  MCListID: string;
  Value?: string | string[];
  MinLength?: number;
  MaxLength?: number;
}

export interface BaseFormState {
  MCListID: string;
  CListID: string;
  GCLOptionID?: string;
  CTypeID: string;
  DTypeID: string;
  DTypeName?: string;
  DTypeValue?: number;
  SFormID: string;
  Required: boolean;
  Important: boolean;
  ImportantList?: BaseImportant[];
  Rowcolumn?: number;
  Placeholder?: string;
  Hint?: string;
  DisplayOrder?: number;
  EResult?: any;
  CTypeName?: string;
  CListName?: string;
  GCLOptionName?: string;
}

export interface RowItemProps<V extends BaseFormState | BaseSubForm> {
  item: V;
  drag: () => void;
  getIndex: () => number | undefined;
  isActive: boolean;
}
export type FormConfig = BaseForm | BaseSubForm | BaseFormState;
