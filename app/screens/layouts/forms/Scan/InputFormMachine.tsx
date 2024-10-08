import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/config/axios";
import axios from "axios";
import { Card, Divider } from "react-native-paper";
import { StyleSheet, Text, ScrollView, ViewStyle, Pressable } from "react-native";
import { setForm, setSubForm, setField, reset } from "@/slices";
import { useToast, useRes } from "@/app/contexts";
import { BaseSubForm, FormData, BaseFormState, BaseForm } from '@/typing/form'
import { CheckListType, Checklist, GroupCheckListOption } from '@/typing/type'
import { AccessibleView, Dynamic } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { PreviewProps } from "@/typing/tag";
import { ScanParams } from "@/typing/tag";
import { useFocusEffect } from "expo-router";

const InputFormMachine: React.FC<PreviewProps<ScanParams>> = ({ route }) => {
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.form);

  const [checkList, setCheckList] = useState<Checklist[]>([]);
  const [checkListType, setCheckListType] = useState<CheckListType[]>([]);
  const [groupCheckListOption, setGroupCheckListOption] = useState<GroupCheckListOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoding] = useState<boolean>(false);
  const masterdataStyles = useMasterdataStyles()

  const { machineId } = route.params || {};
  const { showSuccess, handleError } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const responses = await Promise.all([
        axiosInstance.post("CheckList_service.asmx/GetCheckLists"),
        axiosInstance.post("CheckListType_service.asmx/GetCheckListTypes"),
        axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions"),
      ]);

      setCheckList(responses[0].data.data ?? []);
      setCheckListType(responses[1].data.data ?? []);
      setGroupCheckListOption(responses[2].data.data ?? []);
      setDataLoding(true)
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchForm = async (machineId: string) => {
    if (!machineId) return null;

    try {
      const response = await axios.post("Form_service.asmx/ScanForm", { MachineID: machineId });
      showSuccess(String(response.data.message))
      return response.data?.data[0] || null;
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  const createSubFormsAndFields = (formData: FormData) => {
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
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => { dispatch(reset()) };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const loadForm = async () => {
        if (machineId) {
          const formData = await fetchForm(machineId);
          const { subForms, fields } = createSubFormsAndFields(formData);
          const formCopy: BaseForm = {
            FormID: "",
            Description: "",
            FormName: "",
            MachineID: "",
          }
          dispatch(setForm({ form: formData }));
          dispatch(setSubForm({ subForms }));
          dispatch(setField({ BaseFormState: fields, checkList, checkListType }));
        }
      };
      loadForm();
      return () => { };
    }, [machineId, dataLoading])
  );


  const { responsive } = useRes();
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (state.subForms) {
      const initialValues: { [key: string]: any } = {};
      state.subForms.forEach((subForm: BaseSubForm) => {
        subForm.Fields?.forEach((field: BaseFormState) => {
          initialValues[field.MCListID] = field.EResult ?? "";
        });
      });
      setFormValues(initialValues);
    }
  }, [state.subForms]);

  const handleChange = useCallback((fieldName: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const onFormSubmit = async () => {
    const updatedSubForms = state.subForms.map((subForm: BaseSubForm) => ({
      ...subForm,
      fields: subForm?.Fields?.map((field: BaseFormState) => ({
        ...field,
        expectedResult: formValues[field.MCListID] || "",
      })),
    }));

    const data = { FormData: JSON.stringify(updatedSubForms) };

    try {
      const response = await axios.post("ExpectedResult_service.asmx/SaveExpectedResult", data);
      showSuccess(String(response.data.message));
    } catch (error) {
      handleError(error)
    }
  };

  return (
    <AccessibleView style={styles.container}>
      <Text style={styles.title}>{state.FormName || "Content Name"}</Text>
      <Divider />
      <Text style={[styles.description]}>{state.Description || "Content Description"}</Text>

      <ScrollView style={{ flex: 1 }}>
        {state.subForms.map((subForm: BaseSubForm, index: number) => (
          <AccessibleView key={`subForm-${index}`} >
            <Card style={styles.card}>
              <Card.Title title={subForm.SFormName} titleStyle={styles.cardTitle} />
              <Card.Content style={styles.subFormContainer}>
                {subForm.Fields?.map((field: BaseFormState, fieldIndex: number) => {
                  const columns = subForm.Columns ?? 1;

                  const containerStyle: ViewStyle = {
                    flexBasis: responsive === "small" ? "100%" : `${100 / (columns > 1 ? columns : 1)}%`,
                    flexGrow: field.DisplayOrder || 1,
                    padding: 5,
                  };

                  return (
                    <AccessibleView
                      key={`field-${fieldIndex}-${subForm.SFormName}`}
                      style={containerStyle}
                    >
                      <Dynamic
                        field={field}
                        values={formValues}
                        setFieldValue={handleChange}
                        groupCheckListOption={groupCheckListOption}
                      />
                    </AccessibleView>
                  );
                })}
              </Card.Content>
            </Card>
          </AccessibleView>
        ))}
        <AccessibleView style={masterdataStyles.containerAction}>
          <Pressable
            onPress={onFormSubmit}
            style={[
              masterdataStyles.button,
              masterdataStyles.backMain
            ]}
            testID="Save-scan"
          >
            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Save Submit</Text>
          </Pressable>
        </AccessibleView>
      </ScrollView>
    </AccessibleView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 20,
    marginBottom: 16,
  },
  subFormContainer: {
    marginBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  subFormTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  card: {
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  submitText: {
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#007BFF',
    color: '#FFF',
    borderRadius: 5,
    marginTop: 20,
  },
});

export default React.memo(InputFormMachine);
