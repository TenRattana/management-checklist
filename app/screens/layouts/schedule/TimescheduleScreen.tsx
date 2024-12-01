import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import axiosInstance from "@/config/axios";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import { AccessibleView, Customtable, LoadingSpinner, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { Machine, TimeSchedule } from '@/typing/type';
import { useQuery, useQueryClient } from 'react-query';
import { useSelector } from "react-redux";
import ScheduleDialog from "@/components/screens/Schedule_dialog";

const fetchTimeSchedules = async (): Promise<TimeSchedule[]> => {
    const response = await axiosInstance.post("TimeSchedule_service.asmx/GetTimeSchedules");
    return response.data.data ?? [];
};

const fetchMachines = async (): Promise<Machine[]> => {
    const response = await axiosInstance.post("Machine_service.asmx/GetMachines");
    return response.data.data ?? [];
};
interface InitialValues {
    ScheduleName: string;
    MachineGroup: string;
    Machine: Machine[];
    timeSlots: { start: string | null, end: string | null }[];
    timeCustom: { start: string | null, end: string | null }[];
    timeWeek: { [key: string]: { start: string | null, end: string | null }[] }
}

const TimescheduleScreen: React.FC = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const initialValues: InitialValues = {
        ScheduleName: '',
        MachineGroup: "",
        Machine: [],
        timeSlots: [],
        timeCustom: [],
        timeWeek: {}
    };

    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();

    const { data: machine = [], } = useQuery<Machine[], Error>(
        'machine',
        fetchMachines,
        {
            refetchOnWindowFocus: true,
        }
    );

    const { data: timeSchedule = [], isLoading, } = useQuery<TimeSchedule[], Error>(
        'timeSchedule',
        fetchTimeSchedules,
        {
            refetchOnWindowFocus: true,
        }
    );

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
                const response = await axiosInstance.post("TimeSchedule_service.asmx/GetTimeSchedule", { TScheduleID: item });
                // const machineData = response.data.data[0] ?? {};

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
    }, [handleError, queryClient]);

    const tableData = useMemo(() => {
        return timeSchedule.map((item) => [
            item.TScheduleName,
            item.IsActive,
            item.TScheduleID
        ]);
    }, [timeSchedule, debouncedSearchQuery]);

    const handleNewData = useCallback(() => {

        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Schedule Name", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [6, 1, 1],
        actionIndex: [{ editIndex: 2, delIndex: 3 }],
        handleAction,
        showMessage: 0,
        detail: true,
        detailKey: ["Machine", "TimeDetail"],
        detailData: timeSchedule,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

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
                <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>Add New Schedule</Text>
                </Pressable>
            </AccessibleView>
            <Card.Content style={styles.cardcontent}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
            </Card.Content>

            <ScheduleDialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
                timeSchedule={timeSchedule}
            />
        </AccessibleView>
    );
});

export default TimescheduleScreen;
