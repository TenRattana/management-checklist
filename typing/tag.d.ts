import * as React from "react";
import { ViewProps, ViewStyle } from "react-native";

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
