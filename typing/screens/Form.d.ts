
export interface Form {
  FormID: string;
  FormName: string;
  IsActive: boolean;
  FormState?: string;
  Description: string;
  Disables: boolean;
  Deletes:boolean;
}

export interface FormScreenProps {
  // navigation: NavigationProp<any>;
  route: any;
}

