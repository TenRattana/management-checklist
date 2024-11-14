import React, { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "@/config/axios";
import { setFormData, reset } from "@/slices";
import { useToast } from "@/app/contexts";
import { useFocusEffect } from "@react-navigation/native";
import { BaseFormState, FormData, SubForm } from "@/typing/form";
import { Checklist, CheckListOption, CheckListType, DataType, GroupCheckListOption, Machine } from "@/typing/type";

interface RouteParams {
    params?: {
        formId?: string;
        action?: string;
        tableId?: string;
        machineId?: string;
    };
}
interface FormDataState {
    checkList: Checklist[];
    checkListOption: CheckListOption[],
    checkListType: CheckListType[];
    dataType: DataType[];
    groupCheckListOption: GroupCheckListOption[];
    groupCheckListOptionActive: GroupCheckListOption[];
    machine: Machine[];
}

const createSubFormsAndFields = (
    formData: FormData,
    expectedResult: Record<string, any> = {}
) => {

    const subForms: SubForm[] = [];
    const fields: BaseFormState[] = [];

    formData.SubForm?.forEach((subFormItem) => {
        const subForm: SubForm = {
            SFormID: subFormItem.SFormID,
            SFormName: subFormItem.SFormName,
            FormID: subFormItem.FormID,
            Columns: subFormItem.Columns,
            DisplayOrder: subFormItem.DisplayOrder,
            MachineID: subFormItem.MachineID,
            Fields: []
        };
        subForms.push(subForm);

        subFormItem.MatchCheckList?.forEach((itemOption) => {
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
                ImportantList: itemOption.ImportantList ?? [],
                Placeholder: itemOption.Placeholder,
                Hint: itemOption.Hint,
                DisplayOrder: itemOption.DisplayOrder,
                EResult: expectedResult[itemOption.MCListID] || "",
            });
        });
    });

    return { subForms, fields };
};

const useForm = (route: RouteParams) => {
    const dispatch = useDispatch();
    const [data, setData] = useState<FormDataState>({
        checkList: [],
        checkListOption: [],
        checkListType: [],
        dataType: [],
        groupCheckListOption: [],
        groupCheckListOptionActive: [],
        machine: []
    });
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { formId, action, machineId, tableId } = route.params || {};
    const { handleError } = useToast();

    const fetchData = useCallback(async () => {
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

            setData({
                checkList: responses[0].data?.data || [],
                checkListOption: responses[1].data?.data || [],
                groupCheckListOption: responses[2].data?.data || [],
                groupCheckListOptionActive: responses[3].data?.data || [],
                checkListType: responses[4].data?.data || [],
                dataType: responses[5].data?.data || [],
                machine: responses[6].data?.data || []
            });

            setDataLoaded(true);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    const fetchForm = useCallback(async (formId: string, mode: boolean = false, action?: string, tableId?: string) => {
        if (!dataLoaded) return;
        try {
            const endpoint = mode ? "Form_service.asmx/ScanForm" : "Form_service.asmx/GetForm";
            const response = await axiosInstance.post(endpoint, { [mode ? "MachineID" : "FormID"]: formId });

            let fetchedExpectedResult = [];
            if (tableId) {
                const expectedResultResponse = await axiosInstance.post(
                    "ExpectedResult_service.asmx/GetExpectedResult",
                    { TableID: tableId }
                );
                fetchedExpectedResult = expectedResultResponse.data?.data[0] || [];
            }

            const { subForms, fields } = createSubFormsAndFields(
                response.data?.data[0],
                fetchedExpectedResult
            );

            dispatch(
                setFormData({
                    form: action === "copy" ? {} : response.data?.data[0],
                    subForms,
                    BaseFormState: fields,
                    checkList: data.checkList,
                    checkListType: data.checkListType
                })
            );
        } catch (error) {
            handleError(error);
        }
    },
        [dataLoaded, data.checkList, data.checkListType, handleError, dispatch]
    );

    useFocusEffect(
        useCallback(() => {
            fetchData();
            return () => {
                dispatch(reset());
            };
        }, [fetchData, dispatch])
    );

    useEffect(() => {
        if (dataLoaded) {
            if (formId) fetchForm(formId, false, action, tableId);
            if (machineId) fetchForm(machineId, true, action, tableId);
        }
    }, [dataLoaded, formId, machineId, action, tableId, fetchForm]);

    return {
        checkListOption: data.checkListOption,
        dataType: data.dataType,
        checkList: data.checkList,
        checkListType: data.checkListType,
        groupCheckListOption: tableId || machineId ? data.groupCheckListOption : data.groupCheckListOptionActive,
        machine: data.machine,
        isLoading
    };
};

export default useForm;
