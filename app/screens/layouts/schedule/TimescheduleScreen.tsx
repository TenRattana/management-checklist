import React, { useState, useCallback, useMemo, useEffect, Suspense, lazy } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import axiosInstance from "@/config/axios";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import { LoadingSpinner, LoadingSpinnerTable, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { InfiniteData, useMutation, useQuery, useQueryClient } from 'react-query';
import { useSelector } from "react-redux";
import ScheduleDialog from "@/components/screens/Schedule_dialog";
import { fetchSearchTimeSchedules, fetchTimeSchedules, saveTimeSchedule } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { useFocusEffect } from "expo-router";
import { TimeScheduleProps } from "@/typing/screens/TimeSchedule";

const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

const TimescheduleScreen = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<TimeScheduleProps>({
        ScheduleID: "",
        ScheduleName: "",
        IsActive: false,
        Tracking: false,
        MachineGroup: [],
        Type_schedule: "",
        Custom: false,
        TimeSlots: [],
        TimeCustom: [],
        TimeWeek: {}
    });

    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { theme, darkMode } = useTheme()
    const { spacing, fontSize, responsive } = useRes();
    const queryClient = useQueryClient();
    const [timeSchedule, setTimeSchedule] = useState<TimeScheduleProps[]>([])

    const { data, isLoading, remove } = useQuery(
        ['timeSchedule', debouncedSearchQuery],
        () => {
            return debouncedSearchQuery
                ? fetchSearchTimeSchedules(debouncedSearchQuery)
                : fetchTimeSchedules();
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            onSuccess: (NewData: InfiniteData<TimeScheduleProps[]>) => {
                const newItems = NewData?.pages?.flat() || NewData
                setTimeSchedule(newItems)
            }
        }
    );

    useFocusEffect(
        useCallback(() => {
            return () => {
                remove()
                setTimeSchedule([])
            };
        }, [remove])
    );

    const mutation = useMutation(saveTimeSchedule, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setIsVisible(false)
            queryClient.invalidateQueries('timeSchedule');
            queryClient.refetchQueries('machineGroups');
        },
        onError: handleError,
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const saveData = useCallback(async (values: TimeScheduleProps) => {
        const data = {
            Prefix: state.PF_TimeSchedule ?? "",
            Schedule: JSON.stringify(values)
        };
        mutation.mutate(data);
    }, [mutation, state]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post("TimeSchedules/GetSchedule", { ScheduleID: item });
                const timeschedule = response.data.data[0] ?? [];
                const option = timeschedule.MachineGroup?.map((v: { GMachineID: string }) => v.GMachineID) || [];

                setInitialValues({
                    ScheduleID: timeschedule.ScheduleID ?? "",
                    ScheduleName: timeschedule.ScheduleName ?? "",
                    IsActive: timeschedule.IsActive ?? "",
                    MachineGroup: option,
                    Type_schedule: timeschedule.Type_schedule ?? "",
                    Tracking: Boolean(timeschedule.Tracking),
                    Custom: Boolean(timeschedule.Custom),
                    TimeSlots: timeschedule.TimeSlots ?? [],
                    TimeCustom: timeschedule.TimeCustom ?? [],
                    TimeWeek: timeschedule.TimeWeek ?? {}
                })

                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "PointTimeSchedules" : "DeleteTimeSchedule";
                const response = await axiosInstance.post(`TimeSchedules/${endpoint}`, { ScheduleID: item });
                showSuccess(String(response.data.message));
                queryClient.invalidateQueries('timeSchedule');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient, timeSchedule]);

    const tableData = useMemo(() => {
        return timeSchedule.map((item) => [
            item.ScheduleName,
            item.Type_schedule,
            item.Tracking ? "track" : "not track",
            item.IsActive,
            item.ScheduleID
        ]) || [];
    }, [timeSchedule, debouncedSearchQuery]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            ScheduleID: "",
            ScheduleName: "",
            IsActive: false,
            MachineGroup: [],
            Type_schedule: "",
            Tracking: false,
            Custom: false,
            TimeSlots: [],
            TimeCustom: [],
            TimeWeek: {}
        })
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const CustomtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Schedule Name", align: "flex-start" },
            { label: "Type", align: "center" },
            { label: "Tracking", align: "center" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [2, 1, 1, 1, 1],
        actionIndex: [{ editIndex: 4, delIndex: 5 }],
        handleAction,
        showMessage: 0,
        detail: true,
        detailKey: "ScheduleID",
        detailKeyrow: 4,
        showDetailwithKey: ["MachineGroup", "Type_schedule", "TimelineItems"],
        detailData: timeSchedule,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction, timeSchedule]);

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
    const MemoScheduleDialog = React.memo(ScheduleDialog)

    return (
        <View id="container-schedule" style={styles.container}>
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Text style={[masterdataStyles.textBold, styles.header]}>{state.TimeSchedule || "List Time Schedule"}</Text>
            </View>

            <Card.Content style={styles.cardcontent}>
                <View style={styles.containerSearch}>
                    <View style={styles.contentSearch}>
                        <Searchbar
                            placeholder={`Search ${state.TimeSchedule}...`}
                            value={searchQuery}
                            onChange={setSearchQuery}
                            testId="search-schedule"
                        />
                    </View>

                    <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>{`Create ${state.TimeSchedule}`}</Text>
                    </TouchableOpacity>
                </View>

                <Suspense fallback={<LoadingSpinnerTable />}>
                    <LazyCustomtable {...CustomtableProps} />
                </Suspense>
            </Card.Content>

            {isVisible && (
                <MemoScheduleDialog
                    isVisible={isVisible}
                    setIsVisible={setIsVisible}
                    isEditing={isEditing}
                    initialValues={initialValues}
                    saveData={saveData}
                />
            )}
        </View>
    );
});

export default TimescheduleScreen;