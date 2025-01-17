import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import axiosInstance from "@/config/axios";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import { Customtable, Searchbar, Text } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { TimeScheduleProps } from '@/typing/type';
import { InfiniteData, useMutation, useQuery, useQueryClient } from 'react-query';
import { useSelector } from "react-redux";
import ScheduleDialog from "@/components/screens/Schedule_dialog";
import { fetchSearchTimeSchedules, fetchTimeSchedules, saveTimeSchedule } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { useFocusEffect } from "expo-router";

const TimescheduleScreen: React.FC = React.memo(() => {
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
    const { theme } = useTheme()
    const { spacing, fontSize } = useRes();
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
        }, [])
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
                const response = await axiosInstance.post("TimeSchedule_service.asmx/GetSchedule", { ScheduleID: item });
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
                const response = await axiosInstance.post(`TimeSchedule_service.asmx/${endpoint}`, { ScheduleID: item });
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
        container:
            Platform.OS === "web"
                ? {
                    flex: 1,
                    margin: 10,
                    padding: 10,
                    paddingBottom: 0,
                    marginBottom: 0,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    backgroundColor: theme.colors.background,
                }
                : {
                    flex: 1,
                    backgroundColor: theme.colors.background,
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

    const MemoScheduleDialog = React.memo(ScheduleDialog)

    return (
        <View id="container-schedule" style={styles.container}>
            <Card.Title
                title={state.TimeSchedule || "List Time Schedule"}
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <Divider style={{ marginHorizontal: 15, marginBottom: 10 }} />

            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Schedule..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-schedule"
                />
                <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>{`Create ${state.TimeSchedule}`}</Text>
                </TouchableOpacity>
            </View>
            <Card.Content style={styles.cardcontent}>
                <Customtable {...CustomtableProps} />
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