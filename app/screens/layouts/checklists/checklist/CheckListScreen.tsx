import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import axiosInstance from "@/config/axios";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useToast } from '@/app/contexts/useToast';
import { useRes } from '@/app/contexts/useRes';
import Checklist_dialog from "@/components/screens/Checklist_dialog";
import { Checklist } from '@/typing/type';
import { InitialValuesChecklist } from '@/typing/value';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSelector } from "react-redux";

const fetchCheckList = async (): Promise<Checklist[]> => {
    const response = await axiosInstance.post("CheckList_service.asmx/GetCheckLists");
    return response.data.data ?? [];
};

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

const CheckListScreen = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesChecklist>({
        checkListId: "",
        checkListName: "",
        isActive: true,
        disables: false
    });

    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();

    const { data: checkList = [], isLoading } = useQuery<Checklist[], Error>(
        'checkList',
        fetchCheckList,
        {
            refetchOnWindowFocus: true,
        }
    );

    const mutation = useMutation(saveCheckList, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setIsVisible(false)
            queryClient.invalidateQueries('checkList');
        },
        onError: handleError,
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const saveData = useCallback(async (values: InitialValuesChecklist) => {
        const data = {
            Prefix: state.CheckList ?? "",
            CListID: values.checkListId ?? "",
            CListName: values.checkListName,
            IsActive: values.isActive,
            Disables: values.disables
        };

        mutation.mutate(data);
    }, [mutation]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post("CheckList_service.asmx/GetCheckList", { CListID: item });
                const checkListData = response.data.data[0] ?? {};
                setInitialValues({
                    checkListId: checkListData.CListID ?? "",
                    checkListName: checkListData.CListName ?? "",
                    isActive: Boolean(checkListData.IsActive),
                    disables: Boolean(checkListData.Disables),
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeCheckList" : "DeleteCheckList";
                const response = await axiosInstance.post(`CheckList_service.asmx/${endpoint}`, { CListID: item });
                showSuccess(String(response.data.message));
                queryClient.invalidateQueries('checkList');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient]);

    const tableData = useMemo(() => {
        return checkList.map(item => [
            item.Disables,
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
            disables: false
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "", align: "flex-start" },
            { label: "Check List Name", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [0, 6, 1, 1],
        actionIndex: [{ disables: 0, editIndex: 3, delIndex: 4 }],
        handleAction,
        showMessage: 1,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    const styles = StyleSheet.create({
        container: {
            flex: 1
        },
        header: {
            fontSize: spacing.large,
            marginTop: spacing.small,
            paddingVertical: fontSize === "large" ? 7 : 5
        },
        functionname: {
            textAlign: 'center'
        },
        cardcontent: {
            padding: 2,
            flex: 1
        }
    })

    return (
        <AccessibleView name="container-checklist" style={styles.container}>
            <Card.Title
                title="Create Check List"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Checklist..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-checklist"
                />
                <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>Create Check List</Text>
                </Pressable>
            </AccessibleView>
            <Card.Content style={styles.cardcontent}>
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
});

export default CheckListScreen;
