import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useToast } from '@/app/contexts/useToast';
import { useRes } from '@/app/contexts/useRes';
import { Searchbar } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { ExpectedResult } from "@/typing/type";
import { ExpectedResultProps } from "@/typing/tag";
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { fetchApporved, fetchMachines, fetchSearchApporved, fetchSearchMachines, SaveApporved } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { navigate } from "@/app/navigations/navigationUtils";

const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

const ApprovedScreen: React.FC<ExpectedResultProps> = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [debouncedSearchQueryFilter, setDebouncedSearchQueryFilter] = useState<string>("");
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const { theme } = useTheme();
    const queryClient = useQueryClient();
    const [approved, setApproved] = useState<ExpectedResult[]>([])

    const { data, isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['approved', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchApporved(debouncedSearchQuery)
                : fetchApporved(pageParam, 50);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
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

    const { data: machine, fetchNextPage: fetchNextPageMG, hasNextPage: hasNextPageMG, isLoading, isFetchingNextPage } = useInfiniteQuery(
        ['machine', debouncedSearchQueryFilter],
        ({ pageParam = 0 }) => {
            return debouncedSearchQueryFilter
                ? fetchSearchMachines(debouncedSearchQueryFilter)
                : fetchMachines(pageParam, 50);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
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

    useEffect(() => {
        if (debouncedSearchQuery === "") {
            setApproved([])
            remove()
        } else {
            setApproved([])
        }
    }, [debouncedSearchQuery, remove])
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
            } else if (action === "Apporved") {
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

    const tableData = useMemo(() => {
        return approved.map((item) => [
            item.TableID,
            item.MachineName,
            item.FormName,
            item.UserName || "-",
            convertToThaiDateTime(item.CreateDate),
            item.TableID,
        ]);
    }, [approved, debouncedSearchQuery]);

    const mutation = useMutation(SaveApporved, {
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries('approved');
        },
        onError: handleError,
    });

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "selected", align: "center" },
            { label: "Machine Name", align: "flex-start" },
            { label: "Form Name", align: "flex-start" },
            { label: "User", align: "flex-start" },
            { label: "Time Submit", align: "flex-start" },
            { label: "Preview", align: "center" },
        ],
        flexArr: [1, 2, 3, 2, 3, 1],
        actionIndex: [
            {
                selectIndex: 0,
                preIndex: 5,
            },
        ],
        handleAction,
        showMessage: [1, 2],
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
        isFetchingNextPage: isFetchingNextPage,
        searchfilter: debouncedSearchQueryFilter
    }), [tableData, debouncedSearchQuery, handleAction, machines, debouncedSearchQueryFilter, hasNextPageMG, isFetchingNextPage, setRow, selectedRows]);

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
    })

    return (
        <View id="container-checklist" style={styles.container}>
            <Card.Title
                title="List Acknowledged"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Acknowledged..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-ac"
                />
            </View>
            <Card.Content style={styles.cardcontent}>
                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                    <LazyCustomtable {...customtableProps} handlePaginationChange={handlePaginationChange} fetchNextPage={fetchNextPageMG} handlefilter={handlefilter} />
                </Suspense>
                {isFetching && <ActivityIndicator />}
            </Card.Content>
        </View>
    );
});

export default ApprovedScreen;

