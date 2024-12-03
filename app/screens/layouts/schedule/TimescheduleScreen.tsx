import React, { useState, useCallback, useMemo, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import axiosInstance from "@/config/axios";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import { AccessibleView, Customtable, LoadingSpinner, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { GroupMachine, TimeSchedule } from '@/typing/type';
import { useQuery, useQueryClient } from 'react-query';
import { useSelector } from "react-redux";
import ScheduleDialog from "@/components/screens/Schedule_dialog";
import { timeSchedule } from "./Mock";

const fetchTimeSchedules = async (): Promise<TimeSchedule[]> => {
    const response = await axiosInstance.post("TimeSchedule_service.asmx/GetTimeSchedules");
    return response.data.data ?? [];
};

const fetchMachineGroups = async (): Promise<GroupMachine[]> => {
    const response = await axiosInstance.post("GroupMachine_service.asmx/GetGroupMachines");
    return response.data.data ?? [];
};

export interface TimeScheduleProps {
    ScheduleID: string;
    ScheduleName: string;
    MachineGroup?: string | string[];
    Type_schedule: string;
    Tracking: boolean;
    IsActive: boolean;
    Custom: boolean;
    TimeSlots?: Day[];
    TimeCustom?: Day[];
    TimeWeek?: { [key: string]: Day[] };
}

export interface Day {
    start: string | null;
    end: string | null;
}

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
        MachineGroup: "",
        Type_schedule: "",
        Custom: false,
        TimeSlots: [],
        TimeCustom: [],
        TimeWeek: {}
    });

    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();

    const { data: machineGroups = [] } = useQuery<GroupMachine[], Error>(
        'machineGroups',
        fetchMachineGroups,
        {
            refetchOnWindowFocus: true,
        }
    );

    // const { data: timeSchedule = [], isLoading, } = useQuery<TimeSchedule[], Error>(
    //     'timeSchedule',
    //     fetchTimeSchedules,
    //     {
    //         refetchOnWindowFocus: true,
    //     }
    // );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const saveData = useCallback(async (values: any) => {
        console.log(values);

    }, [state]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                // const response = await axiosInstance.post("TimeSchedule_service.asmx/GetTimeSchedule", { TScheduleID: item });
                setInitialValues(timeSchedule[timeSchedule.findIndex((v) => v.ScheduleID === item)])

                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeMachine" : "DeleteMachine";
                const response = await axiosInstance.post(`Machine_service.asmx/${endpoint}`, { MachineID: item });
                showSuccess(String(response.data.message));
                queryClient.invalidateQueries('machines');
                queryClient.refetchQueries('machineGroups');
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
        ]);
    }, [timeSchedule, debouncedSearchQuery, machineGroups]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            ScheduleID: "",
            ScheduleName: "",
            IsActive: false,
            MachineGroup: "",
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
        detailKey: ["MachineGroup", "TimeSlots", "TimeCustom", "TimeWeek"],
        detailData: timeSchedule,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction, timeSchedule]);

    const styles = StyleSheet.create({
        container: {
            flex: 1
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
        <AccessibleView name="container-schedule" style={styles.container}>
            <Card.Title
                title="List Time Schedule"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Schedule..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-schedule"
                />
                <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>Add New Schedule</Text>
                </TouchableOpacity>
            </AccessibleView>
            <Card.Content style={styles.cardcontent}>

                <Customtable {...CustomtableProps} />

                {/* {false ? <LoadingSpinner /> : 
                } */}
            </Card.Content>

            <ScheduleDialog
                isVisible={isVisible}
                machineGroups={machineGroups}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />
        </AccessibleView>
    );
});

export default TimescheduleScreen;