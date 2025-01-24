import { FormikErrors, FormikTouched } from "formik";
import { BaseFormState, BaseSubForm } from "../form";
import { DataType } from "../type";
import { FormValues } from "./CreateForm";

export interface ScanQRProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

export interface FiledScan {
  item: BaseSubForm;
  field: BaseFormState[];
  dataType: DataType[];
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<FormValues>>;
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => Promise<void | FormikErrors<FormValues>>
  touched: FormikTouched<FormValues>;
  values: FormValues;
  errors: FormikErrors<FormValues>;
}
