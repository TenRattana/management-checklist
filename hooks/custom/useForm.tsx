import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/config/axios";
import { setForm, setSubForm, setField, reset } from "@/slices";
import { useToast } from "@/app/contexts";
import { useFocusEffect } from "@react-navigation/native";
import { SubForm, FormData, BaseFormState, BaseForm, BaseSubForm } from '@/typing/form';
import { CheckListType, CheckListOption, Checklist, DataType, GroupCheckListOption, Machine } from '@/typing/type';
import * as Yup from 'yup';

const useForm = (route: any) => {
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.form);

    const [checkList, setCheckList] = useState<Checklist[]>([]);
    const [checkListOption, setCheckListOption] = useState<CheckListOption[]>([]);
    const [groupCheckListOption, setGroupCheckListOption] = useState<GroupCheckListOption[]>([]);
    const [groupCheckListOptionActive, setGroupCheckListOptionActive] = useState<GroupCheckListOption[]>([]);
    const [checkListType, setCheckListType] = useState<CheckListType[]>([]);
    const [machine, setMachine] = useState<Machine[]>([]);
    const [dataType, setDataType] = useState<DataType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [found, setFound] = useState<boolean>(false);
    const [expectedResult, setExpectedResult] = useState<{ [key: string]: any }>({});
    const { formId, action, tableId, machineId } = route.params || {};
    const { handleError } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [checkLists, checkListOptions, groupCheckListOptions, groupCheckListOptionsActive, checkListTypes, dataTypes, machine] = await Promise.all([
                axiosInstance.post("CheckList_service.asmx/GetCheckLists"),
                axiosInstance.post("CheckListOption_service.asmx/GetCheckListOptions"),
                axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions"),
                axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptionsActive"),
                axiosInstance.post("CheckListType_service.asmx/GetCheckListTypes"),
                axiosInstance.post("DataType_service.asmx/GetDataTypes"),
                axiosInstance.post("Machine_service.asmx/GetMachines")
            ]);

            setCheckList(prev => prev.length ? prev : checkLists.data?.data ?? []);
            setCheckListOption(prev => prev.length ? prev : checkListOptions.data?.data ?? []);
            setGroupCheckListOption(prev => prev.length ? prev : groupCheckListOptions.data?.data ?? []);
            setGroupCheckListOptionActive(prev => prev.length ? prev : groupCheckListOptionsActive.data?.data ?? []);
            setCheckListType(prev => prev.length ? prev : checkListTypes.data?.data ?? []);
            setDataType(prev => prev.length ? prev : dataTypes.data?.data ?? []);
            setMachine(prev => prev.length ? prev : machine.data?.data ?? [])
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    const fetchForm = useCallback(async (formId: string, mode: boolean = false) => {
        if (!formId) return null;

        try {
            let response;

            if (mode) {
                response = await axiosInstance.post("Form_service.asmx/ScanForm", { MachineID: formId });
            } else {
                response = await axiosInstance.post("Form_service.asmx/GetForm", { FormID: formId });
            }

            const status = response?.data?.status;
            const data = response?.data?.data?.[0] || null;

            setFound(status);

            return data;
        } catch (error) {
            handleError(error);
            setFound(false);
            return null;
        }
    }, [handleError]);

    const loadForm = useCallback(async (formId: string, tableId?: string) => {
        let fetchedExpectedResult = [];
        if (tableId) {
            const expectedResultResponse = await axiosInstance.post("ExpectedResult_service.asmx/GetExpectedResult", { TableID: tableId });
            fetchedExpectedResult = expectedResultResponse.data?.data[0] || [];
            setExpectedResult(fetchedExpectedResult);
        }

        const formData = await fetchForm(formId);
        if (formData) {
            setFound(true);

            const { subForms, fields } = createSubFormsAndFields(formData, fetchedExpectedResult);
            const foundMachine = machine.find(v => v.MachineID === formData.MachineID);

            const machineName = foundMachine ? foundMachine.MachineName : "";
            formData['MachineName'] = machineName

            dispatch(setForm({ form: action === "copy" ? {} : formData }));
            dispatch(setSubForm({ subForms }));
            dispatch(setField({ BaseFormState: fields, checkList, checkListType }));
        } else {
            setFound(false);
        }
    }, [fetchForm, checkList, checkListType, dispatch, machine]);

    const loadFormMachine = useCallback(async (machineId: string) => {
        const formData = await fetchForm(machineId, true);
        if (formData) {
            setFound(true);

            const { subForms, fields } = createSubFormsAndFields(formData);

            const foundMachine = machine.find(v => v.MachineID === formData.MachineID);
            const machineName = foundMachine ? foundMachine.MachineName : "";
            formData['MachineName'] = machineName;

            dispatch(setForm({ form: formData }));
            dispatch(setSubForm({ subForms }));
            dispatch(setField({ BaseFormState: fields, checkList, checkListType }));
        } else {
            setFound(false);
        }
    }, [fetchForm, checkList, checkListType, dispatch, machine]);


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
            if (dataType.length) {
                if (formId && !machineId) {
                    loadForm(formId, tableId);
                }

                if (machineId) {
                    loadFormMachine(machineId);
                }
            }
        }, [formId, dataType.length, loadForm, tableId, machineId])
    );

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
    }, [state.subForms, dataType, checkListType]);

    return {
        found,
        state,
        checkListOption,
        setCheckListOption,
        dataType,
        setDataType,
        checkList,
        setCheckList,
        checkListType,
        setCheckListType,
        groupCheckListOption: tableId || machineId ? groupCheckListOption : groupCheckListOptionActive,
        setGroupCheckListOption,
        machine,
        isLoading,
        dispatch,
        fetchData,
        validationSchema
    };
};

export default useForm;
