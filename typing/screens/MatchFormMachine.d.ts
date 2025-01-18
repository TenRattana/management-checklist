import { BaseDialogProps, Values } from "../value";

export interface MatchForm {
  MachineID: string;
  FormID: string;
  MachineName: string;
  FormName: string;
  IsActive: boolean;
}

export interface MatchFormMachineDialogProps<V extends Values> extends BaseDialogProps<V> {}

export interface InitialValuesMatchFormMachine {
  machineId: string;
  formId: string;
  formName?: string;
  machineName?: string;
}