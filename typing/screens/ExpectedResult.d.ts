
export interface ExpectedResult {
  TableID: string;
  MachineID: string;
  MachineName: string;
  UserID: string;
  UserName ?: string;
  ApporvedID: string;
  ApporvedName?: string;
  FormID: string;
  FormName: string;
  CreateDate: string;
  ApporvedTime?:string;
}

export interface ExpectedResultProps {
  navigation: any;
}