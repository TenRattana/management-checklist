import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from '@/app/contexts/useToast';
import { LoadingSpinner, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useInfiniteQuery } from 'react-query';
import { Platform, StyleSheet, View } from "react-native";
import { fetchExpectedResults, fetchMachines, fetchSearchExpectedResult, fetchSearchMachines } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { navigate } from "@/app/navigations/navigationUtils";
import { useFocusEffect } from "expo-router";
import { useSelector } from "react-redux";
import { ExpectedResult } from "@/typing/screens/ExpectedResult";

const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

const ExpectedResultScreen = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [debouncedSearchQueryFilter, setDebouncedSearchQueryFilter] = useState<string>("");
    const state = useSelector((state: any) => state.prefix);

    const { handleError } = useToast();
    const { spacing, fontSize, responsive } = useRes();
    const { theme } = useTheme();
    const [expectedResult, setExpectedResult] = useState<ExpectedResult[]>([])
    const masterdataStyles = useMasterdataStyles();

    const { data, isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['expectedResult', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchExpectedResult(debouncedSearchQuery)
                : fetchExpectedResults(pageParam, 50);
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
                setExpectedResult(newItems);
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
                setExpectedResult([])
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

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        const data = expectedResult.find((v) => v.TableID === item);

        try {
            if (action === "preIndex") {
                if (data) {
                    navigate("Preview", {
                        formId: data.FormID,
                        tableId: data.TableID,
                    });
                }
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, expectedResult, navigate]);

    const convertToThaiDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear() + 543;
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} เวลา ${hours}:${minutes}`;
    };

    const tableData = useMemo(() => {
        return expectedResult.map((item) => [
            item.MachineName,
            item.FormName,
            item.UserName || "-",
            item.ApporvedName || "-",
            convertToThaiDateTime(item.CreateDate),
            item.ApporvedTime ? convertToThaiDateTime(item.ApporvedTime) : "-",
            item.TableID,
        ]);
    }, [expectedResult, debouncedSearchQuery]);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Machine Name", align: "flex-start" },
            { label: "Form Name", align: "flex-start" },
            { label: "User", align: "flex-start" },
            { label: "Acknowledged", align: "flex-start" },
            { label: "Time Submit", align: "flex-start" },
            { label: "Time Apporved", align: "flex-start" },
            { label: "Preview", align: "center" },
        ],
        flexArr: [2, 3, 2, 2, 2, 2, 1],
        actionIndex: [
            {
                preIndex: 6,
            },
        ],
        handleAction,
        showMessage: [0, 1],
        showFilterDate: true,
        showFilter: true,
        ShowTitle: "Machine",
        showData: machines,
        showColumn: "MachineName",
        filterColumn: 0,
        setFilterDate: 4,
        searchQuery: debouncedSearchQuery,
        hasNextPage: hasNextPageMG,
        isFetchingNextPage: isFetchingMG,
        searchfilter: debouncedSearchQueryFilter
    }), [tableData, debouncedSearchQuery, handleAction, machines, debouncedSearchQueryFilter, hasNextPageMG, isFetchingMG]);

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
                <Text style={[masterdataStyles.textBold, styles.header]}>{state.ExpectedResult || "List"}</Text>
            </View>

            <Card.Content style={styles.cardcontent}>
                <View style={styles.containerSearch}>
                    <View style={styles.contentSearch}>
                        <Searchbar
                            placeholder="Search ExpectedResult..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            testId="search-er"
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

export default ExpectedResultScreen;

