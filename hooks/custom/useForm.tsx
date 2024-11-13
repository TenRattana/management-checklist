import React, { useState, useCallback, useMemo } from "react";
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
    const { formId, action, tableId, machineId } = route.params || {};
    const { handleError } = useToast();

    const fetchData = useCallback(async () => {
        if (isLoading || checkList.length) return;

        setIsLoading(true);
        try {
            const responses = await Promise.all([
                axiosInstance.post("CheckList_service.asmx/GetCheckLists"),
                axiosInstance.post("CheckListOption_service.asmx/GetCheckListOptions"),
                axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions"),
                axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptionsActive"),
                axiosInstance.post("CheckListType_service.asmx/GetCheckListTypes"),
                axiosInstance.post("DataType_service.asmx/GetDataTypes"),
                axiosInstance.post("Machine_service.asmx/GetMachines")
            ]);

            setCheckList(responses[0].data?.data ?? []);
            setCheckListOption(responses[1].data?.data ?? []);
            setGroupCheckListOption(responses[2].data?.data ?? []);
            setGroupCheckListOptionActive(responses[3].data?.data ?? []);
            setCheckListType(responses[4].data?.data ?? []);
            setDataType(responses[5].data?.data ?? []);
            setMachine(responses[6].data?.data ?? []);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, checkList.length, handleError]);

    const fetchForm = useCallback(async (formId: string, mode: boolean = false) => {
        if (!formId) return null;

        try {
            const endpoint = mode ? "Form_service.asmx/ScanForm" : "Form_service.asmx/GetForm";
            const response = await axiosInstance.post(endpoint, { [mode ? "MachineID" : "FormID"]: formId });
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
        if (!formId) return;

        let fetchedExpectedResult = [];
        if (tableId) {
            const expectedResultResponse = await axiosInstance.post("ExpectedResult_service.asmx/GetExpectedResult", { TableID: tableId });
            fetchedExpectedResult = expectedResultResponse.data?.data[0] || [];
        }

        const formData = await fetchForm(formId);
        if (formData) {
            setFound(true);

            const { subForms, fields } = createSubFormsAndFields(formData, fetchedExpectedResult);
            const machineName = machine.find(v => v.MachineID === formData.MachineID)?.MachineName || "";
            formData['MachineName'] = machineName;

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
            const machineName = machine.find(v => v.MachineID === formData.MachineID)?.MachineName || "";
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
                const Value = itemOption?.ImportantList?.length &&
                    !itemOption?.ImportantList[0]?.MinLength &&
                    !itemOption?.ImportantList[0]?.MaxLength
                    ? itemOption.ImportantList
                        .map(v => v.Value)
                        .filter((v): v is string => v !== undefined)
                    : undefined;

                fields.push({
                    MCListID: itemOption.MCListID,
                    CListID: itemOption.CListID,
                    GCLOptionID: itemOption.GCLOptionID,
                    CTypeID: itemOption.CTypeID,
                    DTypeID: itemOption.DTypeID,
                    DTypeValue: itemOption.DTypeValue,
                    SFormID: itemOption.SFormID,
                    Required: itemOption.Required,
                    Important: itemOption.Important,
                    ImportantList: itemOption?.ImportantList?.length
                        ? [{
                            MCListID: itemOption?.ImportantList[0]?.MCListID,
                            MinLength: itemOption?.ImportantList[0]?.MinLength,
                            MaxLength: itemOption?.ImportantList[0]?.MaxLength,
                            Value
                        }]
                        : [],
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
            if (!checkList.length) fetchData();
            return () => dispatch(reset());
        }, [fetchData, checkList.length, dispatch])
    );

    useFocusEffect(
        useCallback(() => {
            if (dataType.length) {
                if (formId && !machineId) loadForm(formId, tableId);
                else if (machineId) loadFormMachine(machineId);
            }
        }, [formId, machineId, dataType.length, loadForm, loadFormMachine, tableId])
    );

    const validationSchema = useMemo(() => {
        const shape: any = {};
    
        state.subForms.forEach((subForm: BaseSubForm) => {
            subForm.Fields.forEach((field: BaseFormState) => {
                if (field.Required) {
                    shape[field.MCListID] = Yup.string()
                        .required("กรุณาระบุข้อมูล");
                } else {
                    if (field.CTypeID === "text" || field.CTypeID === "textarea") {
                        shape[field.MCListID] = Yup.string().nullable();
                    } else if (field.CTypeID === "number") {
                        shape[field.MCListID] = Yup.number()
                            .typeError("กรุณาระบุข้อมูลเป็นตัวเลข")
                            .nullable();
                    } else if (field.CTypeID === "email") {
                        shape[field.MCListID] = Yup.string()
                            .email("รูปแบบอีเมลไม่ถูกต้อง")
                            .nullable();
                    } else if (field.CTypeID === "date") {
                        shape[field.MCListID] = Yup.date()
                            .typeError("กรุณาระบุวันที่ที่ถูกต้อง")
                            .nullable();
                    }
                }
    
            });
        });
    
        return Yup.object().shape(shape);
    }, [state.subForms]);
    

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
