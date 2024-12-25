import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from '@/app/contexts/useToast';
import { Customtable, AccessibleView, Searchbar } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { ExpectedResult } from "@/typing/type";
import { ExpectedResultProps } from "@/typing/tag";
import { useInfiniteQuery } from 'react-query';
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { fetchExpectedResults, fetchSearchExpectedResult } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { getCurrentTime } from "@/config/timezoneUtils";

const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

const ExpectedResultScreen: React.FC<ExpectedResultProps> = React.memo(({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

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

    const handlePaginationChange = useCallback(() => {
        if (hasNextPage && !isFetching) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetching, fetchNextPage]);

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
                    navigation.navigate("Preview", {
                        formId: data.FormID,
                        tableId: data.TableID,
                    });
                }
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, expectedResult]);

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
        showColumn: "Date",
        ShowTitle: "Select Date :",
        showData: [{ Date: "To Day" }, { Date: "To Week" }, { Date: "To Month" }, { Date: "To Year" }],
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction,]);

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
                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                    <LazyCustomtable {...customtableProps} handlePaginationChange={handlePaginationChange} />
                </Suspense>
            </Card.Content>
        </View>
    );
});

export default ExpectedResultScreen;

