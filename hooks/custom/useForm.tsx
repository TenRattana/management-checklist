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
    const itemsMLL: ({ label: string; value: string } & GroupCheckListOption)[] = [];

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

    const fetchCheckListPromises = fields.map((field) => {
        const checkListPromises: Promise<any>[] = [];

        if (field.CListID) {
            checkListPromises.push(
                axiosInstance.post("CheckList_service.asmx/GetCheckList", { CListID: field.CListID })
                    .then((response) => {
                        const checkListName = response.data?.data?.[0]?.CListName || field.CListID;
                        field.CListName = checkListName;
                    }).catch((error) => {
                        console.error("Error fetching CheckList by CListID:", error);
                    })
            );
        }

        if (field.GCLOptionID) {
            checkListPromises.push(
                axiosInstance.post("GroupCheckListOption_service.asmx/SearchGroupCheckLists", { Messages: field.GCLOptionID })
                    .then((response) => {
                        const groupCheckListOptionName = response.data?.data?.[0]?.GCLOptionName || field.GCLOptionID;
                        field.GCLOptionName = groupCheckListOptionName;

                        const newItems = response.data?.data?.map((item: GroupCheckListOption) => ({
                            ...item,
                            label: item.GCLOptionName || 'Unknown',
                            value: item.GCLOptionID || '',
                        })) || [];

                        const existingValues = new Set(itemsMLL.map(item => item.value));
                        const uniqueItems = newItems.filter((item: ({ label: string; value: string } & GroupCheckListOption)) => !existingValues.has(item.value));

                        itemsMLL.push(...uniqueItems);
                    }).catch((error) => {
                        console.error("Error fetching GCLOption by GCLOptionID:", error);
                    })
            );
        }

        return checkListPromises.length > 0 ? Promise.all(checkListPromises) : Promise.resolve();
    });

    await Promise.all(fetchCheckListPromises);

    return { subForms, fields, itemsMLL };
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
                const { subForms, fields, itemsMLL } = await createSubFormsAndFields(
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
                        BaseFormState: fields,
                        checkListType: checkListType,
                        dataType: data.dataType
                    })
                );

                dispatch(
                    setGroupCheckListinForm({
                        itemsMLL: itemsMLL,
                    })
                );
            } else {
                setFound(false);
            }

        } catch (error) {
            handleError(error);
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
        }),
        [
            data.dataType,
            data.checkListType,
            data.checkList,
            data.groupCheckListOption,
            isLoading,
            exp,
            found,
        ]
    );
};

export default useForm;
