import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useToast } from '@/app/contexts/useToast';
import { useRes } from '@/app/contexts/useRes';
import { LoadingSpinner, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { Platform, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { fetchApproved, fetchMachines, fetchSearchApproved, fetchSearchMachines, SaveApproved } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { navigate } from "@/app/navigations/navigationUtils";
import { useFocusEffect } from "expo-router";
import { ExpectedResult } from "@/typing/screens/ExpectedResult";

const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

const ApprovedScreen = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [debouncedSearchQueryFilter, setDebouncedSearchQueryFilter] = useState<string>("");
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize, responsive } = useRes();
    const { theme } = useTheme();
    const queryClient = useQueryClient();
    const [approved, setApproved] = useState<ExpectedResult[]>([])

    const { data, isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['approved', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchApproved(debouncedSearchQuery)
                : fetchApproved(pageParam, 50);
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
                setApproved(newItems);
            },
        }
    );

    const [machines, setMachine] = useState<{ label: string, value: string | null }[]>([{ label: "Show all", value: "" }]);

    const { data: machine, isFetching: isFetchingMG, fetchNextPage: fetchNextPageMG, hasNextPage: hasNextPageMG } = useInfiniteQuery(
        ['machine', debouncedSearchQueryFilter],
        ({ pageParam = 0 }) => {
            return debouncedSearchQueryFilter
                ? fetchSearchMachines(debouncedSearchQueryFilter)
                : fetchMachines(pageParam, 50);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            enabled: true,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 50 ? allPages.length : undefined;
            },
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().filter((item) => item.IsActive).map((item) => ({
                    label: item.MachineName || 'Unknown',
                    value: item.MachineName || '',
                }));

                setMachine((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item: { label: string, value: string }) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            },
        }
    );

    useFocusEffect(
        useCallback(() => {
            return () => {
                remove()
                setApproved([])
            };
        }, [])
    );

    const handlePaginationChange = useCallback(() => {
        if (hasNextPage && !isFetching) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetching, fetchNextPage]);

    const handlefilter = useCallback((search?: string | null) => {
        if (search) {
            setDebouncedSearchQueryFilter(search)
        }
    }, []);

    const user = useSelector((state: any) => state.user)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        const data = approved.find((v) => v.TableID === item);

        try {
            if (action === "preIndex") {
                if (data) {
                    navigate("Preview", {
                        formId: data.FormID,
                        tableId: data.TableID,
                    });
                }
            } else if (action === "Approved") {
                const UserData = {
                    UserID: user.UserID,
                    UserName: user.Full_Name,
                    GUserID: user.GUserID,
                }

                mutation.mutate({ TableID: selectedRows, UserData });
                setSelectedRows([])
            } else if (action === "ResetRow") {
                setSelectedRows([])
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, approved, selectedRows, user, navigate]);

    const convertToThaiDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear() + 543;
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} เวลา ${hours}:${minutes}`;
    };

    const setRow = useCallback((value: string[]) => {
        setSelectedRows(value)
    }, [selectedRows])

    const Edit = user.Permissions.includes("edit_approved")

    const tableData = useMemo(() => {
        return approved.map((item) => Edit ? [
            item.TableID,
            item.MachineName,
            item.FormName,
            item.UserName || "-",
            convertToThaiDateTime(item.CreateDate),
            item.TableID,
        ] : [
            item.MachineName,
            item.FormName,
            item.UserName || "-",
            convertToThaiDateTime(item.CreateDate),
            item.TableID,
        ]);
    }, [Edit, approved, debouncedSearchQuery]);

    const mutation = useMutation(SaveApproved, {
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries('approved');
        },
        onError: handleError,
    });

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: Edit ? [
            { label: "selected", align: "center" },
            { label: "Machine Name", align: "flex-start" },
            { label: "Form Name", align: "flex-start" },
            { label: "User", align: "flex-start" },
            { label: "Time Submit", align: "flex-start" },
            { label: "Preview", align: "center" },
        ] : [
            { label: "Machine Name", align: "flex-start" },
            { label: "Form Name", align: "flex-start" },
            { label: "User", align: "flex-start" },
            { label: "Time Submit", align: "flex-start" },
            { label: "Preview", align: "center" },
        ],
        flexArr: Edit ? [1, 2, 3, 2, 3, 1] : [2, 3, 2, 3, 1],
        actionIndex: Edit ? [
            {
                selectIndex: 0,
                preIndex: 5,
            },
        ] : [{
            preIndex: 4,
        }],
        handleAction,
        showMessage: Edit ? [1, 2] : [0, 1],
        searchQuery: debouncedSearchQuery,
        selectedRows,
        setRow,
        showFilterDate: true,
        showFilter: true,
        ShowTitle: "Machine",
        showData: machines,
        showColumn: "MachineName",
        filterColumn: 1,
        setFilterDate: 4,
        hasNextPage: hasNextPageMG,
        isFetchingNextPage: hasNextPageMG,
        searchfilter: debouncedSearchQueryFilter
    }), [tableData, debouncedSearchQuery, handleAction, machines, debouncedSearchQueryFilter, hasNextPageMG, hasNextPageMG, setRow, selectedRows]);

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
            fontWeight: 'bold'
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
                    boxShadow: '2px 5px 10px rgba(0, 0, 0, 0.24)',
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
    });

    return (
        <View id="container-checklist" style={styles.container}>
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Text style={[masterdataStyles.textBold, styles.header]}>List Acknowledged</Text>
            </View>

            <Card.Content style={styles.cardcontent}>
                <View style={styles.containerSearch}>
                    <View style={styles.contentSearch}>
                        <Searchbar
                            placeholder="Search Acknowledged..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            testId="search-ac"
                        />
                    </View>
                </View>

                <Suspense fallback={<LoadingSpinner />}>
                    <LazyCustomtable {...customtableProps} handlePaginationChange={handlePaginationChange} fetchNextPage={fetchNextPageMG} handlefilter={handlefilter} />
                </Suspense>
            </Card.Content>
        </View>
    );
});

export default ApprovedScreen;

