import { Active, BaseDialogProps, Values } from "../value";

export interface CheckList {
  CListID: string;
  CListName: string;
  IsActive: boolean;
  Disables: boolean;
}

export interface CheckListType {
  CTypeID: string;
  CTypeName: string;
  CTypeTitle: string;
  Icon: string;
  IsActive: boolean;
  Disables: boolean;
}

export interface GroupCheckListType {
  GTypeID: string;
  GTypeName: string;
  IsActive: boolean;
  CheckListTypes?: CheckListType[];
}

export interface CheckListDialogProps<V extends Values> extends BaseDialogProps<V> {}

export interface InitialValuesChecklist extends Active {
  checkListId: string;
  checkListName: string;
  disables: boolean;
}