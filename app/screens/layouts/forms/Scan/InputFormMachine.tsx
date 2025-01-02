import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import axiosInstance from "@/config/axios";
import { Card, Divider } from "react-native-paper";
import { FlatList, TouchableOpacity, ViewStyle, View } from "react-native";
import { useTheme } from "@/app/contexts/useTheme";
import { useToast } from "@/app/contexts/useToast";
import { useRes } from "@/app/contexts/useRes";
import { BaseSubForm, BaseFormState } from '@/typing/form';
import { AccessibleView, Dynamic, NotFoundScreen, Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { PreviewProps } from "@/typing/tag";
import { ScanParams } from "@/typing/tag";
import { Field, FieldProps, Formik, FormikProps } from 'formik';
import useForm from "@/hooks/custom/useForm";
import { DataType } from "@/typing/type";
import { useSelector } from "react-redux";
import * as Yup from 'yup';
import { Stack } from "expo-router";
import { navigate } from "@/app/navigations/navigationUtils";
import Submit from "@/components/common/Submit";


interface FormValues {
  [key: string]: any;
}

const isValidDateFormatCustom = (value: string) => {
  const dateRegex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;
  return dateRegex.test(value);
};

const InputFormMachine: React.FC<PreviewProps<ScanParams>> = React.memo((props) => {
  const { route } = props;
  const { dataType, found, isLoadingForm } = useForm(route);

  const state = useSelector((state: any) => state.form);
  const user = useSelector((state: any) => state.user)

  const prefix = useSelector((state: any) => state.prefix);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({});

  const validationSchema = useMemo(() => {
    const shape: Record<string, any> = {};
    state.subForms.forEach((subForm: BaseSubForm) => {
      subForm.Fields.forEach((field: BaseFormState) => {
        const dataTypeName = dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName;
        let validator;

        if (dataTypeName === "Number") {
          validator = Yup.number()
            .nullable()
            .typeError(`The ${field.CListName} field must be a valid number`);
        } else if (dataTypeName === "Date") {
          validator = Yup.string()
            .nullable()
            .test('is-valid-date', 'Invalid date format', value => {
              return value ? isValidDateFormatCustom(String(value)) : true;
            })
        } else if (field.CTypeName === "Checkbox") {
          validator = Yup.array()
            .of(Yup.string().required("Each selected option is required."))
        } else {
          validator = Yup.string()
            .nullable()
            .typeError(`The ${field.CListName} field must be a valid string`);
        }
        if (field.Required) validator = validator.required(`The ${field.CListName} field is required`);

        if (field.Required && field.CTypeName === "Checkbox") {
          validator = validator.min(1, "You must select at least one option.").required("Important value is required when marked as important.");
        }

        shape[field.MCListID] = validator;

      });
    });
    return Yup.object().shape(shape);
  }, [state.subForms, dataType]);

  const masterdataStyles = useMasterdataStyles();
  const { showSuccess, handleError } = useToast();
  const { theme } = useTheme()
  const { responsive } = useRes();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onFormSubmit = useCallback(async (values: { [key: string]: any }) => {
    const updatedSubForms = state.subForms.map((subForm: BaseSubForm) => ({
      ...subForm,
      MachineID: state.MachineID,
      Fields: subForm?.Fields?.map((field: BaseFormState) => ({
        ...field,
        EResult: values[field.MCListID] || "",
      })),
    }));

    const userData = {
      UserID: user.UserID,
      UserName: user.Full_Name,
      GUserID: user.GUserID,
    }

    const data = {
      Prefix: prefix.ExpectedResult,
      FormData: JSON.stringify(updatedSubForms),
      UserInfo: JSON.stringify(userData)
    };

    try {
      const response = await axiosInstance.post("ExpectedResult_service.asmx/SaveExpectedResult", data);
      showSuccess(String(response.data.message));
      setIsSubmitted(true);
    } catch (error) {
      handleError(error);
    }
  }, [showSuccess, handleError, state.subForms, state.MachineID, user]);

  const countRef = useRef(1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (values: { [key: string]: any }) => {
    setIsSubmitting(true);
    onFormSubmit(values)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  }, [])

  const incrementCount = (value: boolean) => {
    if (value)
      countRef.current += 1
    else
      countRef.current = 1
  };

  const [dirty, setDirty] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const formikRef = useRef<FormikProps<FormValues> | null>();

  if (isLoadingForm || !found) {
    return <Text>Loading Form...</Text>;
  }

  const triggerSubmit = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };

  return found ? (
    <AccessibleView name="container-form-scan" style={[masterdataStyles.container, { paddingTop: 10, paddingLeft: 10 }]}>
      <Stack.Screen
        options={{
          headerTitle: `${state.MachineName || "Machine Name"}`,
        }}
      />

      {!isSubmitted ? (
        <FlatList
          data={state.subForms}
          renderItem={({ item, index }) => (
            <Formik
              key={item.SFormID}
              initialValues={formValues}
              validationSchema={validationSchema}
              validateOnBlur={true}
              validateOnChange={false}
              onSubmit={handleSubmit}
              innerRef={(f) => (formikRef.current = f)}
              enableReinitialize={true}
            >
              {({ errors, touched, setFieldValue, setTouched, dirty, isValid }) => {
                incrementCount(false);

                useEffect(() => {
                  setDirty(dirty);
                  setIsValid(isValid);
                }, [dirty, isValid]);

                return (
                  <Card style={masterdataStyles.card} key={item.SFormID}>
                    <Card.Title
                      title={item.SFormName}
                      titleStyle={masterdataStyles.cardTitle}
                    />
                    <Card.Content style={[masterdataStyles.subFormContainer]}>
                      {item.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                        const columns = item.Columns ?? 1;

                        const containerStyle: ViewStyle = {
                          width: responsive === "small" ? "100%" : `${98 / columns}%`,
                          flexShrink: 1,
                          flexGrow: field.Rowcolumn || 1,
                          flexBasis: responsive === "small" ? "100%" : `${100 / (columns / (field.Rowcolumn || 1))}%`,
                          padding: 5,
                        };

                        return (
                          <Field name={field.MCListID} key={`field-${fieldIndex}-${item.Columns}`}>
                            {({ field: fastFieldProps }: FieldProps) => {
                              const type = dataType.find((v: DataType) => v.DTypeID === field.DTypeID)?.DTypeName;

                              const ChheckList = item.Number ? `${countRef.current}. ${field.CListName}` : field.CListName;
                              incrementCount(item.Number);

                              const handleBlur = () => {
                                if (type === "Number") {
                                  const numericValue = Number(fastFieldProps.value);

                                  if (!isNaN(numericValue) && Number(field.DTypeValue) > 0 && numericValue) {
                                    const formattedValue = numericValue.toFixed(Number(field.DTypeValue));
                                    setFieldValue(fastFieldProps.name, formattedValue);
                                    setTouched({
                                      ...touched,
                                      [fastFieldProps.name]: true,
                                    });

                                  } else if (isNaN(numericValue)) {
                                    setFieldValue(fastFieldProps.name, fastFieldProps.value);
                                    setTouched({
                                      ...touched,
                                      [fastFieldProps.name]: true,
                                    });
                                  }
                                }
                              };

                              const handleChange = (fieldName: string, value: any) => {
                                setFieldValue(fieldName, value);

                                if (timeoutRef.current) {
                                  clearTimeout(timeoutRef.current);
                                }

                                timeoutRef.current = setTimeout(() => setTouched({ ...touched, [fieldName]: true }), 0);
                              };

                              return (
                                <View id="container-layout2" style={containerStyle} key={`dynamic-${fieldIndex}-${item.Columns}`}>
                                  <Dynamic
                                    field={field}
                                    values={String(fastFieldProps.value ?? "")}
                                    handleChange={handleChange}
                                    handleBlur={handleBlur}
                                    error={Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name])}
                                    errorMessages={errors}
                                    number={ChheckList}
                                    type={type}
                                  />
                                </View>
                              );
                            }}
                          </Field>
                        );
                      })}
                    </Card.Content>
                  </Card>
                );
              }}
            </Formik>
          )}
          keyExtractor={(item) => `form-${item.SFormID}`}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListFooterComponent={() => (
            <AccessibleView name="form-action-scan" style={[masterdataStyles.containerAction]}>
              <TouchableOpacity
                onPress={() => triggerSubmit()}
                style={[masterdataStyles.button, masterdataStyles.backMain, { opacity: isValid && dirty ? 1 : 0.5 }]}
                disabled={!dirty || !isValid}
              >
                <Text style={[masterdataStyles.textBold, masterdataStyles.textFFF]}>Submit Form</Text>
              </TouchableOpacity>
            </AccessibleView>
          )}
          showsVerticalScrollIndicator={false}
        />

      ) : isSubmitting ? <Submit />
        : (
          <AccessibleView name="form-success" style={masterdataStyles.containerScccess}>
            <Text style={masterdataStyles.text}>Save success</Text>
            <TouchableOpacity
              onPress={() => {
                setIsSubmitted(false);
                navigate("ScanQR");
              }}
              style={masterdataStyles.button}
            >
              <Text style={[masterdataStyles.textBold, masterdataStyles.text, { color: theme.colors.blue }]}>Scan again</Text>
            </TouchableOpacity>
          </AccessibleView>
        )}
    </AccessibleView>
  ) : <NotFoundScreen />
});

export default InputFormMachine;
