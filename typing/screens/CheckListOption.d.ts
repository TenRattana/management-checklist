import { Active, BaseDialogProps, Values } from "../value";

export interface CheckListOption {
  CLOptionName: string;
  IsActive: boolean;
  CLOptionID: string;
  Disables: boolean;
}

export interface CheckListOptionProps<V extends Values> extends BaseDialogProps<V> {}

export interface InitialValuesCheckListOption extends Active {
  checkListOptionId: string;
  checkListOptionName: string;
  disables: boolean;
}