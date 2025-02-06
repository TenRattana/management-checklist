import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, useRef } from "react";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from '@/app/contexts/useToast';
import { LoadingSpinner, LoadingSpinnerTable, Searchbar, Text } from "@/components";
import { Button, Card, IconButton, Portal } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { QueryClient, useInfiniteQuery, useQueryClient } from 'react-query';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { fetchExpectedResults, fetchExpectedResultsWithTime, fetchForms, fetchMachines, fetchSearchExpectedResult, fetchSearchFomrs, fetchSearchMachines, fetchUsers } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { navigate } from "@/app/navigations/navigationUtils";
import { useFocusEffect } from "expo-router";
import { useSelector } from "react-redux";
import { ExpectedResult } from "@/typing/screens/ExpectedResult";
import AdvancedFilter from "@/components/common/AdvancedFilter";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import DialogTimeCustom from "@/components/common/DialogTimeCustom";
import { getCurrentTime } from "@/config/timezoneUtils";
import { convertToDate, convertToThaiDateTime, parseDateFromString } from "@/components/screens/Schedule";

const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

const filterDateOptions = [
    { label: "Select all", value: "" },
    { label: "Today", value: "Today" },
    { label: "This week", value: "This week" },
    { label: "This month", value: "This month" },
    { label: "Custom", value: "Custom" }
];

const filterApproved = [
    { label: "Select all", value: "" },
    { label: "Approved", value: "✔️" },
    { label: "Automatic", value: "-" },
];

