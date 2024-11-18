import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import axiosInstance from "@/config/axios";
import { Card, Divider } from "react-native-paper";
import { FlatList, Pressable, ViewStyle, View, TouchableOpacity } from "react-native";
import { useToast, useRes, useTheme } from "@/app/contexts";
import { BaseSubForm, BaseFormState } from '@/typing/form';
import { AccessibleView, Dynamic, NotFoundScreen, Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { PreviewProps } from "@/typing/tag";
import { ScanParams } from "@/typing/tag";
import { FastField, Field, FieldProps, Formik, FormikProps } from 'formik';
import { Stack, useNavigation } from "expo-router";
import useForm from "@/hooks/custom/useForm";
import { DataType } from "@/typing/type";
import { useSelector } from "react-redux";
import * as Yup from 'yup';

interface FormValues {
  [key: string]: any;
}

const InputFormMachine: React.FC<PreviewProps<ScanParams>> = (props) => {
  const { route } = props;
  const { groupCheckListOption, dataType, found } = useForm(route);

  const state = useSelector((state: any) => state.form);

  const navigation = useNavigation();
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
  const { responsive } = useRes();
  const { theme } = useTheme()

  const formikRef = useRef<FormikProps<{ [key: string]: any }>>(null);

  const handleExternalSubmit = async () => {
    if (formikRef.current) {
      const formik = formikRef.current;

      console.log(formikRef.current);

      const touchedFields = Object.keys(formik.values).reduce<Record<string, boolean>>((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});

      formik.setTouched(touchedFields);

      await formik.validateForm();

      setTimeout(() => {
        formik.submitForm();
      }, 0);
    }
  };

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
        <FlatList
          data={state.subForms}
          renderItem={({ item, index }) => (
            <Formik
              initialValues={formValues}
              validationSchema={validationSchema}
              validateOnBlur={true}
              validateOnChange={false}
              innerRef={formikRef}
              validateOnS
              onSubmit={onFormSubmit}
              key={`Form-input-${item.SFormID}-${item.Columns}`}
            >
              {({ errors, touched, setFieldValue, setTouched }) => {
                console.log(formikRef);

                return (
                  <>
                    <Card
                      style={masterdataStyles.card}
                      key={item.SFormID}
                    >
                      <Card.Title
                        title={item.SFormName}
                        titleStyle={masterdataStyles.cardTitle}
                      />
                      <Card.Content style={[masterdataStyles.subFormContainer]}>
                        {item.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                          const columns = item.Columns ?? 1;

                          const containerStyle: ViewStyle = {
                            width: responsive === "small" ? "100%" : `${98 / columns}%`,
                            flexGrow: field.DisplayOrder || 1,
                            padding: 5,
                          };

                          return (
                            <Field name={field.MCListID} key={`field-${fieldIndex}-${item.Columns}`}>
                              {({ field: fastFieldProps }: FieldProps) => {

                                const type = dataType.find((v: DataType) => v.DTypeID === field.DTypeID)?.DTypeName;

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
                                      groupCheckListOption={groupCheckListOption ?? []}
                                      error={Boolean(touched[fastFieldProps.name] && errors[fastFieldProps.name])}
                                      errorMessages={errors}
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
                  </>
                )
              }}
            </Formik>
          )}
          ListHeaderComponent={() => (
            <>
              <Text style={[masterdataStyles.title, { color: theme.colors.onBackground }]}>{state.FormName || "Form Name"}</Text>
              <Divider />
              <Text style={[masterdataStyles.description, { paddingVertical: 10, color: theme.colors.onBackground }]}>{state.Description || "Form Description"}</Text>
            </>
          )}
          ListFooterComponent={() => (
            <AccessibleView name="form-action-scan" style={[masterdataStyles.containerAction]}>
              <TouchableOpacity
                onPress={handleExternalSubmit}
                style={[
                  masterdataStyles.button,
                  masterdataStyles.backMain,
                  {
                    opacity: formikRef.current?.isValid && formikRef.current?.dirty ? 1 : 0.5,
                  },
                ]}
                disabled={!formikRef.current?.isValid || !formikRef.current?.dirty}
              >
                <Text style={[masterdataStyles.textBold, masterdataStyles.textFFF]}>Submit Form</Text>
              </TouchableOpacity>

            </AccessibleView>
          )}
          keyExtractor={(_, index) => `index-preview-${index}`}
          contentContainerStyle={{ paddingBottom: 20 }}
          removeClippedSubviews={true}
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
    </AccessibleView>
  ) : (
    <NotFoundScreen />
  );
};

export default InputFormMachine;