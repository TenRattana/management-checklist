import { Active, BaseDialogProps, Detail, Values } from "../value";

export interface GroupMachine {
  GMachineID: string;
  GMachineName: string;
  Description: string;
  IsActive: boolean;
  Disables: boolean;
  Deletes:boolean;
}

export interface GroupMachineDialogProps<V extends Values> extends BaseDialogProps<V> {}

export interface InitialValuesGroupMachine extends Detail, Active {
  machineGroupId: string;
  machineGroupName: string;
  disables: boolean;
}