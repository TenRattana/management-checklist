import * as React from "react";
import {
  ViewProps,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { Form } from "./form";
import { DataType, Checklist, CheckListType, GroupCheckListOption } from "./type";

// Route Parameters
export type CreateFormParams = { formId: string };
export type FormParams = { messages: string };
export type PreviewParams = { formId: string; action?: string };
export type ScanParams = { machineId: string };

// Route Type
export type Route<T = any> = { name: string; params?: T };

// Event Types
export type HandleChange = <V extends string | string[] | ChangeEvent<any>>(selectedValues: V) => void;

export interface Event {
  handleChange: HandleChange;
  handleBlur?: (fieldName: any) => void;
}

// Default Properties
export interface DefaultProps {
  value: string | string[];
  label?: string;
  hint?: string;
  error?: boolean;
  errorMessage?: string;
  testId?: string;
}

// Dialogs Properties
export interface DialogsProps {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
  actions?: string;
  title?: string;
  messages?: string;
  handleDialog: (actions?: string, data?: string) => void;
  handleBlur?: () => void;
  data?: string;
}

// Component Props
export interface InputProps extends Event, DefaultProps {
  placeholder?: string;
  mode?: "outlined" | "flat";
  lefticon?: string;
  name?: string;
}

export interface RadiosProps extends Event, DefaultProps {
  option?: { label: string; value: string }[];
}

export interface SelectsProps extends Event, DefaultProps {
  option: { label: string; value: string }[];
}

export interface CheckboxsProps extends Event, DefaultProps {
  option: { label: string; value: string }[];
}

export interface TextareasProps extends Event, DefaultProps {
  placeholder?: string;
  mode?: "outlined" | "flat";
}

// Form Props
export interface DynamicFormProps {
  field: BaseFormState;
  values: any;
  setFieldValue: any;
  groupCheckListOption: GroupCheckListOption[];
}

// Navigation Props
export interface PreviewProps<T extends PreviewParams | ScanParams> {
  route: Route<T>;
}

export interface FormScreenProps {
  navigation: NavigationProp<any>;
  route: Route<FormParams>;
}

export interface CreateFormProps {
  navigation: NavigationProp<any>;
  route: Route<CreateFormParams>;
}

// Miscellaneous Props
export interface CustomDropdownSingleProps {
  labels: string;
  values: string;
  title: string;
  data: Array<{ [key: string]: any }>;
  selectedValue?: string;
  onValueChange: (value?: string, icon?: () => JSX.Element) => void;
  lefticon?: string;
  iconRight?: React.ReactNode;
  testId?: string;
}

export interface CustomDropdownMultiProps {
  labels: string;
  values: string;
  title: string;
  data: { [key: string]: any }[];
  selectedValue?: string[];
  onValueChange: (value: string[], icon?: () => JSX.Element) => void;
  lefticon?: string;
  iconRight?: React.ReactNode;
  testId?: string;
}

export interface CustomTableProps {
  Tabledata: (string | number | boolean)[][];
  Tablehead: { label?: string; align?: string }[];
  flexArr: number[];
  handleAction: (action?: string, data?: string) => void;
  actionIndex: { [key: string]: number }[];
  searchQuery: string;
}

export interface DragfieldProps {
  data: BaseFormState[];
  SFormID: string;
  dispatch: any;
  checkList: Checklist[];
  dataType: DataType[];
  checkListType: CheckListType[];
  groupCheckListOption: GroupCheckListOption[];
}

export interface DragsubformProps {
  state: Form;
  dispatch: (action: AppActions) => void;
  checkList: Checklist[];
  dataType: DataType[];
  checkListType: CheckListType[];
  groupCheckListOption: GroupCheckListOption[];
  navigation: NavigationProp<any>;
}

// Admin and QR Props
export interface GenerateQRProps {}
export interface AdminProps {}
export interface ExpectedResultProps {
  navigation: any;
}
export interface ScanQRProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

// Field Dialog Props
export interface FieldDialogProps {
  isVisible: boolean;
  formState: BaseFormState;
  onDeleteField: (SFormID: string, MCListID: string) => void;
  setShowDialogs: () => void;
  editMode: boolean;
  saveField: (values: BaseFormState, mode: string) => void;
  checkListType: CheckListType[];
  dataType: DataType[];
  checkList: Checklist[];
  groupCheckListOption: GroupCheckListOption[];
  dropcheckList: Checklist[];
  dropcheckListType: CheckListType[];
  dropdataType: DataType[];
  dropgroupCheckListOption: GroupCheckListOption[];
}
