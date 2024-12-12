import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts/useToast";
import { useFocusEffect } from "@react-navigation/native";
import { Checklist, GroupCheckListOption } from "@/typing/type";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { InitialValuesChecklist, InitialValuesGroupCheckList } from "@/typing/value";

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

const useField = () => {
    const { handleError, showSuccess } = useToast();
    const state = useSelector((state: any) => state.prefix);
    const queryClient = useQueryClient();

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
        groupCheckListOption: groupCheckListOption
    };
};

export default useField;
