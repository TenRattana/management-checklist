import { Active, BaseDialogProps, Values } from "../value";

export interface MatchCheckListOption {
  MCLOptionID: string;
  GCLOptionID: string;
  CheckListOptions: Array<{ CLOptionID: string }>;
  GCLOptionName?:string;
  CLOptionName?:string;
  IsActive: boolean;
  GCLOptionName: string;
  Disables: boolean;
  Deletes:boolean;
}

export interface MatchChecklistOptionProps<V extends Values> extends BaseDialogProps<V> {}

export interface InitialValuesMatchCheckListOption extends Active {
  matchCheckListOptionId: string;
  checkListOptionId: string[];
  groupCheckListOptionId: string;
  groupCheckListOptionName?: string;
  disables: boolean;
}