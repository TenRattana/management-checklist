import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { TouchableOpacity, StyleSheet, View, Platform } from "react-native";
import axiosInstance from "@/config/axios";
import { LoadingSpinner, LoadingSpinnerTable, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useToast } from '@/app/contexts/useToast';
import { useRes } from '@/app/contexts/useRes';
import { useMutation, useQueryClient, useInfiniteQuery } from 'react-query';
import { useSelector } from "react-redux";
import { fetchCheckList, fetchSearchCheckList, saveCheckList } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { useFocusEffect } from "expo-router";
import { CheckList, InitialValuesChecklist } from "@/typing/screens/CheckList";

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
    const { spacing, fontSize, responsive } = useRes();
    const { theme, darkMode } = useTheme();
    const queryClient = useQueryClient();
    const [checkList, setCheckList] = useState<CheckList[]>([])

    const { isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['checkList', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchCheckList(debouncedSearchQuery)
                : fetchCheckList(pageParam, 1000);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 1000 ? allPages.length : undefined;
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
        }, [remove])
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
            backgroundColor: theme.colors.background,
            padding: 10,
            paddingHorizontal: 20
        },
        header: {
            fontSize: spacing.large,
            paddingVertical: fontSize === "large" ? 7 : 5,
            fontWeight: 'bold',
            color: theme.colors.onBackground
        },
        functionname: {
            textAlign: 'center'
        },
        cardcontent: {
            marginTop: 10,
            paddingVertical: 10,
            paddingHorizontal: 0,
            flex: 1,
            borderRadius: 10,
            backgroundColor: theme.colors.background,
            ...Platform.select({
                ios: {
                    shadowColor: theme.colors.onBackground,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                },
                android: {
                    elevation: 6,
                },
                web: {
                    boxShadow: `2px 5px 10px ${!darkMode ? 'rgba(0, 0, 0, 0.24)' : 'rgba(193, 214, 255, 0.56)'}`,
                },
            }),
        },
        containerSearch: {
            paddingHorizontal: 20,
            paddingVertical: 5,
            flexDirection: responsive === "small" ? "column" : 'row',
        },
        contentSearch: {
            flexDirection: responsive === "small" ? "column" : 'row',
        },
        containerTable: {
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center'
        }
    });

    return (
        <View id="container-checklist" style={styles.container}>
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Text style={[masterdataStyles.textBold, styles.header]}>{`List ${state.CheckList}` || "List"}</Text>
            </View>

            <Card.Content style={styles.cardcontent}>
                <View style={styles.containerSearch}>
                    <View style={styles.contentSearch}>
                        <Searchbar
                            placeholder={`Search ${state.CheckList}...`}
                            value={searchQuery}
                            onChange={setSearchQuery}
                            testId="search-checklist"
                        />
                    </View>

                    <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>{`Create ${state.CheckList}`}</Text>
                    </TouchableOpacity>
                </View>

                <Suspense fallback={<LoadingSpinnerTable />}>
                    <LazyCustomtable {...customtableProps} handlePaginationChange={handlePaginationChange} />
                </Suspense>
            </Card.Content>

            {isVisible && (
                <View style={styles.containerTable}>
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
