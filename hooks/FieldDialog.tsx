import { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts/useToast";
import { useFocusEffect } from "@react-navigation/native";
import { CheckList, Checklist, CheckListType, DataType, GroupCheckListOption } from "@/typing/type";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { InitialValuesChecklist, InitialValuesGroupCheckList } from "@/typing/value";
import * as Yup from 'yup'

const saveCheckList = async (data: {
    Prefix: any;
    CListID: string;
    CListName: string;
    IsActive: boolean;
    Disables: boolean;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("CheckList_service.asmx/SaveCheckList", data);
    return response.data;
};

const saveCheckListOption = async (data: {
    Prefix: any;
    CLOptionID: string;
    CLOptionName: string;
    IsActive: boolean;
    Disables: boolean;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("CheckListOption_service.asmx/SaveCheckListOption", data);
    return response.data;
};

const saveGroupCheckListOption = async (data: {
    Prefix: any;
    PrefixMatch: any,
    GCLOptionID: string;
    GCLOptionName: string;
    IsActive: boolean;
    Disables: boolean;
    Options: string
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("GroupCheckListOption_service.asmx/SaveGroupCheckListAndOptionMatch", data);
    return response.data;
};

const fetchCheckList = async (): Promise<Checklist[]> => {
    const response = await axiosInstance.post("CheckList_service.asmx/GetCheckLists");
    return response.data.data ?? [];
};

const fetchGroupCheckList = async (): Promise<GroupCheckListOption[]> => {
    const response = await axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions");
    return response.data.data ?? [];
};

const useField = (checkListType?: CheckList[], dataType?: DataType[]) => {
    const { handleError, showSuccess } = useToast();
    const state = useSelector((state: any) => state.prefix);
    const queryClient = useQueryClient();

    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            CListID: Yup.string().required("The checklist field is required."),
            CTypeID: Yup.string().required("The checklist type field is required."),
            Required: Yup.boolean().required("The required field is required."),
            Important: Yup.boolean().required("The important field is required."),
            DTypeID: Yup.lazy((value, context) => {
                const CTypeID = checkListType?.find(v => v.CTypeID === context.parent.CTypeID)?.CTypeName;
                if (CTypeID && ['Textinput'].includes(CTypeID)) {
                    return Yup.string().required("Data Type is required for Text.");
                }
                return Yup.string().nullable();
            }),
            DTypeValue: Yup.lazy((value, context) => {
                const DTypeID = dataType?.find(v => v.DTypeID === context.context.DTypeID)?.DTypeName;
                if (DTypeID === "Number") {
                    return Yup.number().typeError("The digit value must be a number.").nullable();
                }
                return Yup.string().nullable();
            }),
            Rowcolumn: Yup.number().typeError("The row column must be a number.").nullable(),
            GCLOptionID: Yup.lazy((value, context) => {
                const CTypeID = checkListType?.find((v) => v.CTypeID === context.context.CTypeID)?.CTypeName;
                if (CTypeID && ['Dropdown', 'Checkbox', 'Radio'].includes(CTypeID)) {
                    return Yup.string().required("GCLOptionID is required for Dropdown/Select/Radio.");
                }
                return Yup.string().nullable();
            }),
            ImportantList: Yup.array().of(
                Yup.object().shape({
                    Value: Yup.lazy((value, context) => {
                        const isImportant = context.context?.Important || false;
                        const hasGCLOptionID = context.context?.GCLOptionID;

                        if (isImportant && hasGCLOptionID) {
                            if (Array.isArray(value)) {
                                return Yup.array()
                                    .of(Yup.string().required("Each selected option is required."))
                                    .min(1, "You must select at least one option.")
                                    .required("Important value is required when marked as important.");
                            } else {
                                return Yup.string()
                                    .required("Important value is required when marked as important.")
                                    .nullable();
                            }
                        }
                        return Yup.mixed().nullable();
                    }),
                    MinLength: Yup.lazy((value, context) => {
                        const DTypeID = dataType?.find(v => v.DTypeID === context.context?.DTypeID)?.DTypeName;
                        const max = context.parent.MaxLength;
                        const isImportant = context.context?.Important;

                        if (DTypeID === "Number" && isImportant) {
                            if (!max && !value) {
                                return Yup.number()
                                    .typeError("The min value control must be a number.")
                                    .required("The min value control is required.");
                            } else if (max) {
                                return Yup.number()
                                    .typeError("The max value control must be a number.")
                                    .max(max, 'Min length must be less than or equal to Max length');
                            }
                        }

                        return Yup.number()
                            .typeError("The min value control must be a number.")
                            .nullable();
                    }),
                    MaxLength: Yup.lazy((value, context) => {
                        const DTypeID = dataType?.find(v => v.DTypeID === context.context?.DTypeID)?.DTypeName;
                        const min = context.parent.MinLength;
                        const isImportant = context.context?.Important;

                        if (DTypeID === "Number" && isImportant) {
                            if (!min && !value) {
                                return Yup.number()
                                    .typeError("The max value control must be a number.")
                                    .min(min + 1, 'Max length must be greater than or equal to Min length')
                                    .required("The max value control is required.");
                            } else if (min) {
                                return Yup.number()
                                    .typeError("The max value control must be a number.")
                                    .min(min, 'Max length must be greater than or equal to Min length');
                            }
                        }

                        return Yup.number()
                            .typeError("The max value control must be a number.")
                            .nullable();
                    }),
                })
            )
        });
    }, [checkListType, dataType]);

    const { data: checkList = [] } = useQuery<Checklist[], Error>(
        'checkList',
        fetchCheckList,
        {
            refetchOnWindowFocus: false,
            enabled: true,
            keepPreviousData: true,
            staleTime: 1000 * 60 * 5,
            cacheTime: 1000 * 60 * 10,
        }
    );

    const { data: groupCheckListOption = [] } = useQuery<GroupCheckListOption[], Error>(
        'groupCheckListOption',
        fetchGroupCheckList,
        {
            refetchOnWindowFocus: false,
            enabled: true,
            keepPreviousData: true,
            staleTime: 1000 * 60 * 60,
            cacheTime: 1000 * 60 * 80,
        }
    );
    useFocusEffect(
        useCallback(() => {
            return (() => {
                setInfo({ GroupCheckList: false })
                setDialogAdd({ CheckList: false, GroupCheckList: false, CheckListOption: false })
                setInitialCheckList({ checkListId: "", checkListName: "", isActive: true, disables: false });
                setInitialGroupCheckList({ groupCheckListOptionId: "", groupCheckListOptionName: "", isActive: true, disables: false });
            })
        }, [])
    )

    const [dialogAdd, setDialogAdd] = useState<{ CheckList: boolean, GroupCheckList: boolean, CheckListOption: boolean }>({ CheckList: false, GroupCheckList: false, CheckListOption: false });
    const [info, setInfo] = useState<{ GroupCheckList: boolean }>({ GroupCheckList: false })

    const [initialCheckList, setInitialCheckList] = useState<InitialValuesChecklist>({
        checkListId: "",
        checkListName: "",
        isActive: true,
        disables: false
    });

    const [initialGroupCheckList, setInitialGroupCheckList] = useState<InitialValuesGroupCheckList>({
        groupCheckListOptionId: "",
        groupCheckListOptionName: "",
        isActive: true,
        disables: false
    });

    const handelInfo = useCallback((v: boolean, field: string) => {
        setInfo((prev) => ({ ...prev, [field]: v }))
    }, [])

    const handelAdd = useCallback((v: boolean, field: string) => {
        setDialogAdd((prev) => ({ ...prev, [field]: v }))
    }, [])

    const mutation = useMutation(saveCheckList, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setDialogAdd((prev) => ({ ...prev, CheckList: false }))
            queryClient.invalidateQueries('checkList');
        },
        onError: handleError,
    });

    const mutationG = useMutation(saveGroupCheckListOption, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setDialogAdd((prev) => ({ ...prev, GroupCheckList: false }))
            queryClient.invalidateQueries('groupCheckListOption');
        },
        onError: handleError,
    });

    const mutationCL = useMutation(saveCheckListOption, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setDialogAdd((prev) => ({ ...prev, CheckListOption: false }))
            queryClient.invalidateQueries('checkListOption');
        },
        onError: handleError,
    });

    const saveDataCheckList = useCallback(async (values: InitialValuesChecklist) => {
        const data = {
            Prefix: state.CheckList ?? "",
            CListID: "",
            CListName: values.checkListName,
            IsActive: values.isActive,
            Disables: values.disables
        };

        mutation.mutate(data);
    }, [mutation]);

    const saveDataGroupCheckList = useCallback(async (values: InitialValuesGroupCheckList, options: string[]) => {

        const data = {
            Prefix: state.GroupCheckList ?? "",
            PrefixMatch: state.MatchCheckListOption ?? "",
            GCLOptionID: values.groupCheckListOptionId,
            GCLOptionName: values.groupCheckListOptionName,
            IsActive: values.isActive,
            Disables: values.disables,
            Options: JSON.stringify(options)
        };

        mutationG.mutate(data);
    }, [mutationG]);

    return {
        dialogAdd,
        saveCheckList,
        saveCheckListOption,
        saveDataCheckList,
        saveDataGroupCheckList,
        saveGroupCheckListOption,
        initialCheckList,
        initialGroupCheckList,
        info,
        handelInfo,
        handelAdd,
        checkList: checkList.filter(v => v.IsActive),
        groupCheckListOption: groupCheckListOption,
        validationSchema
    };
};

export default useField;
