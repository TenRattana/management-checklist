import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from '@/app/contexts/useToast';
import { LoadingSpinner, Searchbar } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { ExpectedResult } from "@/typing/type";
import { ExpectedResultProps } from "@/typing/tag";
import { useInfiniteQuery } from 'react-query';
import { StyleSheet, View } from "react-native";
import { fetchExpectedResults, fetchMachines, fetchSearchExpectedResult, fetchSearchMachines } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { navigate } from "@/app/navigations/navigationUtils";

const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

const ExpectedResultScreen: React.FC<ExpectedResultProps> = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [debouncedSearchQueryFilter, setDebouncedSearchQueryFilter] = useState<string>("");

    const masterdataStyles = useMasterdataStyles();
    const { handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const { theme } = useTheme();
    const [expectedResult, setExpectedResult] = useState<ExpectedResult[]>([])

    const { data, isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['expectedResult', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchExpectedResult(debouncedSearchQuery)
                : fetchExpectedResults(pageParam, 50);
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
                setExpectedResult(newItems);
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
            setExpectedResult([])
            remove()
        } else {
            setExpectedResult([])
        }
    }, [debouncedSearchQuery, remove])

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
            { label: "Preview", align: "center" },
        ],
        flexArr: [2, 3, 2, 2, 2, 1],
        actionIndex: [
            {
                preIndex: 5,
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
        isFetchingNextPage: isFetchingNextPage,
        searchfilter: debouncedSearchQueryFilter
    }), [tableData, debouncedSearchQuery, handleAction, machines, debouncedSearchQueryFilter, hasNextPageMG, isFetchingNextPage]);

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
                title="ExpectedResult"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search ExpectedResult..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-er"
                />
            </View>
            <Card.Content style={styles.cardcontent}>
                <Suspense fallback={<LoadingSpinner />}>
                    <LazyCustomtable {...customtableProps} handlePaginationChange={handlePaginationChange} fetchNextPage={fetchNextPageMG} handlefilter={handlefilter} />
                </Suspense>
                {isFetching && <LoadingSpinner />}
            </Card.Content>
        </View>
    );
});

export default ExpectedResultScreen;

