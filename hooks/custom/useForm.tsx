import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/config/axios";
import axios from "axios";
import { setForm, setSubForm, setField } from "@/slices";
import { useToast, useRes } from "@/app/contexts";
import { useFocusEffect } from "@react-navigation/native";
import { SubForm, FormData, BaseFormState } from '@/typing/form'
import { CheckListType, CheckListOption, Checklist, DataType, GroupCheckListOption } from '@/typing/type'

const useForm = (route: any) => {
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.form);

    const [checkList, setCheckList] = useState<Checklist[]>([]);
    const [checkListOption, setCheckListOption] = useState<CheckListOption[]>([]);
    const [groupCheckListOption, setGroupCheckListOption] = useState<GroupCheckListOption[]>([]);
    const [checkListType, setCheckListType] = useState<CheckListType[]>([]);
    const [dataType, setDataType] = useState<DataType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { formId, action } = route.params || {};
    const { showError } = useToast();

    const errorMessage = useCallback((error: unknown) => {
        let errorMsg: string | string[];

        if (axios.isAxiosError(error)) {
            errorMsg = error.response?.data?.errors ?? ["Something went wrong!"];
        } else if (error instanceof Error) {
            errorMsg = [error.message];
        } else {
            errorMsg = ["An unknown error occurred!"];
        }

        showError(Array.isArray(errorMsg) ? errorMsg : [errorMsg]);
    }, [showError]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const responses = await Promise.all([
                axiosInstance.post("CheckList_service.asmx/GetCheckLists"),
                axiosInstance.post("CheckListOption_service.asmx/GetCheckListOptions"),
                axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions"),
                axiosInstance.post("CheckListType_service.asmx/GetCheckListTypes"),
                axiosInstance.post("DataType_service.asmx/GetDataTypes"),
            ]);

            setCheckList(responses[0].data.data ?? []);
            setCheckListOption(responses[1].data.data ?? []);
            setGroupCheckListOption(responses[2].data.data ?? []);
            setCheckListType(responses[3].data.data ?? []);
            setDataType(responses[4].data.data ?? []);
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchForm = async (formId: string) => {
        if (!formId) return null;

        try {
            const response = await axios.post("Form_service.asmx/GetForm", { FormID: formId });
            return response.data?.data[0] || null;
        } catch (error) {
            errorMessage(error);
            return null;
        }
    };

    const createSubFormsAndFields = (formData: FormData) => {
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
                    Description: itemOption.Description,
                    Placeholder: itemOption.Placeholder,
                    Hint: itemOption.Hint,
                    DisplayOrder: itemOption.DisplayOrder,
                    EResult: itemOption.EResult,
                });
            });
        });

        return { subForms, fields };
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const loadForm = async () => {
            const formData = await fetchForm(formId);
            if (formData) {
                const { subForms, fields } = createSubFormsAndFields(formData);
                dispatch(setForm({ form: formData }));
                dispatch(setSubForm({ subForms }));
                dispatch(setField({ formState: fields, checkList, checkListType }));
            }
        };

        if (formId) {
            loadForm();
        }
    }, [formId, checkList, checkListType]);

    return {
        state,
        checkListOption,
        dataType,
        checkList,
        checkListType,
        groupCheckListOption,
        isLoading,
        dispatch,
        fetchData,
        errorMessage,
    };
};

export default useForm;
