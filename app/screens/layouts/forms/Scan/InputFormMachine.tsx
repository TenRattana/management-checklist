import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/config/axios";
import { Card, Divider, HelperText } from "react-native-paper";
import { StyleSheet, Text, FlatList, Pressable, ViewStyle } from "react-native";
import { setForm, setSubForm, setField, reset } from "@/slices";
import { useToast, useRes } from "@/app/contexts";
import { BaseSubForm, FormData, BaseFormState } from '@/typing/form';
import { CheckListType, Checklist, GroupCheckListOption, DataType } from '@/typing/type';
import { AccessibleView, Dynamic, NotFoundScreen } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { PreviewProps } from "@/typing/tag";
import { ScanParams } from "@/typing/tag";
import { useFocusEffect } from "expo-router";
import { Formik, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';

const InputFormMachine: React.FC<PreviewProps<ScanParams>> = ({ route }) => {
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.form);

  const [checkList, setCheckList] = useState<Checklist[]>([]);
  const [checkListType, setCheckListType] = useState<CheckListType[]>([]);
  const [dataType, setDataType] = useState<DataType[]>([]);
  const [groupCheckListOption, setGroupCheckListOption] = useState<GroupCheckListOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [found, setFound] = useState<boolean>(false);

  const masterdataStyles = useMasterdataStyles();
  const { machineId } = route.params || {};
  const { showSuccess, handleError } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const responses = await Promise.all([
        axiosInstance.post("CheckList_service.asmx/GetCheckLists"),
        axiosInstance.post("CheckListType_service.asmx/GetCheckListTypes"),
        axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions"),
        axiosInstance.post("DataType_service.asmx/GetDataTypes"),
      ]);

      setCheckList(responses[0].data.data ?? []);
      setCheckListType(responses[1].data.data ?? []);
      setGroupCheckListOption(responses[2].data.data ?? []);
      setDataType(responses[3].data.data ?? []);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
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
    const subForms: BaseSubForm[] = [];
    const fields: BaseFormState[] = [];

    formData.SubForm?.forEach((item) => {
      const subForm: BaseSubForm = {
        SFormID: item.SFormID,
        SFormName: item.SFormName,
        FormID: item.FormID,
        Columns: item.Columns,
        DisplayOrder: item.DisplayOrder,
        MachineID: item.MachineID,
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
          EResult: itemOption.EResult,
        });
      });
    });

    return { subForms, fields };
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => { dispatch(reset()); };
    }, [dispatch, fetchData])
  );

  useFocusEffect(
    useCallback(() => {
      const loadForm = async () => {
        if (machineId) {
          const formData = await fetchForm(machineId);
          if (found && formData) {
            const { subForms, fields } = createSubFormsAndFields(formData);
            dispatch(setForm({ form: formData }));
            dispatch(setSubForm({ subForms }));
            dispatch(setField({ BaseFormState: fields, checkList, checkListType }));
          }
        }
      };
      loadForm();
      return () => { };
    }, [machineId, found, dispatch, fetchForm, createSubFormsAndFields, checkList, checkListType])
  );

  const { responsive } = useRes();

  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
  const validationSchema = useMemo(() => {
    const shape: any = {};

    state.subForms?.forEach((subForm: BaseSubForm) => {
      subForm.Fields?.forEach((field: BaseFormState) => {
        if (field.Required) {
          shape[field.MCListID] = Yup.string()
            .required(`${field.Placeholder} is required`)
            .test('is-correct-type', `${field.Placeholder} must be a ${dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName}`, (value) => {
              if (dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName === 'String') {
                return !value || !isNaN(Number(value));
              }
              return true;
            });
        }
      });
    });

    return Yup.object().shape(shape);
  }, [state.subForms]);

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

    console.log(data);

    // try {
    //   const response = await axiosInstance.post("ExpectedResult_service.asmx/SaveExpectedResult", data);
    //   showSuccess(String(response.data.message));
    // } catch (error) {
    //   handleError(error);
    // }
  }, [showSuccess, handleError, state.subForms, state.MachineID]);

  const renderSubForm = useCallback(
    (item: BaseSubForm, setFieldValue: (name: string, value: any) => void, values: { [key: string]: any; }, errors: FormikErrors<{ [key: string]: any; }>, touched: FormikTouched<{ [key: string]: any; }>) => {
      return (
        <AccessibleView key={item.SFormID}>
          <Card style={styles.card}>
            <Card.Title title={item.SFormName} titleStyle={styles.cardTitle} />
            <Card.Content style={styles.subFormContainer}>
              {item.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                return (
                  <AccessibleView key={`field-${fieldIndex}-${item.SFormID}`}>
                    <Dynamic
                      field={field}
                      values={values}
                      setFieldValue={setFieldValue}
                      groupCheckListOption={groupCheckListOption}
                    />
                    {touched?.[field.MCListID] && errors?.[field.MCListID] && (
                      <HelperText
                        type="error"
                        visible={Boolean(touched[field.MCListID] && errors[field.MCListID])}
                        style={masterdataStyles.textError}
                        testID="error-machineGroupId-md"
                      >
                        {typeof errors[field.MCListID] === 'string'
                          ? errors[field.MCListID]
                          : Array.isArray(errors[field.MCListID])
                            ? errors[field.MCListID].join(', ') || ""
                            : '' }
                      </HelperText>
                    )}
                  </AccessibleView>
                );
              })}
            </Card.Content>
          </Card>
        </AccessibleView>
      );
    },
    [groupCheckListOption, formValues]
  );


  return found ? (
    <AccessibleView style={styles.container}>
      <Text style={styles.title}>{state.FormName || "Content Name"}</Text>
      <Divider />
      <Text style={styles.description}>{state.Description || "Content Description"}</Text>

      <Formik
        initialValues={formValues}
        validationSchema={validationSchema}
        onSubmit={(value) => onFormSubmit(value)}
      >
        {({ handleSubmit, setFieldValue, values, errors, touched }) => (
          <AccessibleView>
            <FlatList
              data={state.subForms}
              renderItem={({ item }) => renderSubForm(item, setFieldValue, values, errors, touched)}
              keyExtractor={(item) => item.SFormID}
            />
            <AccessibleView style={masterdataStyles.containerAction}>
              <Pressable
                onPress={() => handleSubmit()}
                style={[masterdataStyles.button, masterdataStyles.backMain]}
              >
                <Text style={masterdataStyles.text}>Submit</Text>
              </Pressable>
            </AccessibleView>
          </AccessibleView>
        )}
      </Formik>
    </AccessibleView>
  ) : (
    <NotFoundScreen />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  card: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  subFormContainer: {
    marginVertical: 10,
  },
  fieldCard: {
    marginVertical: 5,
  },
});

export default InputFormMachine;
