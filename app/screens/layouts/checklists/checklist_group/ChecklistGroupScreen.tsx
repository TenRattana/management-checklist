import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar, Text } from "@/components";
import { Card, Divider, useTheme } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Checklist_group_dialog from "@/components/screens/Checklist_group_dialog";
import { GroupCheckListOption } from '@/typing/type'
import { InitialValuesGroupCheckList } from '@/typing/value'
import { useFocusEffect } from "expo-router";

const ChecklistGroupScreen = () => {
    const [groupCheckListOption, setGroupCheckListOption] = useState<GroupCheckListOption[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesGroupCheckList>({
        groupCheckListOptionId: "",
        groupCheckListOptionName: "",
        isActive: true,
    });

    const masterdataStyles = useMasterdataStyles();

    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions");
            setGroupCheckListOption(response.data.data ?? []);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const saveData = useCallback(async (values: InitialValuesGroupCheckList) => {
        const data = {
            GCLOptionID: values.groupCheckListOptionId,
            GCLOptionName: values.groupCheckListOptionName,
            IsActive: values.isActive,
        };

        try {
            const response = await axiosInstance.post("GroupCheckListOption_service.asmx/SaveGroupCheckListOption", data);
            showSuccess(String(response.data.message));
            setIsVisible(!response.data.status);
            await fetchData()
        } catch (error) {
            handleError(error);
        }
    }, [fetchData, handleError]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post(
                    "GroupCheckListOption_service.asmx/GetGroupCheckListOption",
                    {
                        GCLOptionID: item,
                    }
                );
                const groupCheckListOptionData = response.data.data[0] ?? {};
                setInitialValues({
                    groupCheckListOptionId: groupCheckListOptionData.GCLOptionID ?? "",
                    groupCheckListOptionName: groupCheckListOptionData.GCLOptionName ?? "",
                    isActive: Boolean(groupCheckListOptionData.IsActive),
                });
                setIsVisible(true);
                setIsEditing(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeGroupCheckListOption" : "DeleteGroupCheckListOption";
                const response = await axiosInstance.post(`GroupCheckListOption_service.asmx/${endpoint}`, { GCLOptionID: item });
                showSuccess(String(response.data.message));
                await fetchData()
            }
        } catch (error) {
            handleError(error);
        }
    }, [fetchData, handleError]);

    const tableData = useMemo(() => {
        return groupCheckListOption.map((item) => [
            item.GCLOptionName,
            item.IsActive,
            item.GCLOptionID,
        ]);
    }, [groupCheckListOption, debouncedSearchQuery]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            groupCheckListOptionId: "",
            groupCheckListOptionName: "",
            isActive: true,
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Group Option Name", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "center" },
        ],
        flexArr: [6, 1, 1],
        actionIndex: [{ editIndex: 2, delIndex: 3 }],
        handleAction,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    return (
        <AccessibleView name="container-groupchecklist" style={{ flex: 1 }}>
            <Card.Title
                title="Create Group Option"
                titleStyle={[masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small, paddingVertical: fontSize === "large" ? 7 : 5 }]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Group CheckList..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-groupchecklist"
                />
                <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { textAlign: 'center' }]}>Create Group Option</Text>
                </Pressable>
            </AccessibleView>
            <Card.Content style={{ padding: 2, flex: 1 }}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
            </Card.Content>

            <Checklist_group_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />
        </AccessibleView>
    );
};

export default React.memo(ChecklistGroupScreen);
