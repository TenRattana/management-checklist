
export interface ExpectedResult {
  TableID: string;
  MachineID: string;
  MachineName: string;
  UserID: string;
  UserName ?: string;
  ApprovedID: string;
  ApprovedName?: string;
  FormID: string;
  FormNumber: string;
  FormName: string;
  CreateDate: string;
  ApprovedTime?:string;
}

export interface ExpectedResultProps {
  navigation: any;
}