const ExpectedResultScreen = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [debouncedSearchQueryFilter, setDebouncedSearchQueryFilter] = useState<string>("");
    const state = useSelector((state: any) => state.prefix);

    const { handleError } = useToast();
    const { spacing, fontSize, responsive } = useRes();
    const { theme, darkMode } = useTheme();
    const [expectedResult, setExpectedResult] = useState<ExpectedResult[]>([])
    const masterdataStyles = useMasterdataStyles();
    const [show, setShow] = useState(false)
    const [selectFilter, setSelectFilter] = useState<{ Date: string, Machine: string, User: string, Status: string, Form: string, Machine_Code: string, FormNumber: string }>({
        Date: "", Form: "", Machine: "", Machine_Code: "", Status: "", User: "", FormNumber: ""
    });
    const [visible, setVisible] = useState<{ Date: boolean, Machine: boolean, User: boolean, Status: boolean, Form: boolean, Machine_Code: boolean, FormNumber: boolean }>({ Date: false, Form: false, Machine: false, Machine_Code: false, Status: false, User: false, FormNumber: false });

    const [visibleTime, setVisibleTime] = useState(false)
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const defaults = useRef("");

    const { remove } = useInfiniteQuery(
        ['expectedResult', defaults.current],
        () => {
            return fetchExpectedResultsWithTime(defaults.current);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat();
                setExpectedResult(newItems);
            },
        }
    );

    const [machines, setMachine] = useState<{ label: string, value: string }[]>([{ label: "Show all", value: "" }]);
    const [machineCodes, setMachineCodes] = useState<{ label: string, value: string }[]>([{ label: "Show all", value: "" }]);
    const { data: machine, isFetching: isFetchingMG, fetchNextPage: fetchNextPageMG, hasNextPage: hasNextPageMG } = useInfiniteQuery(
        ['machine', debouncedSearchQueryFilter],
        ({ pageParam = 0 }) => {
            return debouncedSearchQueryFilter
                ? fetchSearchMachines(debouncedSearchQueryFilter)
                : fetchMachines(pageParam, 1000);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            enabled: true,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 1000 ? allPages.length : undefined;
            },
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().filter((item) => item.IsActive).map((item) => ({
                    label: item.MachineName || 'Unknown',
                    value: item.MachineName || '',
                }));

                const newItemCodes = newData.pages.flat().filter((item) => item.IsActive).map((item) => ({
                    label: item.MachineCode || 'Unknown',
                    value: item.MachineCode || '',
                }));

                setMachine((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item: { label: string, value: string }) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });

                setMachineCodes((prevItems) => {
                    const allItemCodes = [...prevItems, ...newItemCodes];

                    const uniqueItemCodes = Array.from(new Set(allItemCodes.map((item) => item.value)))
                        .map((value) => allItemCodes.find((item) => item.value === value))
                        .filter((item) => item !== undefined);

                    return uniqueItemCodes;
                });
            },
        }
    );

    const [debouncedSearchQueryFilterForm, setDebouncedSearchQueryFilterForm] = useState<string>("");

    const [forms, setForms] = useState<{ label: string, value: string }[]>([{ label: "Show all", value: "" }]);
    const [formNumbers, setFormNumbers] = useState<{ label: string, value: string }[]>([{ label: "Show all", value: "" }]);
    const { data: form, isFetching: isFetchingF, fetchNextPage: fetchNextPageF, hasNextPage: hasNextPageF } = useInfiniteQuery(
        ['form', debouncedSearchQueryFilter],
        ({ pageParam = 0 }) => {
            return debouncedSearchQueryFilter
                ? fetchSearchFomrs(debouncedSearchQueryFilter)
                : fetchForms(pageParam, 1000);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            enabled: true,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 1000 ? allPages.length : undefined;
            },
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().filter((item) => item.IsActive).map((item) => ({
                    label: item.FormName || 'Unknown',
                    value: item.FormName || '',
                }));

                const newItemNumbers = newData.pages.flat().filter((item) => item.IsActive).map((item) => ({
                    label: item.FormNumber || 'Unknown',
                    value: item.FormNumber || '',
                }));

                setForms((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item: { label: string, value: string }) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });

                setFormNumbers((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItemNumbers.filter((item: { label: string, value: string }) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            },
        }
    );

    const [debouncedSearchQueryFilterUser, setDebouncedSearchQueryFilterUser] = useState<string>("");

    const [users, setUsers] = useState<{ label: string, value: string }[]>([{ label: "Show all", value: "" }]);
    const { } = useInfiniteQuery(
        ['user', debouncedSearchQueryFilter],
        () => {
            return fetchUsers();
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            enabled: true,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 1000 ? allPages.length : undefined;
            },
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().filter((item) => item.IsActive).map((item) => ({
                    label: item.UserName || 'Unknown',
                    value: item.UserName || '',
                }));

                setUsers((prevItems) => {
                    const allItemCodes = [...prevItems, ...newItems];

                    const uniqueItemCodes = Array.from(new Set(allItemCodes.map((item) => item.value)))
                        .map((value) => allItemCodes.find((item) => item.value === value))
                        .filter((item) => item !== undefined);

                    return uniqueItemCodes;
                });
            },
        }
    );

    useFocusEffect(
        useCallback(() => {
            var deM = getCurrentTime();
            deM.setMonth(getCurrentTime().getMonth() - 3);
            deM.setDate(1);
            defaults.current = convertToThaiDateTime(new Date(deM).toISOString())
            setStartTime(defaults.current)

            return () => {
                remove()
                setExpectedResult([])
            };
        }, [remove, setStartTime, getCurrentTime, convertToThaiDateTime])
    );

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

    const convertToThaiDateTimes = (dateString: string) => {
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
            item.MachineCode,
            item.MachineName,
            item.FormNumber,
            item.FormName,
            item.UserName || "-",
            item.ApprovedName ? "✔️" : "-",
            convertToThaiDateTimes(item.CreateDate),
            item.TableID,
        ]);
    }, [expectedResult, debouncedSearchQuery]);

    const filteredTableData = useMemo(() => {
        return tableData.filter((row) => {

            if (selectFilter.Date && !row[6].includes(selectFilter.Date)) {
                const rowDate = parseDateFromString(row[6] as string);
                if (rowDate === null) return false;
                return rowDate.toDateString() >= startTime.toDateString() && endTime.toDateString()
            }

            if (selectFilter.Machine && row[1] !== selectFilter.Machine) {
                return false;
            }

            if (selectFilter.User && row[4] !== selectFilter.User) {
                return false;
            }

            if (selectFilter.Status && row[5] !== selectFilter.Status) {
                return false;
            }

            if (selectFilter.Form && row[3] !== selectFilter.Form) {
                return false;
            }

            if (selectFilter.Machine_Code && row[0] !== selectFilter.Machine_Code) {
                return false;
            }

            if (selectFilter.FormNumber && row[2] !== selectFilter.FormNumber) {
                return false;
            }

            return true;
        });
    }, [tableData, selectFilter]);

    const customtableProps = useMemo(() => ({
        Tabledata: filteredTableData,
        Tablehead: [
            { label: "M.Code", align: "flex-start" },
            { label: "Machine Name", align: "flex-start" },
            { label: "F.Number", align: "flex-start" },
            { label: "Form Name", align: "flex-start" },
            { label: "User", align: "flex-start" },
            { label: "Approve", align: "center" },
            { label: "Time Submit", align: "center" },
            { label: "Preview", align: "center" },
        ],
        flexArr: [1.5, 2, 1, 2, 1, 0.5, 1.5, 1],
        actionIndex: [
            {
                preIndex: 7,
            },
        ],
        handleAction,
        showMessage: [1, 3],
        detail: true,
        detailKey: "TableID",
        detailKeyrow: 7,
        showDetailwithKey: ["MachineCode", "MachineName", "FormNumber", "FormName", "UserName", "ApprovedName", "CreateDate", "ApprovedTime"],
        detailData: expectedResult,
        searchQuery: debouncedSearchQuery,
        hasNextPage: hasNextPageMG,
        isFetchingNextPage: isFetchingMG,
        searchfilter: debouncedSearchQueryFilter
    }), [filteredTableData, debouncedSearchQuery, handleAction, debouncedSearchQueryFilter, hasNextPageMG, isFetchingMG]);

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
        filterBox: {
            position: 'absolute',
            marginTop: 40,
        },
        filterCard: {
            top: 70,
            position: 'absolute',
            right: 10,
            paddingHorizontal: 20,
            paddingBottom: 10
        },
        scrollViewContainer: {
            flexDirection: 'row',
            paddingHorizontal: 5,
        },
        applyButton: {
            borderRadius: 8,
            alignSelf: 'center',
        },
    });


    const toggleFilter = () => {
        setShow(prev => !prev);
    };

    const getStartOfWeek = useCallback(() => {
        const date = new Date();
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek;
        date.setDate(diff);
        date.setHours(0, 0, 0, 0);
        return convertToThaiDateTime(date.toISOString());
    }, []);

    const getStartOfMonth = useCallback(() => {
        const date = new Date();
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        return convertToThaiDateTime(date.toISOString());
    }, []);

    const getToday = useCallback(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return convertToThaiDateTime(date.toISOString());
    }, []);

    const handelChangeFilter = useCallback((filed: string, value: string | null) => {
        setVisibleTime(filed === "Date" && value === "Custom")
        if (filed === "Date") {
            switch (value) {
                case "Today":
                    setStartTime(getToday());
                    setEndTime(getToday())
                    break;
                case "This week":
                    setStartTime(getStartOfWeek());
                    setEndTime(getToday())
                    break;
                case "This month":
                    setStartTime(getStartOfMonth());
                    setEndTime(getToday())
                    break;
                case "Custom":
                default:
            }
        }
        setSelectFilter((prev) => ({ ...prev, [filed]: value }))
    }, [])

    const handelChangeVisible = useCallback((filed: string, value: boolean) => {
        setVisible((prev) => ({ ...prev, [filed]: value }))
    }, [])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: withTiming(show ? 'auto' : 0, { duration: 300 }),
            opacity: withTiming(show ? 1 : 0, { duration: 300 }),
        };
    });

    const queryClient = useQueryClient();

    useEffect(() => {
        queryClient.invalidateQueries("Machine")
    }, []);

    const handleScrollMG = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent?.contentSize) {
            const contentHeight = nativeEvent?.contentSize.height;
            const layoutHeight = nativeEvent?.layoutMeasurement.height;
            const offsetY = nativeEvent?.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPageMG && !isFetchingMG) {
                fetchNextPageMG();
            }
        }
    };

    const handleScrollF = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent?.contentSize) {
            const contentHeight = nativeEvent?.contentSize.height;
            const layoutHeight = nativeEvent?.layoutMeasurement.height;
            const offsetY = nativeEvent?.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPageF && !isFetchingF) {
                fetchNextPageMG();
            }
        }
    };
    const scrollViewRef = useRef(null);
    const [viewWidth, setViewWidth] = useState(0);

    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setViewWidth(width);
    };

    const handlefilterAD = useCallback(() => {
        console.log(selectFilter);
    }, [selectFilter])

    const handleCloseDialog = useCallback(() => {
        if (!startTime && !endTime) handelChangeFilter("Date", "")
        setVisibleTime(false)
    }, [startTime, endTime, handelChangeFilter])

    const handleStartTimeChange = useCallback((value: string) => {
        handelChangeFilter("Date", "Custom")

        const start = convertToDate(String(value))
        const end = convertToDate(defaults.current);

        if (start < end) {
            defaults.current = startTime;
            remove();
        }

        setStartTime(value)
    }, [])

    const handleEndTimeChange = useCallback((value: string) => {
        handelChangeFilter("Date", "Custom")
        setEndTime(value)
    }, [])

    return (
        <View id="container-checklist" style={styles.container}>
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Text style={[masterdataStyles.textBold, styles.header]}>{state.ExpectedResult || "List"}</Text>
            </View>

            <Card.Content style={styles.cardcontent}>
                <View style={[styles.containerSearch, { justifyContent: 'space-between' }]}>
                    <View style={styles.contentSearch}>
                        <Searchbar
                            placeholder="Search ExpectedResult..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            testId="search-er"
                        />
                    </View>
                    {!show ? (
                        <View>
                            <TouchableOpacity onPress={toggleFilter} style={{ flexDirection: 'row' }}>
                                <Text style={[masterdataStyles.text, { color: theme.colors.blue }]}>Advance Filter</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Animated.View style={[styles.filterBox, animatedStyle]}>
                            <ScrollView horizontal contentContainerStyle={styles.scrollViewContainer}>
                                <Portal>
                                    <Card style={[styles.filterCard, { backgroundColor: theme.colors.background, borderRadius: 4 }]} ref={scrollViewRef} onLayout={handleLayout}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', alignItems: 'center' }}>
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { color: theme.colors.blue }]}>Filter Data</Text>
                                            <IconButton icon="close" size={20} iconColor={theme.colors.onBackground} onPress={toggleFilter} style={{ alignSelf: 'flex-end' }} />
                                        </View>

                                        <Card.Content style={{ width: responsive === "small" ? "100%" : 400, padding: 0, paddingBottom: 10 }}>
                                            <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
                                                <Text style={masterdataStyles.text}>Filter Date : {startTime ? startTime : ""} - {endTime ? endTime : convertToThaiDateTime(new Date(getCurrentTime()).toISOString())}</Text>
                                            </View>

                                            <View style={{ flexDirection: responsive === "small" ? 'column' : 'row' }}>
                                                <AdvancedFilter
                                                    selectFilter={selectFilter.Date}
                                                    handelChangeFilter={handelChangeFilter}
                                                    Title="Date"
                                                    selectFilterOption={filterDateOptions}
                                                    setVisible={handelChangeVisible}
                                                    visible={visible.Date}
                                                    lefticon={'clipboard-text-clock-outline'}
                                                    width={responsive === "small" ? '100%' : '60%'}
                                                />
                                                <AdvancedFilter
                                                    selectFilter={selectFilter.Status}
                                                    handelChangeFilter={handelChangeFilter}
                                                    Title="Status"
                                                    selectFilterOption={filterApproved}
                                                    setVisible={handelChangeVisible}
                                                    visible={visible.Status}
                                                    lefticon={'list-status'}
                                                    width={responsive === "small" ? '100%' : '40%'}
                                                />
                                            </View>
                                            <AdvancedFilter
                                                selectFilter={selectFilter.Machine}
                                                handelChangeFilter={handelChangeFilter}
                                                Title={state.Machine}
                                                search={true}
                                                selectFilterOption={machines}
                                                fetchNextPage={fetchNextPageMG}
                                                handleScroll={handleScrollMG}
                                                setVisible={handelChangeVisible}
                                                visible={visible.Machine}
                                                lefticon={'folder-search-outline'}
                                                width={'100%'}
                                            />
                                            <AdvancedFilter
                                                selectFilter={selectFilter.Form}
                                                handelChangeFilter={handelChangeFilter}
                                                Title={state.Form}
                                                search={true}
                                                selectFilterOption={forms}
                                                fetchNextPage={fetchNextPageF}
                                                handleScroll={handleScrollF}
                                                setVisible={handelChangeVisible}
                                                visible={visible.Form}
                                                lefticon={'feature-search-outline'}
                                                width={'100%'}
                                            />
                                            <View style={{ flexDirection: responsive === "small" ? 'column' : 'row' }}>
                                                <AdvancedFilter
                                                    selectFilter={selectFilter.Machine_Code}
                                                    handelChangeFilter={handelChangeFilter}
                                                    Title="Machine_Code"
                                                    search={true}
                                                    selectFilterOption={machineCodes}
                                                    setVisible={handelChangeVisible}
                                                    fetchNextPage={fetchNextPageMG}
                                                    handleScroll={handleScrollMG}
                                                    visible={visible.Machine_Code}
                                                    lefticon={'text-box-search-outline'}
                                                    width={responsive === "small" ? '100%' : '50%'}
                                                />
                                                <AdvancedFilter
                                                    selectFilter={selectFilter.FormNumber}
                                                    handelChangeFilter={handelChangeFilter}
                                                    Title="FormNumber"
                                                    search={true}
                                                    selectFilterOption={formNumbers}
                                                    setVisible={handelChangeVisible}
                                                    fetchNextPage={fetchNextPageF}
                                                    handleScroll={handleScrollF}
                                                    visible={visible.FormNumber}
                                                    lefticon={'text-box-search-outline'}
                                                    width={responsive === "small" ? '100%' : '50%'}
                                                />
                                            </View>
                                            <View style={{ flexDirection: responsive === "small" ? 'column' : 'row' }}>
                                                <AdvancedFilter
                                                    selectFilter={selectFilter.User}
                                                    handelChangeFilter={handelChangeFilter}
                                                    Title="User"
                                                    search={true}
                                                    selectFilterOption={users}
                                                    setVisible={handelChangeVisible}
                                                    visible={visible.User}
                                                    lefticon={'account-search-outline'}
                                                    width={responsive === "small" ? '100%' : '100%'}
                                                />
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </Portal>
                            </ScrollView>
                        </Animated.View>
                    )}
                </View>

                {show && (
                    <DialogTimeCustom
                        visible={visibleTime}
                        handleCloseDialog={handleCloseDialog}
                        handleStartTimeChanges={handleStartTimeChange}
                        handleEndTimeChanges={handleEndTimeChange}
                        startTime={startTime}
                        endTime={endTime}
                        setVisible={setVisibleTime}
                        viewWidth={viewWidth}
                    />
                )}

                <Suspense fallback={<LoadingSpinnerTable />}>
                    <LazyCustomtable {...customtableProps} fetchNextPage={fetchNextPageMG} handlefilter={handlefilter} />
                </Suspense>
            </Card.Content>
        </View>
    );
});

export default ExpectedResultScreen;