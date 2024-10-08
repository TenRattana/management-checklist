import * as React from "react";
import { ViewProps, ViewStyle,NativeSyntheticEvent, TextInputFocusEventData } from "react-native";

export interface AccessibleViewProps {
  children: React.ReactNode;
  name?: string;
  style?: ViewStyle | ViewStyle[];
}

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

interface Option {
  label: string;
  value: string;
}
export type handleChange = <V extends string | string[]>(selectedValues: V) => void;

export interface Event {
  handleChange: handleChange;
  handleBlur?: () => void;
}
export interface DefaultProps {
  value: string[];
  label?: string;
  hint?: string;
  error?: boolean;
  errorMessage?: string;
}

export interface CheckboxsProps extends Event, DefaultProps {
  option: Option[];
  testId?:string;
}

interface DialogsProps  {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    actions?: string;
    title?: string;
    messages?: string;
    handleDialog: (actions?: string, data?: string) => void;
    handleBlur?: () => void;
    data?: string;
}

export interface GenerateQRProps { }

export interface AdminProps {}

export interface ScanQRProps {
    navigation: {
        navigate: (screen: string, params?: object) => void;
    };
}

export interface CreateFormProps {
    route: any;
    navigation: any;
}

export interface DragfieldProps {
    data: BaseFormState[];
    SFormID: string;
    dispatch: any;
    errorMessage: any;
    checkList: Checklist[];
    dataType: DataType[];
    checkListType: CheckListType[];
    groupCheckListOption: GroupCheckListOption[];
}

export interface DragsubformProps {
    errorMessage: any;
    state: any;
    dispatch: any;
    checkList: Checklist[];
    dataType: DataType[];
    checkListType: CheckListType[];
    groupCheckListOption: GroupCheckListOption[];
    navigation: any;
}

export interface FormScreenProps {
    navigation: any;
    route: any;
}

export interface PreviewProps {
    route: any;
}

export interface ExpectedResultProps {
    navigation: any;
}

export interface InputProps {
  placeholder?: string;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  value: string;
  handleChange: (text: string) => void;
  handleBlur?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  hint?: string;
  mode?: "outlined" | "flat";
  lefticon?: string;
  name?: string;
  testId?: string;
}

export interface RadiosProps {
  option?: Option[];
  label?: string;
  value: string;
  handleChange: (selectedValues: string) => void;
  hint?: string;
  handleBlur?: () => void;
  error?: boolean;
  errorMessage?: string;
  testId?:string;
}

export interface SelectsProps {
  option: Option[];
  label?: string;
  value: string; 
  handleChange: (selectedValues: string) => void; 
  hint?: string;
  handleBlur?: () => void;
  error?: boolean;
  errorMessage?: string;
  testId?:string;
}

export interface TextareasProps {
    hint?: string;
    placeholder?: string;
    label?: string;
    error?: boolean;
    errorMessage?: string;
    value: string;
    handleChange: (value: string) => void;
    handleBlur?: () => void;
    mode?: "outlined" | "flat";
    testId?: string;
}

export interface DynamicFormProps {
  field: BaseFormState;
  values: any;
  setFieldValue: any;
  groupCheckListOption: GroupCheckListOption[];
}

export interface FieldDialogProps {
    isVisible: boolean;
    formState: BaseFormState;
    onDeleteField: (SFormID: string, MCListID: string) => void;
    setShowDialogs: () => void;
    editMode: boolean;
    saveField: (values: BaseFormState, mode: string) => void;
    checkListType: CheckListType[]
    dataType: DataType[];
    checkList: Checklist[];
    groupCheckListOption: GroupCheckListOption[];
    dropcheckList: Checklist[];
    dropcheckListType: CheckListType[];
    dropdataType: DataType[];
    dropgroupCheckListOption: GroupCheckListOption[];
}
