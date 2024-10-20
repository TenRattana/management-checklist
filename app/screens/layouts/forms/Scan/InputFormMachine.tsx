import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/config/axios";
import { Card, Divider, HelperText } from "react-native-paper";
import { FlatList, Pressable, ViewStyle, Dimensions } from "react-native";
import { setForm, setSubForm, setField, reset } from "@/slices";
import { useToast, useRes } from "@/app/contexts";
import { BaseSubForm, FormData, BaseFormState, SubForm } from '@/typing/form';
import { CheckListType, Checklist, GroupCheckListOption, DataType } from '@/typing/type';
import { AccessibleView, Dynamic, NotFoundScreen, Text } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { PreviewProps } from "@/typing/tag";
import { ScanParams } from "@/typing/tag";
import { useFocusEffect } from "expo-router";
import { FastField, FieldProps, Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from "expo-router";

const { height: screenHeight } = Dimensions.get('window');

const InputFormMachine: React.FC<PreviewProps<ScanParams>> = ({ route }) => {
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.form);

  const navigation = useNavigation();

  const [checkList, setCheckList] = useState<Checklist[]>([]);
  const [checkListType, setCheckListType] = useState<CheckListType[]>([]);
  const [dataType, setDataType] = useState<DataType[]>([]);
  const [groupCheckListOption, setGroupCheckListOption] = useState<GroupCheckListOption[]>([]);
  const [found, setFound] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const masterdataStyles = useMasterdataStyles();
  const { machineId } = route.params || {};
  const { showSuccess, handleError } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [checkLists, checkListTypes, groupCheckListOptions, dataTypes] = await Promise.all([
        axiosInstance.post("CheckList_service.asmx/GetCheckLists"),
        axiosInstance.post("CheckListType_service.asmx/GetCheckListTypes"),
        axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions"),
        axiosInstance.post("DataType_service.asmx/GetDataTypes"),
      ]);

      setCheckList(prev => prev.length ? prev : checkLists.data?.data ?? []);
      setGroupCheckListOption(prev => prev.length ? prev : groupCheckListOptions.data?.data ?? []);
      setCheckListType(prev => prev.length ? prev : checkListTypes.data?.data ?? []);
      setDataType(prev => prev.length ? prev : dataTypes.data?.data ?? []);
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const fetchForm = useCallback(async (machineId: string) => {
    if (!machineId) return null;

    try {
      const response = await axiosInstance.post("Form_service.asmx/ScanForm", { MachineID: machineId });
      setFound(response.data.status);
      showSuccess(String(response.data?.message));
      return response.data?.data[0] || null;
    } catch (error) {
      handleError(error);
      setFound(false);
      return null;
    }
  }, [handleError, showSuccess]);

  const createSubFormsAndFields = useCallback((formData: FormData) => {
    const subForms: SubForm[] = [];
    const fields: BaseFormState[] = [];

    formData.SubForm?.forEach((item) => {
      const subForm: SubForm = {
        SFormID: item.SFormID,
        SFormName: item.SFormName,
        FormID: item.FormID,
        Columns: item.Columns,
        DisplayOrder: item.DisplayOrder,
        MachineID: item.MachineID,
        Fields: []
      };
      subForms.push(subForm);

      item.MatchCheckList?.forEach((itemOption) => {
        fields.push({
          MCListID: itemOption.MCListID,
          CListID: itemOption.CListID,
          GCLOptionID: itemOption.GCLOptionID,
          CTypeID: itemOption.CTypeID,
          DTypeID: itemOption.DTypeID,
          DTypeValue: itemOption.DTypeValue,
          SFormID: itemOption.SFormID,
          Required: itemOption.Required,
          MinLength: itemOption.MinLength,
          MaxLength: itemOption.MaxLength,
          Placeholder: itemOption.Placeholder,
          Hint: itemOption.Hint,
          DisplayOrder: itemOption.DisplayOrder,
          EResult: "",
        });
      });
    });

    return { subForms, fields };
  }, []);

  const loadForm = useCallback(async (machineId: string) => {
    const formData = await fetchForm(machineId);
    if (formData) {
      setFound(true);

      const { subForms, fields } = createSubFormsAndFields(formData);
      dispatch(setForm({ form: formData }));
      dispatch(setSubForm({ subForms }));
      dispatch(setField({ BaseFormState: fields, checkList, checkListType }));
    } else {
      setFound(false);
    }
  }, [fetchForm, checkList, checkListType, dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => {
        dispatch(reset());
      };
    }, [fetchData, dispatch])
  );

  useFocusEffect(
    useCallback(() => {
      if (dataType.length && machineId) {
        loadForm(machineId);
      }
    }, [machineId, dataType.length, loadForm, machineId])
  );

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

          if (field.MinLength !== undefined) {
            validator = validator.min(field.MinLength, `The ${field.CListName} minimum value is ${field.MinLength}`);
          }

          if (field.MaxLength !== undefined) {
            validator = validator.max(field.MaxLength, `The ${field.CListName} maximum value is ${field.MaxLength}`);
          }

          if (field.MinLength !== undefined && field.MinLength < 0) {
            validator = validator.min(0, `The ${field.CListName} cannot be negative`);
          }
        }
        else if (dataTypeName === "String") {

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
        <>
          <Text style={[masterdataStyles.title, { textAlign: 'center' }]}>{state.FormName || "Content Name"}</Text>
          <Divider />
          <Text style={[masterdataStyles.description, { textAlign: 'center', paddingVertical: 10 }]}>{state.Description || "Content Description"}</Text>

          <Formik
            initialValues={formValues}
            validationSchema={validationSchema}
            onSubmit={(value) => onFormSubmit(value)}
          >
            {({ handleSubmit, isValid, dirty, errors, touched, setFieldValue, setTouched }) => (
              <>
                <FlatList
                  data={state.subForms}
                  renderItem={({ item, index }) => (
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
                                {({ field: fastFieldProps }: FieldProps) => {
                                  const type = dataType.find(v => v.DTypeID === fields.DTypeID)?.DTypeName;

                                  const handleBlur = () => {
                                    if (type === "Number") {
                                      const numericValue = Number(fastFieldProps.value);

                                      if (!isNaN(numericValue) && Number(fields.DTypeValue) > 0 && numericValue) {
                                        const formattedValue = numericValue.toFixed(Number(fields.DTypeValue));
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

                                  console.log(errors);

                                  return (
                                    <AccessibleView name="container-layout2" key={`fastfield-${fields.CListID}-field-${fieldIndex}-${item.SFormID}`} style={containerStyle}>
                                      <Dynamic
                                        field={fields}
                                        values={fastFieldProps.value ?? ""}
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
                                        errorMessage={errors[fastFieldProps.name] as string}
                                      />
                                    </AccessibleView>
                                  );
                                }}
                              </FastField>

                            );
                          })}
                        </Card.Content>
                      </Card>
                    </AccessibleView>
                  )}
                  keyExtractor={(item) => item.SFormID.toString()}
                  nestedScrollEnabled={true}
                  ListFooterComponentStyle={{ alignItems: 'center', width: "100%" }}
                  ListFooterComponent={() => (
                    <AccessibleView name="form-action-scan" style={[masterdataStyles.containerAction]}>
                      <Pressable
                        onPress={() => handleSubmit()}
                        style={[
                          masterdataStyles.button,
                          masterdataStyles.backMain,
                        ]}
                      >
                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Submit</Text>
                      </Pressable>
                    </AccessibleView>
                  )}
                />
              </>
            )}
          </Formik>
        </>
      ) : (
        <AccessibleView name="form-success" style={masterdataStyles.containerScccess}>
          <Text>Your form has been submitted successfully!</Text>
          <Pressable onPress={() => {
            setIsSubmitted(false)
            navigation.navigate("ScanQR")
          }} style={masterdataStyles.linkScccess}>
            <Text style={masterdataStyles.linkTextScccess}>บันทึก</Text>
          </Pressable>
        </AccessibleView>
      )}
    </AccessibleView>
  ) : (
    <NotFoundScreen />
  );
};

export default InputFormMachine;
