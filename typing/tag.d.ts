import * as React from "react";
import {
  ViewProps,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { Form, BaseFormState } from "./form";
import {
  DataType,
  Checklist,
  CheckListType,
  GroupCheckListOption,
  TypeConfig,
  CheckListOption,
} from "./type";
import * as Yup from "yup";
import { FormikErrors } from "formik";

export type CreateFormParams = { formId: string };
export type PreviewParams = { formId: string; action?: string };
export type ScanParams = { machineId: string };

export type Route<T = any> = { name: string; params?: T };

export type HandleChange = <V extends string | string[] | ChangeEvent<any>>(
  selectedValues: V
) => void;

export interface Event {
  handleChange: HandleChange;
  handleBlur?: (fieldName?: any) => void;
}

export interface DefaultProps {
  value: string | string[];
  label?: string;
  hint?: string;
  error?: boolean;
  errorMessage?: string;
  testId?: string;
  exp?: boolean;
}

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

export interface InputProps extends Event, DefaultProps {
  placeholder?: string;
  mode?: "outlined" | "flat";
  lefticon?: string;
  name?: string;
  textColor?: string;
  secureTextEntry?: boolean;
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
  textColor?: string;
}
export interface CustomDropdownSingleProps extends Event, DefaultProps {
  labels: string;
  values: string;
  title: string;
  data: Array<{ [key: string]: any }>;
  lefticon?: string;
  iconRight?: React.ReactNode;
  handleBlur: () => void;
}

export interface DynamicFormProps {
  field: BaseFormState;
  values: any;
  handleChange: (fieldName: string, value: any) => void;
  handleBlur?: () => void;
  // groupCheckListOption: GroupCheckListOption[];
  error?: boolean;
  errorMessages?: FormikErrors<{ [key: string]: any }>;
  type?: string;
  exp?: boolean;
  showField?: (value: string, value: string) => void;
  number?: string;
}

export interface PreviewProps<T extends PreviewParams | ScanParams> {
  route: Route<T>;
  // onLayout: (SFormID:string,layout: LayoutRectangle) => void;
  // SFRefs:{ [key: string]: any };
}

export interface FormScreenProps {
  // navigation: NavigationProp<any>;
  route: any;
}

export interface CreateFormProps {
  navigation: NavigationProp<any>;
  route: Route<CreateFormParams>;
}

// Miscellaneous Props

export interface CustomDropdownMultiProps extends Event, DefaultProps {
  labels: string;
  values: string;
  title: string;
  data: Array<{ [key: string]: any }>;
  lefticon?: string;
  iconRight?: React.ReactNode;
  handleBlur: () => void;
  position?: "auto" | "bottom" | "top";
}

export interface CustomTableProps {
  Tabledata: (string | number | boolean)[][];
  Tablehead: { label?: string; align?: string }[];
  flexArr: number[];
  handleAction?: (action?: string, data?: string) => void;
  actionIndex: { [key: string]: number }[];
  searchQuery: string;
  showMessage: number | Array;
  selectedRows?: string[];
  setRow?: (value: string[]) => void;
  showFilter?: boolean;
  showData?: TypeConfig[];
  showColumn?: string;
  filterColumn?:number;
  detail?: boolean;
  detailKey?: string;
  showDetailwithKey?: string[];
  detailKeyrow?: number;
  detailData?: TypeConfig[];
  ShowTitle?: string;
  handlePaginationChange?:() => void;
  isFetchingNextPage?:boolean;
  hasNextPage?:boolean;
  fetchNextPage?:() => void;
  showFilterDate?:boolean;
  setFilterDate?:number;
  handlefilter?:(value?:string) => void;
  searchfilter?:string;
  isFetching?:boolean;
}

export interface DragfieldProps {
  data: BaseFormState[];
  SFormID: string;
  dispatch: any;
  checkListType: checkListTypes[];
  index?: string;
}

export interface DragsubformProps {
  state: Form;
  dispatch: (action: AppActions) => void;
  checkListType: checkListTypes[];
  index?: string;
}
// validationSchema: Yup.ObjectSchema<{[x: string]: any;},Yup.AnyObject,{[x: string]: any;},"" >;

// Admin and QR Props
export interface AdminProps {}
export interface ExpectedResultProps {
  navigation: any;
}
export interface ScanQRProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

export interface HomeScreenProps {
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
}

export interface ActionProps {
  data: string;
  action: string;
  row: (string | number | boolean)[];
  rowIndex: number;
  Canedit: string | number | boolean | undefined;
}

export interface CellProps {
  cell: string | number | boolean;
  cellIndex: number;
  row: (string | number | boolean)[];
  rowIndex: number;
  Canedit: string | number | boolean | undefined;
}

export interface HandelPrssProps {
  action: string;
  data: string;
  message: (string | number | boolean)[];
  visible?: boolean;
  Change?: string;
}
export interface CustomtableSmallProps {
  displayData: (string | number | boolean)[][];
  Tablehead: { label?: string; align?: string }[];
  actionIndex: { [key: string]: number }[];
  showMessage: number | any;
  handleDialog: (action?: string, data?: string) => void;
  selectedRows?: string[];
  showFilter?: boolean;
  filter?: string | null;
  handelSetFilter: (value: string) => void;
  showData?: TypeConfig[];
  showColumn?: string;
  handleDialog: (action?: string, data?: string) => void;
  toggleSelect: (value: string) => void;
  detail?: boolean;
  detailKey?: string;
  detailKeyrow?: number;
  showDetailwithKey?: string[];
  detailData?: TypeConfig[];
}

export interface CustomtableDataProps {
  actionIndex: { [key: string]: number | string }[];
  flexArr: number[];
  Tablehead: { label?: string; align?: string }[];
  displayData: (string | number | boolean)[][];
  handleDialog: (action?: string, data?: string) => void;
  showMessage: number;
  selectedRows?: string[];
  toggleSelect: (value: string) => void;
  detail?: boolean;
  detailKey?: string;
  detailKeyrow?: number;
  showDetailwithKey?: string[];
  detailData?: TypeConfig[];
  handlePaginationChange?:() => void;
  isFetching?:boolean;
}
