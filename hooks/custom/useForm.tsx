import { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "@/config/axios";
import { setFormData, reset, setGroupCheckListinForm } from "@/slices";
import { useToast } from "@/app/contexts/useToast";
import { useFocusEffect } from "@react-navigation/native";
import { BaseFormState, FormData, SubForm } from "@/typing/form";
import { CheckList, Checklist, CheckListType, DataType, GroupCheckListOption } from "@/typing/type";

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
    checkListType: CheckListType[],
    groupCheckListOption: GroupCheckListOption[];
    dataType: DataType[];
}

const createSubFormsAndFields = async (
    formData: FormData,
    expectedResult: Record<string, any> = {},
) => {
    const subForms: SubForm[] = [];
    const fields: BaseFormState[] = [];
    const itemsCheckList: ({ label: string; value: string } & Checklist)[] = [];
    const itemsGroupCheckListOption: ({ label: string; value: string } & GroupCheckListOption)[] = [];

    formData.SubForm?.forEach((subFormItem) => {
        const subForm: SubForm = {
            SFormID: subFormItem.SFormID,
            SFormName: subFormItem.SFormName,
            FormID: subFormItem.FormID,
            Columns: subFormItem.Columns,
            Number: Boolean(subFormItem.Number ?? false),
            DisplayOrder: subFormItem.DisplayOrder,
            MachineID: subFormItem.MachineID,
            Fields: []
        };
        subForms.push(subForm);

        subFormItem.MatchCheckList?.forEach((itemOption) => {
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
                Required: Boolean(itemOption.Required),
                Important: Boolean(itemOption.Important ?? false),
                Rowcolumn: itemOption.Rowcolumn ?? 1,
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
                EResult: expectedResult[itemOption.MCListID] || "",
            });
        });
    });

    const checkListIdAll = fields.map(((v) => v.CListID)) ?? []
    const groupCheckListOptionIdAll = fields.filter((v) => v.GCLOptionID !== null).map((v) => v.GCLOptionID) ?? [];

    const DataInfo: Promise<any>[] = [];

    DataInfo.push(axiosInstance.post("CheckList_service.asmx/GetCheckListInForm", { CListIDS: JSON.stringify(checkListIdAll) }));
    DataInfo.push(axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptionInForm", { GCLOptionIDS: JSON.stringify(groupCheckListOptionIdAll) }));

    if (DataInfo.length > 0) {
        try {
            const results = await Promise.all(DataInfo);
            const newItems = results[0]?.data?.data?.map((item: Checklist) => ({
                ...item,
                label: item.CListName || 'Unknown',
                value: item.CListID || '',
            })) || [];

            const existingValues = new Set(itemsCheckList.map(item => item.value));
            const uniqueItems = newItems.filter((item: { label: string, value: string } & Checklist) => !existingValues.has(item.value));
            itemsCheckList.push(...uniqueItems);

            const newItemsM = results[1]?.data?.data?.map((item: GroupCheckListOption) => ({
                ...item,
                label: item.GCLOptionName || 'Unknown',
                value: item.GCLOptionID || '',
            })) || [];

            const existingValuesM = new Set(itemsGroupCheckListOption.map(item => item.value));
            const uniqueItemsM = newItemsM.filter((item: { label: string, value: string } & GroupCheckListOption) => !existingValuesM.has(item.value));
            itemsGroupCheckListOption.push(...uniqueItemsM);

        } catch (error) {
            console.error("Error occurred while fetching data:", error);
        }
    }

    return { subForms, fields, itemsCheckList, itemsGroupCheckListOption };
};

const useForm = (route?: RouteParams) => {
    const dispatch = useDispatch();
    const [data, setData] = useState<FormDataState>({
        checkList: [],
        groupCheckListOption: [],
        checkListType: [],
        dataType: [],
    });
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(false);
    const [exp, setExp] = useState(false);
    const [found, setFound] = useState(false);

    const { formId, action, machineId, tableId } = route?.params || {};
    const { handleError } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const responses = await Promise.all([
                axiosInstance.post("CheckList_service.asmx/SearchCheckLists", { Messages: "Empty Content" }),
                axiosInstance.post("GroupCheckListOption_service.asmx/SearchGroupCheckLists", { Messages: "Empty Content Group" }),
                axiosInstance.post("CheckListType_service.asmx/GetCheckListTypes"),
                axiosInstance.post("DataType_service.asmx/GetDataTypes"),
            ]);

            setData({
                checkList: responses[0].data?.data || [],
                groupCheckListOption: responses[1].data?.data || [],
                checkListType: responses[2].data?.data || [],
                dataType: responses[3].data?.data || [],
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
        setIsLoadingForm(true)
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
                setExp(true);
            }

            if (response.data?.data?.[0]) {
                const { subForms, fields, itemsCheckList, itemsGroupCheckListOption } = await createSubFormsAndFields(
                    response.data?.data?.[0],
                    fetchedExpectedResult,
                );

                const checkListType = data.checkListType
                    .filter(group => group.CheckList !== null)
                    .flatMap(group => group.CheckList)
                    .filter((checkList): checkList is CheckList => checkList !== undefined);

                dispatch(
                    setFormData({
                        form: action === "copy" ? {} : response.data?.data[0],
                        subForms,
                        checkList: itemsCheckList,
                        groupCheckListOption: itemsGroupCheckListOption,
                        BaseFormState: fields,
                        checkListType: checkListType,
                        dataType: data.dataType,
                        mode
                    })
                );

                dispatch(
                    setGroupCheckListinForm({
                        itemsMLL: itemsGroupCheckListOption,
                        itemCLL: itemsCheckList
                    })
                );
                setFound(true)
            } else {
                setFound(false);
            }

        } catch (error) {
            handleError(error);
        } finally {
            setIsLoadingForm(false);
        }
    }, [dataLoaded, data.checkListType, data.dataType, handleError, dispatch]);

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

    return useMemo(
        () => ({
            dataType: data.dataType,
            checkListType: data.checkListType,
            isLoading,
            exp,
            found,
            checkList: data.checkList,
            groupCheckListOption: data.groupCheckListOption,
            isLoadingForm
        }),
        [
            data.dataType,
            data.checkListType,
            data.checkList,
            data.groupCheckListOption,
            isLoading,
            exp,
            found,
            isLoadingForm
        ]
    );
};

export default useForm;
