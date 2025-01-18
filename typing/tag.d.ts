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
  CheckList,
} from "./type";
import * as Yup from "yup";
import { FormikErrors } from "formik";

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

export interface DropdownProps {
    search?: boolean;
    label: string;
    open: boolean;
    setOpen: (v: boolean) => void;
    selectedValue: any;
    items: { label: string; value: string, icon?: () => JSX.Element }[];
    setSelectedValue: (value: string | null) => void;
    isFetching?: boolean;
    fetchNextPage?: () => void;
    handleScroll?: ({ nativeEvent }: any) => void;
    setDebouncedSearchQuery?: (value: string) => void;
    error?: boolean;
    searchQuery?: string;
    errorMessage?: string;
    lefticon?: string;
    showLefticon?: boolean;
    mode?: string;
}

export interface DropdownMultiProps {
    search?: boolean;
    label: string;
    open: boolean;
    setOpen: (v: boolean) => void;
    selectedValue: any;
    items: { label: string; value: string, icon?: () => JSX.Element }[];
    setSelectedValue: (value: string | string[] | null) => void;
    isFetching?: boolean;
    fetchNextPage?: () => void;
    handleScroll?: ({ nativeEvent }: any) => void;
    setDebouncedSearchQuery?: (value: string) => void;
    error?: boolean;
    searchQuery?: string;
    errorMessage?: string;
    lefticon?: string;
    showLefticon?: boolean;
    mode?: string;
}

export interface PickerDropdownProps {
    open: boolean;
    setOpen: (v: boolean) => void;
    values: { label: string; value: any }[];
    value: any;
    handelSetFilter: (v: any) => void;
    handleScroll?: ({ nativeEvent }: any) => void;
    label: string;
    search?: boolean;
    style?: ViewStyle;
    border?: boolean
}

export interface SearchBarProps {
  value: string;
  onChange: (search: string) => void;
  placeholder: string;
  testId: string;
}

export interface TimeProps {
    value: any;
    handleChange: (v: string) => void;
    hint: string;
}

export interface ViewQRProps {
    value: string;
    open: boolean;
    setOpen: (v: boolean) => void;
    display: string;
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
  Candel: string | number | boolean | undefined;
}

export interface CellProps {
  cell: string | number | boolean;
  cellIndex: number;
  row: (string | number | boolean)[];
  rowIndex: number;
  Canedit: string | number | boolean | undefined;
  Candel: string | number | boolean | undefined;
}

export interface HandelPrssProps {
  action: string;
  data: string;
  message: (string | number | boolean)[];
  visible?: boolean;
  Change?: string;
}



