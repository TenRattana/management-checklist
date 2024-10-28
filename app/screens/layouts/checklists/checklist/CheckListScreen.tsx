import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, SafeAreaView, View } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast, useTheme } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar, Text } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Checklist_dialog from "@/components/screens/Checklist_dialog";
import { Checklist } from '@/typing/type';
import { InitialValuesChecklist } from '@/typing/value';
import { useFocusEffect } from "expo-router";

const CheckListScreen = () => {
    const [checkList, setCheckList] = useState<Checklist[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesChecklist>({
        checkListId: "",
        checkListName: "",
        isActive: true,
    });

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post("CheckList_service.asmx/GetCheckLists");
            setCheckList(response.data.data ?? []);
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

    const saveData = useCallback(async (values: InitialValuesChecklist) => {
        const data = {
            CListId: values.checkListId ?? "",
            CListName: values.checkListName,
            isActive: values.isActive,
        };

        try {
            const response = await axiosInstance.post("CheckList_service.asmx/SaveCheckList", data);
            showSuccess(String(response.data.message));
            setIsVisible(!response.data.status);
            await fetchData();
        } catch (error) {
            handleError(error);
        }
    }, [fetchData, handleError]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post("CheckList_service.asmx/GetCheckList", { CListID: item });
                const checkListData = response.data.data[0] ?? {};
                setInitialValues({
                    checkListId: checkListData.CListID ?? "",
                    checkListName: checkListData.CListName ?? "",
                    isActive: Boolean(checkListData.IsActive),
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeCheckList" : "DeleteCheckList";
                const response = await axiosInstance.post(`CheckList_service.asmx/${endpoint}`, { CListID: item });
                showSuccess(String(response.data.message));
                await fetchData();
            }
        } catch (error) {
            handleError(error);
        }
    }, [fetchData, handleError]);

    const tableData = useMemo(() => {
        return checkList.map(item => [
            item.CListName,
            item.IsActive,
            item.CListID,
        ]);
    }, [checkList]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            checkListId: "",
            checkListName: "",
            isActive: true,
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Check List Name", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [6, 1, 1],
        actionIndex: [{ editIndex: 2, delIndex: 3 }],
        handleAction,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    return (
        <AccessibleView name="container-checklist" style={{ flex: 1 }}>
            <Card.Title
                title="Create Check List"
                titleStyle={[masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small, paddingVertical: fontSize === "large" ? 7 : 5 }]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Checklist..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-checklist"
                />
                <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { textAlign: 'center' }]}>Create Check List</Text>
                </Pressable>
            </AccessibleView>
            <Card.Content style={{ padding: 2, flex: 1 }}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
            </Card.Content>

            <Checklist_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />
        </AccessibleView>
    );
};

export default React.memo(CheckListScreen);
