import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/config/axios";
import axios from "axios";
import { setForm, setSubForm, setField, reset } from "@/slices";
import { useToast, useRes } from "@/app/contexts";
import { useFocusEffect } from "@react-navigation/native";
import { SubForm, FormData, BaseFormState, BaseForm } from '@/typing/form'
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
    const [dataLoading, setDataLoding] = useState(false);
    const { formId, action } = route.params || {};
    const { handleError } = useToast();

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
            setDataLoding(true)
        } catch (error) {
            handleError(error);
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
            handleError(error);
            return null;
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
            return () => { dispatch(reset()) };
        }, [])
    );

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
            const loadForm = async () => {
                if (formId && dataLoading) {
                    const formData = await fetchForm(formId);
                    const { subForms, fields } = createSubFormsAndFields(formData);
                    const formCopy: BaseForm = {
                        FormID: "",
                        Description: "",
                        FormName: "",
                        MachineID: "",
                    }
                    dispatch(setForm({ form: action === "copy" ? formCopy : formData }));
                    dispatch(setSubForm({ subForms }));
                    dispatch(setField({ BaseFormState: fields, checkList, checkListType }));
                }
            };
            loadForm();
            return () => { };
        }, [formId, dataLoading, action])
    );


    return {
        state,
        checkListOption,
        setCheckListOption,
        dataType,
        setDataType,
        checkList,
        setCheckList,
        checkListType,
        setCheckListType,
        groupCheckListOption,
        setGroupCheckListOption,
        isLoading,
        dispatch,
        fetchData,
    };
};

export default useForm;
