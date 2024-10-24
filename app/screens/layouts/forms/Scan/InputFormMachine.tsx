import React, { useState, useCallback, useEffect, useMemo } from "react";
import axiosInstance from "@/config/axios";
import { Card, Divider, HelperText } from "react-native-paper";
import { FlatList, Pressable, ViewStyle, Dimensions } from "react-native";
import { useToast, useRes } from "@/app/contexts";
import { BaseSubForm, FormData, BaseFormState, SubForm } from '@/typing/form';
import { AccessibleView, Dynamic, NotFoundScreen, Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { PreviewProps } from "@/typing/tag";
import { ScanParams } from "@/typing/tag";
import { useFocusEffect } from "expo-router";
import { FastField, Field, FieldProps, Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from "expo-router";
import useForm from "@/hooks/custom/useForm";

const { height: screenHeight } = Dimensions.get('window');

const InputFormMachine: React.FC<PreviewProps<ScanParams>> = ({ route }) => {
  const { state, dispatch, checkList, groupCheckListOption, checkListType, dataType, found } = useForm(route);
  const navigation = useNavigation();

  const [isSubmitted, setIsSubmitted] = useState(false);

  const masterdataStyles = useMasterdataStyles();
  const { showSuccess, handleError } = useToast();
  const { responsive } = useRes();

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
    <AccessibleView name="container-form-scan" style={[masterdataStyles.container, { maxHeight: screenHeight }]}>
      {!isSubmitted ? (
        <Formik
          initialValues={formValues}
          validationSchema={validationSchema}
          validateOnBlur={false} 
          validateOnChange={false} 
          onSubmit={(value) => onFormSubmit(value)}
        >
          {({ handleSubmit, errors, touched, setFieldValue, setFieldTouched, values }) => {
            const handleBlur = useCallback((fields: BaseFormState, field: any) => {
              const type = dataType.find(v => v.DTypeID === fields.DTypeID)?.DTypeName;

              if (type === "Number") {
                const numericValue = Number(field.value);
                if (!isNaN(numericValue) && Number(fields.DTypeValue) > 0 && numericValue) {
                  const formattedValue = numericValue.toFixed(Number(fields.DTypeValue));
                  setFieldValue(field.name, formattedValue);
                } else {
                  setFieldValue(field.name, field.value);
                }
              }

              if (field.name) {
                setFieldTouched(field.name, true, true); 
              }
            }, [setFieldValue, dataType]);

            return (
              <FlatList
                data={state.subForms}
                renderItem={({ item }) => (
                  <AccessibleView name="input-form-machine" key={`SFormID-${item.SFormID}`}>
                    <Card style={masterdataStyles.card}>
                      <Card.Title title={item.SFormName} titleStyle={masterdataStyles.cardTitle} />
                      <Card.Content style={masterdataStyles.subFormContainer}>
                        {item.Fields.map((fields: BaseFormState, fieldIndex: number) => {
                          const columns = item.Columns ?? 1;
                          const containerStyle: ViewStyle = {
                            width: responsive === "small" ? "100%" : `${98 / columns}%`,
                            flexGrow: fields.DisplayOrder || 1,
                            padding: 5,
                          };

                          return (
                            <FastField name={fields.MCListID} key={`SFormID-${item.SFormID}-fastfield-${fieldIndex}`}>
                              {({ field }: FieldProps) => (
                                <AccessibleView
                                  name="container-layout2"
                                  key={`fastfield-${fields.CListID}-field-${fieldIndex}-${item.SFormID}`}
                                  style={containerStyle}
                                >
                                  <Dynamic
                                    field={fields}
                                    values={values[field.name] ?? ""}
                                    handleChange={(fieldname: string, value: any) => {
                                      setFieldValue(fieldname, value);
                                    }}
                                    handleBlur={() => handleBlur(fields, field)} 
                                    groupCheckListOption={groupCheckListOption}
                                    error={touched[field.name] && Boolean(errors[field.name])}
                                    errorMessage={errors[field.name] as string}
                                  />
                                </AccessibleView>
                              )}
                            </FastField>
                          );
                        })}
                      </Card.Content>
                    </Card>
                  </AccessibleView>
                )}
                keyExtractor={(item) => item.SFormID.toString()}
                nestedScrollEnabled={true}
                ListHeaderComponent={() => (
                  <>
                    <Text style={[masterdataStyles.title]}>{state.FormName || "Form Name"}</Text>
                    <Divider />
                    <Text style={[masterdataStyles.description]}>{state.Description || "Form Description"}</Text>
                  </>
                )}
                ListFooterComponent={() => (
                  <AccessibleView name="form-action-scan" style={[masterdataStyles.containerAction]}>
                    <Pressable
                      onPress={() => handleSubmit()}
                      style={[masterdataStyles.button, masterdataStyles.backMain]}
                    >
                      <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>บันทึก</Text>
                    </Pressable>
                  </AccessibleView>
                )}
              />
            );
          }}
        </Formik>

      ) : (
        <AccessibleView name="form-success" style={masterdataStyles.containerScccess}>
          <Text>บันทึกเสร็จสิ้น</Text>
          <Pressable onPress={() => {
            setIsSubmitted(false);
            navigation.goBack();
          }} style={masterdataStyles.button}>
            <Text>กลับไปยังหน้าก่อนหน้า</Text>
          </Pressable>
        </AccessibleView>
      )}
    </AccessibleView>
  ) : (
    <NotFoundScreen />
  );
};

export default InputFormMachine;
