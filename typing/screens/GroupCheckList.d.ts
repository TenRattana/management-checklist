import { CheckListOption } from "../type";
import { Active, BaseDialogProps, Values } from "../value";

export interface GroupCheckListOption {
  GCLOptionID: string;
  GCLOptionName: string;
  IsActive: boolean;
  CheckListOptions?: CheckListOption[];
  Disables: boolean;
  Deletes:boolean;
}

export interface ChecklistGroupDialogProps<V extends Values> extends BaseDialogProps<V> {}

export interface InitialValuesGroupCheckList extends Active {
  groupCheckListOptionId: string;
  groupCheckListOptionName: string;
  disables: boolean;
}