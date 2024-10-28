import React, { useState, useCallback, useEffect, useMemo } from "react";
import axiosInstance from "@/config/axios";
import { Card, Divider, HelperText } from "react-native-paper";
import { FlatList, Pressable, ViewStyle, Dimensions, View } from "react-native";
import { useToast, useRes, useTheme } from "@/app/contexts";
import { BaseSubForm, FormData, BaseFormState, SubForm } from '@/typing/form';
import { AccessibleView, Dynamic, NotFoundScreen, Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { PreviewProps } from "@/typing/tag";
import { ScanParams } from "@/typing/tag";
import { FastField, Field, FieldProps, Formik } from 'formik';
import * as Yup from 'yup';
import { Stack, useNavigation } from "expo-router";
import useForm from "@/hooks/custom/useForm";

const InputFormMachine: React.FC<PreviewProps<ScanParams>> = ({ route }) => {
  const { state, dispatch, checkList, groupCheckListOption, checkListType, dataType, found } = useForm(route);
  const navigation = useNavigation();

  const [isSubmitted, setIsSubmitted] = useState(false);

  const masterdataStyles = useMasterdataStyles();
  const { showSuccess, handleError } = useToast();
  const { responsive } = useRes();
  const { theme } = useTheme()

  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

  const validationSchema = useMemo(() => {
    const shape: any = {};

    state.subForms.forEach((subForm: BaseSubForm) => {
      subForm.Fields.forEach((field: BaseFormState) => {
        const dataTypeName = dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName;
        const checkListTypeName = checkListType.find(item => item.CTypeID === field.CTypeID)?.CTypeName;

        let validator;

        if (dataTypeName === "Number") {
          validator = Yup.number()
            .nullable()
            .typeError(`The ${field.CListName} field must be a valid number`);

          if (field.MinLength !== undefined && field.MinLength !== null) {
            validator = validator.min(field.MinLength, `The ${field.CListName} minimum value is ${field.MinLength}`);
          }

          if (field.MaxLength !== undefined && field.MaxLength !== null) {
            validator = validator.max(field.MaxLength, `The ${field.CListName} maximum value is ${field.MaxLength}`);
          }

          if (field.MinLength !== undefined && field.MinLength < 0) {
            validator = validator.min(0, `The ${field.CListName} cannot be negative`);
          }
        } else if (dataTypeName === "String") {
          if (checkListTypeName === "Checkbox") {
            validator = Yup.array()
              .of(Yup.string())
              .min(1, `The ${field.CListName} field requires at least one option to be selected`);
          } else {
            validator = Yup.string()
              .nullable()
              .typeError(`The ${field.CListName} field must be a valid string`);
          }
        }

        if (field.Required) {
          validator = validator?.required(`The ${field.CListName} field is required`);
        }

        shape[field.MCListID] = validator;
      });
    });

    return Yup.object().shape(shape);
  }, [state.subForms, dataType, checkListType]);

  const onFormSubmit = useCallback(async (values: { [key: string]: any }) => {
    const updatedSubForms = state.subForms.map((subForm: BaseSubForm) => ({
      ...subForm,
      MachineID: state.MachineID,
      Fields: subForm?.Fields?.map((field: BaseFormState) => ({
        ...field,
        EResult: values[field.MCListID] || "",
      })),
    }));

    const data = { FormData: JSON.stringify(updatedSubForms) };

    try {
      const response = await axiosInstance.post("ExpectedResult_service.asmx/SaveExpectedResult", data);
      showSuccess(String(response.data.message));
      setIsSubmitted(true);
    } catch (error) {
      handleError(error);
    }
  }, [showSuccess, handleError, state.subForms, state.MachineID]);

  return found ? (
    <AccessibleView name="container-form-scan" style={[masterdataStyles.container, { paddingTop: 10, paddingLeft: 10 }]}>
      <Stack.Screen options={{ headerTitle: 'Oops!' }} />

      <Formik
        initialValues={formValues}
        validationSchema={validationSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={(values) => onFormSubmit(values)}
        enableReinitialize={true}
      >
        {({ handleSubmit, errors, touched, setFieldValue, setTouched, values, dirty, isValid }) => (
          <>
            {!isSubmitted ? (
              <FlatList
                data={[{}]}
                renderItem={() => (
                  <>
                    <Text style={[masterdataStyles.title, { color: theme.colors.onBackground }]}>{state.FormName || "Form Name"}</Text>
                    <Divider />
                    <Text style={[masterdataStyles.description, { paddingVertical: 10, color: theme.colors.onBackground }]}>{state.Description || "Form Description"}</Text>

                    {state.subForms.map((subForm: BaseSubForm, index: number) => (
                      <Card style={masterdataStyles.card} key={subForm.SFormID}>
                        <Card.Title title={subForm.SFormName} titleStyle={masterdataStyles.cardTitle} />
                        <Card.Content style={[masterdataStyles.subFormContainer]}>
                          {subForm.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                            const columns = subForm.Columns ?? 1;
                            const containerStyle: ViewStyle = {
                              width: responsive === "small" ? "100%" : `${98 / columns}%`,
                              flexGrow: field.DisplayOrder || 1,
                              padding: 5,
                            };

                            return (
                              <Field name={field.MCListID} key={`field-${fieldIndex}-${subForm.Columns}`}>
                                {({ field: fastFieldProps }: FieldProps) => {
                                  const type = dataType.find(v => v.DTypeID === field.DTypeID)?.DTypeName;

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

                                  return (
                                    <View id="container-layout2" style={containerStyle}>
                                      <Dynamic
                                        field={field}
                                        values={String(fastFieldProps.value ?? "")}
                                        handleChange={(fieldname: string, value: any) => {
                                          setFieldValue(fastFieldProps.name, value);
                                          setTimeout(() => {
                                            setTouched({
                                              ...touched,
                                              [fastFieldProps.name]: true,
                                            });
                                          }, 0);
                                        }}
                                        handleBlur={handleBlur}
                                        groupCheckListOption={groupCheckListOption}
                                        error={Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name])}
                                        errorMessages={errors}
                                      />
                                    </View>
                                  );
                                }}
                              </Field>
                            );
                          })}
                        </Card.Content>
                      </Card>
                    ))}
                  </>
                )}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListFooterComponent={() => (
                  <AccessibleView name="form-action-scan" style={[masterdataStyles.containerAction]}>
                    <Pressable
                      onPress={() => handleSubmit()}
                      disabled={!isValid || !dirty}
                      style={[
                        masterdataStyles.button,
                        masterdataStyles.backMain,
                        { opacity: isValid && dirty ? 1 : 0.5 }
                      ]}
                    >
                      <Text style={[masterdataStyles.textBold, masterdataStyles.textFFF]}>Submit Form</Text>
                    </Pressable>
                  </AccessibleView>
                )}
              />
            ) : (
              <AccessibleView name="form-success" style={masterdataStyles.containerScccess}>
                <Text style={masterdataStyles.text}>บันทึกเสร็จสิ้น</Text>
                <Pressable onPress={() => {
                  setIsSubmitted(false);
                  navigation.goBack();
                }} style={masterdataStyles.button}>
                  <Text style={[masterdataStyles.textBold, masterdataStyles.text, { color: theme.colors.blue }]}>กลับไปยังหน้าก่อนหน้า</Text>
                </Pressable>
              </AccessibleView>
            )}
          </>
        )}
      </Formik>
    </AccessibleView>
  ) : (
    <NotFoundScreen />
  );
};

export default InputFormMachine;
