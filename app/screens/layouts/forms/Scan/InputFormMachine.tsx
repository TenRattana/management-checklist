import React, { useState, useCallback } from "react";
import axiosInstance from "@/config/axios";
import { Card, Divider } from "react-native-paper";
import { FlatList, Pressable, ViewStyle, View } from "react-native";
import { useToast, useRes, useTheme } from "@/app/contexts";
import { BaseSubForm, BaseFormState } from '@/typing/form';
import { AccessibleView, Dynamic, NotFoundScreen, Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { PreviewProps } from "@/typing/tag";
import { ScanParams } from "@/typing/tag";
import { FastField, Field, FieldProps, Formik } from 'formik';
import { Stack, useNavigation } from "expo-router";
import useForm from "@/hooks/custom/useForm";
import { DataType } from "@/typing/type";
import { useSelector } from "react-redux";

const InputFormMachine: React.FC<PreviewProps<ScanParams>> = ({ route }) => {
  const { state, groupCheckListOption, dataType, found, validationSchema } = useForm(route);
  const navigation = useNavigation();
  const prefix = useSelector((state: any) => state.prefix);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const masterdataStyles = useMasterdataStyles();
  const { showSuccess, handleError } = useToast();
  const { responsive } = useRes();
  const { theme } = useTheme()

  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

  const onFormSubmit = useCallback(async (values: { [key: string]: any }) => {
    const updatedSubForms = state.subForms.map((subForm: BaseSubForm) => ({
      ...subForm,
      MachineID: state.MachineID,
      Fields: subForm?.Fields?.map((field: BaseFormState) => ({
        ...field,
        EResult: Array.isArray(values[field.MCListID])
          ? values[field.MCListID].join(',')
          : values[field.MCListID] || "",
      })),
    }));

    const data = {
      Prefix: prefix.ExpectedResult,
      FormData: JSON.stringify(updatedSubForms)
    };

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
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text style={[{ fontSize: 18, fontWeight: "500" }]}>{state.MachineName || "Default Machine Name"}</Text>
          ),
          headerRight: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingRight: 20 }}>
              <Text style={[{ fontSize: 18, fontWeight: "500" }]}>
                {state.FormName || "Form Name"}
              </Text>
            </View>
          )
        }}
      />
      {!isSubmitted ? (
        <>
          <Text style={[masterdataStyles.title, { color: theme.colors.onBackground }]}>{state.FormName || "Form Name"}</Text>
          <Divider />
          <Text style={[masterdataStyles.description, { paddingVertical: 10, color: theme.colors.onBackground }]}>{state.Description || "Form Description"}</Text>
        </>
      ) : false}

      <Formik
        initialValues={formValues}
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={true}
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
                              <Field name={field.MCListID} key={`field-${fieldIndex}-${subForm.Columns}-${field.MCListID}`}>
                                {({ field: fastFieldProps }: FieldProps) => {
                                  const type = dataType.find((v: DataType) => v.DTypeID === field.DTypeID)?.DTypeName;

                                  const warnings: { [key: string]: string | undefined } = {};

                                  if (field.MinLength !== undefined && field.MinLength !== null && !errors[fastFieldProps.name] && touched[fastFieldProps.name] && fastFieldProps.value < field.MinLength) {
                                    warnings[fastFieldProps.name] = `The ${field.CListName} minimum recommended value is ${field.MinLength}`;
                                  } else if (field.MaxLength !== undefined && field.MaxLength !== null && !errors[fastFieldProps.name] && touched[fastFieldProps.name] && fastFieldProps.value > field.MaxLength) {
                                    warnings[fastFieldProps.name] = `The ${field.CListName} maximum recommended value is ${field.MaxLength}`;
                                  } else if (field.MinLength !== undefined && field.MinLength < 0 && !errors[fastFieldProps.name] && touched[fastFieldProps.name] && fastFieldProps.value < field.MinLength) {
                                    warnings[fastFieldProps.name] = `The ${field.CListName} maximum recommended value is ${field.MaxLength}`;
                                  } else {
                                    warnings[fastFieldProps.name] = undefined;
                                  }

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
                                        values={
                                          field.CTypeName === "Checkbox"
                                          ? (Array.isArray(fastFieldProps.value) 
                                              ? fastFieldProps.value.filter((value: string) => value.trim() !== '') 
                                              : undefined)
                                          : String(fastFieldProps.value ?? '')
                                        }
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
                                        groupCheckListOption={groupCheckListOption ?? []}
                                        error={Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name])}
                                        errorMessages={errors}
                                        warning={warnings}
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