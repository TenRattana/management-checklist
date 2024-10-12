import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast, useTheme } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar } from "@/components";
import { Card, Divider } from "react-native-paper";
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
        description: "",
        isActive: true,
    });
    console.log("ChecklistGroupScreen");

    const masterdataStyles = useMasterdataStyles();

    const { showSuccess, handleError } = useToast();
    const { spacing } = useRes();

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
            Description: values.description,
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
                    description: groupCheckListOptionData.Description ?? "",
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
            item.Description,
            item.IsActive,
            item.GCLOptionID,
        ]);
    }, [groupCheckListOption, debouncedSearchQuery]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            groupCheckListOptionId: "",
            groupCheckListOptionName: "",
            description: "",
            isActive: true,
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Group Option Name", align: "flex-start" },
            { label: "Description", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "center" },
        ],
        flexArr: [3, 3, 1, 1],
        actionIndex: [{ editIndex: 3, delIndex: 4 }],
        handleAction,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    return (
        <ScrollView style={{ paddingHorizontal: 15 }}>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold,
            { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>Create Group Option
            </Text>
            <Divider style={{ marginBottom: 20 }} />
            <Card style={{ borderRadius: 5 }}>
                <AccessibleView name="checklistgroup" style={{ paddingVertical: 20, flexDirection: 'row' }}>
                    <Searchbar
                        placeholder="Search Machine..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                    <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.textBold, masterdataStyles.textLight]}>Create Group Option</Text>
                    </Pressable>
                </AccessibleView>
                <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
                </Card.Content>
            </Card>

            <Checklist_group_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />
        </ScrollView>
    );
};

export default React.memo(ChecklistGroupScreen);
