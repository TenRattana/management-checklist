import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/config/axios";
import { Card, Divider, HelperText } from "react-native-paper";
import { Text, FlatList, Pressable, ViewStyle } from "react-native";
import { setForm, setSubForm, setField, reset } from "@/slices";
import { useToast, useRes } from "@/app/contexts";
import { BaseSubForm, FormData, BaseFormState } from '@/typing/form';
import { CheckListType, Checklist, GroupCheckListOption, DataType } from '@/typing/type';
import { AccessibleView, Dynamic, NotFoundScreen } from "@/components";
import useMasterdataStyles from "@/styles/common/masterdata";
import { PreviewProps } from "@/typing/tag";
import { ScanParams } from "@/typing/tag";
import { useFocusEffect } from "expo-router";
import { FastField, Formik, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from "expo-router";

const InputFormMachine: React.FC<PreviewProps<ScanParams>> = ({ route }) => {
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.form);

  const navigation = useNavigation();

  const [checkList, setCheckList] = useState<Checklist[]>([]);
  const [checkListType, setCheckListType] = useState<CheckListType[]>([]);
  const [dataType, setDataType] = useState<DataType[]>([]);
  const [groupCheckListOption, setGroupCheckListOption] = useState<GroupCheckListOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [found, setFound] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    const subForms: any = [];
    const fields: any = [];

    formData.SubForm?.forEach((item) => {
      const subForm = {
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
    }, [machineId, found, dispatch, fetchForm, createSubFormsAndFields, checkList, checkListType])
  );

  const { responsive } = useRes();

  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

  const validationSchema = useMemo(() => {
    const shape: any = {};

    state.subForms?.forEach((subForm: BaseSubForm) => {
      subForm.Fields?.forEach((field: BaseFormState) => {
        const dataTypeName = dataType.find(item => item.DTypeID === field.DTypeID)?.DTypeName;
        const checkListTypeName = checkListType.find(item => item.CTypeID === field.CTypeID)?.CTypeName;

        if (dataTypeName === "Number") {
          let validator = Yup.number()
            .nullable()
            .typeError(`The ${field.CListName} field a valid number`);

          if (field.Required) {
            validator = validator.required(`The ${field.Placeholder} field is required`);
          }

          if (field.MinLength) {
            validator = validator.min(field.MinLength, `The ${field.CListName} minimum value is ${field.MinLength}`)
          }

          if (field.MaxLength) {
            validator = validator.max(field.MaxLength, `The ${field.CListName} maximum value is ${field.MaxLength}`)
          }

          shape[field.MCListID] = validator;
        }
        else if (dataTypeName === "String") {

          let validator;

          if (checkListTypeName === "Checkbox") {
            validator = Yup.array()
              .of(Yup.string())
              .min(1, `The ${field.CListName} field requires at least one option to be selected`)
          } else {
            validator = Yup.string()
              .nullable()
              .typeError(`The ${field.CListName} field a valid string`);;
          }

          if (field.Required) {
            validator = validator.required(`The ${field.Placeholder} field is required`);
          }

          shape[field.MCListID] = validator;
        }
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

  const renderSubForm = useCallback(({ item }: any) => {
    return (
      <AccessibleView name="input-form-machine" key={item.SFormID} >
        <Card style={masterdataStyles.card}>
          <Card.Title title={item.SFormName} titleStyle={masterdataStyles.cardTitle} />
          <Card.Content style={masterdataStyles.subFormContainer}>
            {item.Fields?.map((fields: BaseFormState, fieldIndex: number) => {

              const columns = item.Columns ?? 1;
              const isLastColumn = (fieldIndex + 1) % columns === 0;

              const containerStyle: ViewStyle = {
                flexBasis: responsive === "small" ? "100%" : `${98 / columns}%`,
                flexGrow: fields.DisplayOrder || 1,
                padding: 5,
                // borderRightWidth: isLastColumn ? 0 : 1,
                marginHorizontal: 5,
              };

              return (
                <FastField name={fields.MCListID}>
                  {({ field, form }: any) => (
                    <AccessibleView name="contianer-layout2" key={`fieldid-${fields.CListID}-field-${fieldIndex}-${item.SFormID}`} style={containerStyle}>
                      <Dynamic
                        field={fields}
                        values={field.value}
                        handleChange={(fieldname: string, value: any) => {
                          form.setFieldValue(field.name, value)
                          setTimeout(() => {
                            form.setTouched({ ...form.touched, [field.name]: true })
                          }, 0)
                        }}
                        groupCheckListOption={groupCheckListOption}
                      />
                      <HelperText type="error" visible={form.touched[field.name] && Boolean(form.errors[field.name])} style={{ left: -10 }}>
                        {form.errors[field.name] || ""}
                      </HelperText>
                    </AccessibleView>

                  )}
                </FastField>
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
    <AccessibleView name="container-form-scan" style={[masterdataStyles.container, { maxHeight: 900, paddingBottom: 30 }]}>
      {!isSubmitted ? (
        <>
          <Text style={masterdataStyles.title}>{state.FormName || "Content Name"}</Text>
          <Divider />
          <Text style={masterdataStyles.description}>{state.Description || "Content Description"}</Text>

          <Formik
            initialValues={formValues}
            validationSchema={validationSchema}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={(value) => onFormSubmit(value)}
          >
            {({ handleSubmit, isValid, dirty }) => (
              <>
                <FlatList
                  data={state.subForms}
                  renderItem={renderSubForm}
                  keyExtractor={(item) => item.SFormID}
                  nestedScrollEnabled={true}
                  ListFooterComponentStyle={{ alignItems: 'center', width: "100%" }}
                  ListFooterComponent={() => (
                    <AccessibleView name="form-action-scan" style={[masterdataStyles.containerAction]}>
                      <Pressable
                        onPress={() => handleSubmit()}
                        disabled={!isValid || !dirty}
                        style={[
                          masterdataStyles.button,
                          isValid && dirty ? masterdataStyles.backMain : masterdataStyles.backDis,
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
            <Text style={masterdataStyles.linkTextScccess}>Submit another</Text>
          </Pressable>
        </AccessibleView>
      )}
    </AccessibleView>
  ) : (
    <NotFoundScreen />
  );
};

export default InputFormMachine;
