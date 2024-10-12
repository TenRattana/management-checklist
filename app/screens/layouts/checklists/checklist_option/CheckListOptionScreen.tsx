import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast, useTheme } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Checklist_option_dialog from "@/components/screens/Checklist_option_dialog";
import { CheckListOption } from '@/typing/type'
import { InitialValuesCheckListOption } from '@/typing/value'
import { useFocusEffect } from "expo-router";

const CheckListOptionScreen = () => {
    const [checkListOption, setCheckListOption] = useState<CheckListOption[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesCheckListOption>({
        checkListOptionId: "",
        checkListOptionName: "",
        isActive: true,
    });
    console.log("CheckListOptionScreen");

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing } = useRes();

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await axiosInstance.post("CheckListOption_service.asmx/GetCheckListOptions");
            setCheckListOption(response.data.data ?? []);
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

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const saveData = useCallback(async (values: InitialValuesCheckListOption) => {

        const data = {
            CLOptionID: values.checkListOptionId,
            CLOptionName: values.checkListOptionName,
            isActive: values.isActive,
        };

        try {
            const response = await axiosInstance.post(
                "CheckListOption_service.asmx/SaveCheckListOption",
                data
            );
            setIsVisible(!response.data.status);
            showSuccess(String(response.data.message))

            await fetchData();
        } catch (error) {
            handleError(error)
        }
    }, [fetchData, handleError]);

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
                });
                setIsVisible(true);
                setIsEditing(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeCheckListOption" : "DeleteCheckListOption";
                const response = await axiosInstance.post(`CheckListOption_service.asmx/${endpoint}`, { CLOptionID: item });
                showSuccess(String(response.data.message));

                await fetchData()
            }
        } catch (error) {
            handleError(error)
        }
    }, [fetchData, handleError]);

    const tableData = useMemo(() => {
        return checkListOption.map(item => [
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
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Check List Option Name", align: "flex-start" },
            { label: "Change Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [6, 1, 1],
        actionIndex: [{ editIndex: 2, delIndex: 3 }],
        handleAction,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    return (
        <ScrollView style={{ paddingHorizontal: 15 }}>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold,
            { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>Create Option
            </Text>
            <Divider style={{ marginBottom: 20 }} />
            <Card style={{ borderRadius: 5 }}>
                <AccessibleView name="checklistoption" style={{ paddingVertical: 20, flexDirection: 'row' }}>
                    <Searchbar
                        placeholder="Search Checklist Option..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                    <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.textBold, masterdataStyles.textLight]}>Create Option</Text>
                    </Pressable>
                </AccessibleView>
                <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
                </Card.Content>
            </Card>


            <Checklist_option_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />
        </ScrollView>
    );
};

export default React.memo(CheckListOptionScreen);
