import { Active, BaseDialogProps, Detail, Values } from "../value";

export interface Machine {
  GMachineID: string;
  MachineID: string;
  GMachineName?: string;
  FormID: string | null;
  MachineCode: string;
  MachineName: string;
  Description: string;
  Building: string | null;
  Floor: string | null;
  Area: string | null;
  IsActive: boolean;
  Disables: boolean;
  Deletes:boolean;
}

export interface MachineDialogProps<V extends Values> extends BaseDialogProps<V> {}

export interface InitialValuesMachine extends Detail, Active {
  machineGroupId?: string;
  machineGroupName?: string;
  machineId: string;
  machineCode: string;
  formId: string | null;
  building: string | null;
  floor: string | null;
  area: string | null;
  machineName: string;
  disables: boolean;
  delete:boolean;
}