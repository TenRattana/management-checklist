import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable } from "react-native";
import axiosInstance from "@/config/axios";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes, useToast } from "@/app/contexts";
import Checklist_option_dialog from "@/components/screens/Checklist_option_dialog";
import { CheckListOption } from '@/typing/type'
import { InitialValuesCheckListOption } from '@/typing/value'
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSelector } from "react-redux";

const fetchCheckListOption = async (): Promise<CheckListOption[]> => {
    const response = await axiosInstance.post("CheckListOption_service.asmx/GetCheckListOptions");
    return response.data.data ?? [];
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

const CheckListOptionScreen = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesCheckListOption>({
        checkListOptionId: "",
        checkListOptionName: "",
        isActive: true,
        disables: false
    });

    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();

    const { data: checkListOption = [], isLoading } = useQuery<CheckListOption[], Error>(
        'checkListOption',
        fetchCheckListOption,
        {
            refetchOnWindowFocus: true,
        });

    const mutation = useMutation(saveCheckListOption, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setIsVisible(false)
            queryClient.invalidateQueries('checkListOption');
        },
        onError: handleError,
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const saveData = useCallback(async (values: InitialValuesCheckListOption) => {
        const data = {
            Prefix: state.CheckListOption ?? "",
            CLOptionID: values.checkListOptionId,
            CLOptionName: values.checkListOptionName,
            IsActive: values.isActive,
            Disables: values.disables,
        };

        mutation.mutate(data);
    }, [mutation]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post(
                    "CheckListOption_service.asmx/GetCheckListOption",
                    {
                        CLOptionID: item,
                    }
                );
                const checkListOptionData = response.data.data[0] ?? {};
                setInitialValues({
                    checkListOptionId: checkListOptionData.CLOptionID ?? "",
                    checkListOptionName: checkListOptionData.CLOptionName ?? "",
                    isActive: Boolean(checkListOptionData.IsActive),
                    disables: Boolean(checkListOptionData.Disables),
                });
                setIsVisible(true);
                setIsEditing(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeCheckListOption" : "DeleteCheckListOption";
                const response = await axiosInstance.post(`CheckListOption_service.asmx/${endpoint}`, { CLOptionID: item });
                showSuccess(String(response.data.message));
                queryClient.invalidateQueries('checkListOption');
            }
        } catch (error) {
            handleError(error)
        }
    }, [handleError, queryClient]);

    const tableData = useMemo(() => {
        return checkListOption.map(item => [
            item.Disables,
            item.CLOptionName,
            item.IsActive,
            item.CLOptionID,
        ]);
    }, [checkListOption, debouncedSearchQuery]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            checkListOptionId: "",
            checkListOptionName: "",
            isActive: true,
            disables: false
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "", align: "flex-start" },
            { label: "Check List Option Name", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [0, 6, 1, 1],
        actionIndex: [{ disables: 0, editIndex: 3, delIndex: 4 }],
        showMessage: 1,
        handleAction,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    return (
        <AccessibleView name="container-checklistoption" style={{ flex: 1 }}>
            <Card.Title
                title="Create Option"
                titleStyle={[masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small, paddingVertical: fontSize === "large" ? 7 : 5 }]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Checklist Option..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-checklist-option"
                />
                <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { textAlign: 'center' }]}>Create Option</Text>
                </Pressable>
            </AccessibleView>
            <Card.Content style={{ padding: 2, flex: 1 }}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
            </Card.Content>

            <Checklist_option_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />
        </AccessibleView>
    );
});

export default CheckListOptionScreen;
