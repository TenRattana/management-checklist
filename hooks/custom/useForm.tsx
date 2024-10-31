import React, { useState, useCallback, useMemo } from "react";
import axiosInstance from "@/config/axios";
import { setForm, setSubForm, setField } from "@/slices";
import { useToast } from "@/app/contexts";
import { useFocusEffect } from "@react-navigation/native";
import * as Yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import { SubForm, FormData, BaseFormState, BaseForm, BaseSubForm } from '@/typing/form';
import { CheckListType, CheckListOption, Checklist, DataType, GroupCheckListOption, Machine } from '@/typing/type';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ActivityIndicator } from "react-native";

const fetchCheckList = async (): Promise<Checklist[]> => {
    const response = await axiosInstance.post("CheckList_service.asmx/GetCheckLists");
    return response.data.data ?? [];
};

const fetchCheckListOption = async (): Promise<CheckListOption[]> => {
    const response = await axiosInstance.post("CheckListOption_service.asmx/GetCheckListOptions");
    return response.data.data ?? [];
};

const fetchGroupChecklistOption = async (): Promise<GroupCheckListOption[]> => {
    const response = await axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions");
    return response.data.data ?? [];
};

const fetchGroupCheckListOptionActive = async (): Promise<GroupCheckListOption[]> => {
    const response = await axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptionsActive");
    return response.data.data ?? [];
};

const fetchCheckListType = async (): Promise<CheckListType[]> => {
    const response = await axiosInstance.post("CheckListType_service.asmx/GetCheckListTypes");
    return response.data.data ?? [];
};

const fetchDataType = async (): Promise<DataType[]> => {
    const response = await axiosInstance.post("DataType_service.asmx/GetDataTypes");
    return response.data.data ?? [];
};

const fetchMachine = async (): Promise<Machine[]> => {
    const response = await axiosInstance.post("Machine_service.asmx/GetMachines");
    return response.data.data ?? [];
};

const useForm = (route: any) => {
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.form);
    const { formId, action, tableId, machineId } = route.params || {};

    const [found, setFound] = useState<boolean>(false);
    const [expectedResult, setExpectedResult] = useState<{ [key: string]: any }>({});

    const { handleError } = useToast();
    const queryClient = useQueryClient();

    const fetchAllData = useCallback(async () => {
        try {
            const [
                checkList,
                checkListOption,
                groupCheckListOption,
                groupCheckListOptionActive,
                checkListType,
                dataType,
                machine
            ] = await Promise.all([
                fetchCheckList(),
                fetchCheckListOption(),
                fetchGroupChecklistOption(),
                fetchGroupCheckListOptionActive(),
                fetchCheckListType(),
                fetchDataType(),
                fetchMachine()
            ]);

            return {
                checkList,
                checkListOption,
                groupCheckListOption,
                groupCheckListOptionActive,
                checkListType,
                dataType,
                machine
            };
        } catch (error) {
            handleError(error);
            return null;
        }
    }, [handleError]);

    const { data, isLoading } = useQuery('allData', fetchAllData);

    const { checkList, checkListOption, groupCheckListOption, groupCheckListOptionActive, checkListType, dataType, machine } = data || {};

    const fetchForm = useCallback(async (formId: string, mode: boolean = false) => {
        if (!formId) return null;
        console.log(formId);

        try {
            const response = await axiosInstance.post(mode ? "Form_service.asmx/ScanForm" : "Form_service.asmx/GetForm", { FormID: formId });
            const status = response?.data?.status;
            const formData = response?.data?.data?.[0] || null;

            setFound(status);
            return formData;
        } catch (error) {
            handleError(error);
            setFound(false);
            return null;
        }
    }, [handleError]);

    const createSubFormsAndFields = useCallback((formData: FormData, expectedResult?: { [key: string]: any }) => {
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
                    EResult: expectedResult?.[itemOption.MCListID] || "",
                });
            });
        });

        return { subForms, fields };
    }, []);

    const loadForm = useCallback(async (formId: string, tableId?: string) => {
        if (tableId) {
            const expectedResultResponse = await axiosInstance.post("ExpectedResult_service.asmx/GetExpectedResult", { TableID: tableId });
            setExpectedResult(expectedResultResponse.data?.data[0] || []);
        }

        const formData = await fetchForm(formId);
        if (formData) {
            setFound(true);

            const { subForms, fields } = createSubFormsAndFields(formData, expectedResult);
            const foundMachine = machine?.find(v => v.MachineID === formData.MachineID);
            formData['MachineName'] = foundMachine ? foundMachine.MachineName : "";

            dispatch(setForm({ form: action === "copy" ? {} : formData }));
            dispatch(setSubForm({ subForms }));
            dispatch(setField({ BaseFormState: fields, checkList: checkList ?? [], checkListType: checkListType ?? [] }));
        } else {
            setFound(false);
        }
    }, [fetchForm, createSubFormsAndFields, expectedResult, dispatch, checkList, checkListType, machine, action]);

    const loadFormMachine = useCallback(async (machineId: string) => {
        const formData = await fetchForm(machineId, true);
        if (formData) {
            setFound(true);

            const { subForms, fields } = createSubFormsAndFields(formData);
            const foundMachine = machine?.find(v => v.MachineID === formData.MachineID);
            formData['MachineName'] = foundMachine ? foundMachine.MachineName : "";

            dispatch(setForm({ form: formData }));
            dispatch(setSubForm({ subForms }));
            dispatch(setField({ BaseFormState: fields, checkList: checkList ?? [], checkListType: checkListType ?? [] }));
        } else {
            setFound(false);
        }
    }, [fetchForm, checkList, checkListType, dispatch, machine]);

    useFocusEffect(
        useCallback(() => {
            if (isLoading) {
                console.log(isLoading);

                if (formId && !machineId) {
                    loadForm(formId, tableId);
                }
                if (machineId) {
                    loadFormMachine(machineId);
                }
            }
        }, [isLoading, formId, tableId, machineId, dispatch])
    );

    const validationSchema = useMemo(() => {
        if (isLoading) {
            const shape: any = {};

            state.subForms.forEach((subForm: BaseSubForm) => {
                subForm.Fields.forEach((field: BaseFormState) => {
                    const dataTypeName = dataType?.find(item => item.DTypeID === field.DTypeID)?.DTypeName;
                    const checkListTypeName = checkListType?.find(item => item.CTypeID === field.CTypeID)?.CTypeName;

                    let validator;

                    if (dataTypeName === "Number") {
                        validator = Yup.number()
                            .nullable()
                            .typeError(`The ${field.CListName} field must be a valid number`);

                        if (field.MinLength !== undefined && field.MinLength !== null) {
                            validator = validator.test(
                                'min-length',
                                `The ${field.CListName} minimum control value is ${field.MinLength}`,
                                value => value === undefined || value === null || Number(value) >= Number(field.MinLength)
                            );
                        }

                        if (field.MaxLength !== undefined && field.MaxLength !== null) {
                            validator = validator.test(
                                'max-length',
                                `The ${field.CListName} maximum control value is ${field.MaxLength}`,
                                value => value === undefined || value === null || Number(value) <= Number(field.MaxLength)
                            );
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
        }
    }, [state.subForms, isLoading]);

    return {
        found,
        state,
        checkListOption,
        dataType,
        checkList,
        checkListType,
        groupCheckListOption: tableId || machineId ? groupCheckListOption : groupCheckListOptionActive,
        machine,
        isLoading,
        dispatch,
        validationSchema
    };
};

export default useForm;