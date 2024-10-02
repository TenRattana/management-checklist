import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/config/axios";
import axios from "axios";
import { setForm, setSubForm, setField, reset } from "@/slices";
import { useToast, useTheme, useRes } from "@/app/contexts";
import { useFocusEffect } from "@react-navigation/native";
import { TextInput } from "react-native-paper";

interface BaseForm {
    FormID: string;
    FormName: string;
    Description: string;
    MachineID: string;
}

interface BaseSubForm {
    SFormID: string;
    SFormName: string;
    FormID: string;
    Columns: number;
    DisplayOrder: number;
    MachineID: string;
}

interface SubForm extends BaseSubForm {
    MatchCheckList?: BaseFormState[];
}

interface FormData extends BaseForm {
    SubForm?: SubForm[];
}

interface BaseFormState {
    MCListID: string;
    CListID: string;
    GCLOptionID: string;
    CTypeID: string;
    DTypeID: string;
    DTypeValue?: number;
    SFormID: string;
    Required: boolean;
    MinLength?: number;
    MaxLength?: number;
    Description: string;
    Placeholder: string;
    Hint: string;
    DisplayOrder: number;
    EResult: string;
}

interface CheckListType {
    CTypeID: string;
    CTypeName: string;
    Icon: string;
}

interface checkListOption {
    CLOptionName: string
    IsActive: boolean;
    CLOptionID: string;
}

interface DataType {
    DTypeID: string;
    DTypeName: string;
    Icon: string;
}

interface Checklist {
    CListID: string;
    CListName: string;
    IsActive: boolean;
}

interface GroupCheckListOption {
    GCLOptionID: string;
    GCLOptionName: string;
    Description: string;
    IsActive: boolean;
}


export const useForm = (route: any) => {
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.form);

    const [checkList, setCheckList] = useState<Checklist[]>([]);
    const [checkListOption, setCheckListOption] = useState<checkListOption[]>([]);
    const [groupCheckListOption, setGroupCheckListOption] = useState<GroupCheckListOption[]>([]);
    const [checkListType, setCheckListType] = useState<CheckListType[]>([]);
    const [dataType, setDataType] = useState<DataType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { formId, action } = route.params || {};
    const { spacing } = useRes();
    const { showSuccess, showError } = useToast();

    const errorMessage = useCallback((error: unknown) => {
        let errorMessage: string | string[];

        if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.errors ?? ["Something went wrong!"];
        } else if (error instanceof Error) {
            errorMessage = [error.message];
        } else {
            errorMessage = ["An unknown error occurred!"];
        }

        showError(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
    }, [showError]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [
                checkListResponse,
                checkListOptionResponse,
                groupCheckListOptionResponse,
                checkListTypeResponse,
                dataTypeResponse,
            ] = await Promise.all([
                axiosInstance.post("CheckList_service.asmx/GetCheckLists"),
                axiosInstance.post("CheckListOption_service.asmx/GetCheckListOptions"),
                axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions"),
                axiosInstance.post("CheckListType_service.asmx/GetCheckListTypes"),
                axiosInstance.post("DataType_service.asmx/GetDataTypes"),
            ]);

            setCheckList(checkListResponse.data.data ?? []);
            setCheckListOption(checkListOptionResponse.data.data ?? []);
            setGroupCheckListOption(groupCheckListOptionResponse.data.data ?? []);
            setCheckListType(checkListTypeResponse.data?.data ?? []);
            setDataType(dataTypeResponse.data?.data ?? []);
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchForm = async (formId: string, action: string) => {
        if (!formId && !action) return;

        const requests = [];

        if (formId) {
            requests.push(axios.post("Form_service.asmx/GetForm", { FormID: formId }));
        }

        try {
            const responses = await Promise.all(requests);
            const formData: FormData = responses[0]?.data?.data[0] || {};

            if (action === "copy" && formData.SubForm) {
                return formData;
            }

            return formData;
        } catch (error) {
            errorMessage(error);
            return null;
        }
    };

    const createSubFormsAndFields = (formData: FormData) => {
        const subForms: SubForm[] = [];
        const fields: BaseFormState[] = [];

        const form: BaseForm = {
            FormID: formData.FormID || "",
            FormName: formData.FormName || "",
            Description: formData.Description || "",
            MachineID: formData.MachineID || "",
        };

        if (formData?.SubForm) {
            formData.SubForm.forEach((item) => {
                const subForm: SubForm = {
                    SFormID: item.SFormID || "",
                    SFormName: item.SFormName || "",
                    FormID: item.FormID || "",
                    Columns: item.Columns || -1,
                    DisplayOrder: item.DisplayOrder || -1,
                    MachineID: item.MachineID || "",
                };
                subForms.push(subForm);

                item.MatchCheckList?.forEach((itemOption) => {
                    const field: BaseFormState = {
                        MCListID: itemOption.MCListID || "",
                        CListID: itemOption.CListID || "",
                        GCLOptionID: itemOption.GCLOptionID || "",
                        CTypeID: itemOption.CTypeID || "",
                        DTypeID: itemOption.DTypeID || "",
                        DTypeValue: itemOption.DTypeValue,
                        SFormID: itemOption.SFormID || "",
                        Required: itemOption.Required || false,
                        MinLength: itemOption.MinLength,
                        MaxLength: itemOption.MaxLength,
                        Description: itemOption.Description || "",
                        Placeholder: itemOption.Placeholder || "",
                        Hint: itemOption.Hint || "",
                        DisplayOrder: itemOption.DisplayOrder || -1,
                        EResult: itemOption.EResult || "",
                    };
                    fields.push(field);
                });
            });
        }

        return { form, subForms, fields };
    };

    useFocusEffect(
        useCallback(() => {
            const fetchDataAndCreateSubForms = async () => {
                await fetchData();
                const formData = await fetchForm(formId, action);
                if (formData) {
                    const { form, subForms, fields } = createSubFormsAndFields(formData);

                    dispatch(setForm({ form }))
                    dispatch(setSubForm({ subForms, drag: false }));
                    dispatch(setField({ formState: fields, checkList, checkListType }));
                }
            };

            fetchDataAndCreateSubForms();

            return () => { };
        }, [formId, action, dispatch])
    );

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
        showSuccess
    };
};
