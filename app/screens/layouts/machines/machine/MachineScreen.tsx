import React, { useState, useCallback, useMemo } from "react";
import { Pressable } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { AccessibleView, Customtable, LoadingSpinner, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Machine_dialog from "@/components/screens/Machine_dialog";
import { Machine, GroupMachine } from '@/typing/type';
import { InitialValuesMachine } from '@/typing/value';
import { useQuery, useMutation, useQueryClient } from 'react-query';

const fetchMachines = async (): Promise<Machine[]> => {
    console.log("FM");

    const response = await axiosInstance.post("Machine_service.asmx/GetMachines");
    return response.data.data ?? [];
};

const fetchMachineGroups = async (): Promise<GroupMachine[]> => {
    const response = await axiosInstance.post("GroupMachine_service.asmx/GetGroupMachines");
    return response.data.data ?? [];
};

const saveMachine = async (data: Machine): Promise<{ message: string }> => {
    const response = await axiosInstance.post("Machine_service.asmx/SaveMachine", data);
    return response.data;
};

const MachineGroupScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesMachine>({
        machineId: "",
        machineGroupId: "",
        machineName: "",
        description: "",
        isActive: true,
    });

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();

    const { data: machines = [], isLoading: isLoadingMachines } = useQuery<Machine[], Error>('machines', fetchMachines);
    const { data: machineGroups = [] } = useQuery<GroupMachine[], Error>('machineGroups', fetchMachineGroups);

    const mutation = useMutation(saveMachine, {
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries('machines');
        },
        onError: handleError,
    });

    useCallback(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const saveData = useCallback(async (values: InitialValuesMachine) => {
        const data = {
            MachineID: values.machineId,
            GMachineID: values.machineGroupId ?? "",
            MachineName: values.machineName,
            Description: values.description,
            IsActive: values.isActive,
        };
        mutation.mutate(data);
    }, [mutation]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post("Machine_service.asmx/GetMachine", { MachineID: item });
                const machineData = response.data.data[0] ?? {};
                setInitialValues({
                    machineId: machineData.MachineID ?? "",
                    machineGroupId: machineData.GMachineID ?? "",
                    machineName: machineData.MachineName ?? "",
                    description: machineData.Description ?? "",
                    isActive: Boolean(machineData.IsActive),
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeMachine" : "DeleteMachine";
                await axiosInstance.post(`Machine_service.asmx/${endpoint}`, { MachineID: item });
                showSuccess("Action completed successfully.");
                queryClient.invalidateQueries('machines');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient]);

    const tableData = useMemo(() => {
        return machines.map((item) => [
            machineGroups.find((group) => group.GMachineID === item.GMachineID)?.GMachineName || "",
            item.MachineName,
            item.Description,
            item.IsActive ? "Active" : "Inactive",
            item.MachineID,
        ]);
    }, [machines, machineGroups, debouncedSearchQuery]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            machineId: "",
            machineGroupId: "",
            machineName: "",
            description: "",
            isActive: true,
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Machine Group Name", align: "flex-start" },
            { label: "Machine Name", align: "flex-start" },
            { label: "Description", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [2, 2, 2, 1, 1],
        actionIndex: [{ editIndex: 4, delIndex: 5 }],
        handleAction,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    const dropmachine = useMemo(() => {
        return Array.isArray(machineGroups)
            ? machineGroups.filter(
                (v) => v.IsActive || v.GMachineID === initialValues.machineGroupId
            )
            : [];
    }, [machineGroups, initialValues.machineGroupId]);

    return (
        <AccessibleView name="container-machine" style={{ flex: 1 }}>
            <Card.Title
                title="Create Machine"
                titleStyle={[masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small, paddingVertical: fontSize === "large" ? 7 : 5 }]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Machine..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-machine"
                />
                <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { textAlign: 'center' }]}>Create Machine</Text>
                </Pressable>
            </AccessibleView>
            <Card.Content style={{ padding: 2, flex: 1 }}>
                {isLoadingMachines ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
            </Card.Content>

            <Machine_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
                dropmachine={dropmachine}
                machineGroup={machineGroups}
            />
        </AccessibleView>
    );
};

export default React.memo(MachineGroupScreen);
