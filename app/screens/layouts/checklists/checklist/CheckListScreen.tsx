import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import axiosInstance from "@/config/axios";
import { LoadingSpinner, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useToast } from '@/app/contexts/useToast';
import { useRes } from '@/app/contexts/useRes';
import { Checklist } from '@/typing/type';
import { InitialValuesChecklist } from '@/typing/value';
import { useMutation, useQueryClient, useInfiniteQuery } from 'react-query';
import { useSelector } from "react-redux";
import { fetchCheckList, fetchSearchCheckList, saveCheckList } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { useFocusEffect } from "expo-router";

const LazyChecklist_dialog = lazy(() => import("@/components/screens/Checklist_dialog"));
const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

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
    const { theme } = useTheme();
    const queryClient = useQueryClient();
    const [checkList, setCheckList] = useState<Checklist[]>([])

    const { data, isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['checkList', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchCheckList(debouncedSearchQuery)
                : fetchCheckList(pageParam, 50);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 50 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat()
                setCheckList(newItems);
            },
        }
    );

    useFocusEffect(
        useCallback(() => {
            return () => {
                remove()
                setCheckList([])
            };
        }, [])
    );

    const handlePaginationChange = useCallback(() => {
        if (hasNextPage && !isFetching) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetching, fetchNextPage]);

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
            Prefix: state.PF_CheckList ?? "",
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
            { label: state.CheckList, align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [0, 6, 1, 1],
        actionIndex: [{ disables: 0, editIndex: 3, delIndex: 4 }],
        handleAction,
        showMessage: 1,
        searchQuery: debouncedSearchQuery,
        isFetching: isFetching
    }), [tableData, debouncedSearchQuery, handleAction, state.CheckList, isFetching]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background
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
    });

    return (
        <View id="container-checklist" style={styles.container}>
            <Card.Title
                title={`List ${state.CheckList}` || "List"}
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder={`Search ${state.CheckList}...`}
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-checklist"
                />
                <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>{`Create ${state.CheckList}`}</Text>
                </TouchableOpacity>
            </View>
            <Card.Content style={styles.cardcontent}>
                <Suspense fallback={<LoadingSpinner />}>
                    <LazyCustomtable {...customtableProps} handlePaginationChange={handlePaginationChange} />
                </Suspense>
            </Card.Content>

            {isVisible && (
                <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                    <Suspense fallback={<LoadingSpinner />}>
                        <LazyChecklist_dialog
                            isVisible={isVisible}
                            setIsVisible={setIsVisible}
                            isEditing={isEditing}
                            initialValues={initialValues}
                            saveData={saveData}
                        />
                    </Suspense>
                </View>
            )}
        </View>
    );
});

export default CheckListScreen;
