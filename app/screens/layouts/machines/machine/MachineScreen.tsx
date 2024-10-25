import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { AccessibleView, Customtable, LoadingSpinner, Searchbar, Text } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Machine_dialog from "@/components/screens/Machine_dialog";
import { Machine, GroupMachine } from '@/typing/type';
import { InitialValuesMachine } from '@/typing/value';
import { useFocusEffect } from "expo-router";

const MachineGroupScreen = () => {
    const [machine, setMachine] = useState<Machine[]>([]);
    const [machineGroup, setMachineGroup] = useState<GroupMachine[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
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
    const { spacing } = useRes();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        let isMounted = true;

        try {
            const [machineResponse, machineGroupResponse] = await Promise.all([
                axiosInstance.post("Machine_service.asmx/GetMachines"),
                axiosInstance.post("GroupMachine_service.asmx/GetGroupMachines"),
            ]);
            if (isMounted) {
                setMachine(machineResponse.data.data ?? []);
                setMachineGroup(machineGroupResponse.data.data ?? []);
            }
        } catch (error) {
            handleError(error);
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
        return () => { isMounted = false };
    }, [handleError]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

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
            isActive: values.isActive,
        };

        try {
            const response = await axiosInstance.post("Machine_service.asmx/SaveMachine", data);
            setIsVisible(!response.data.status);
            showSuccess(String(response.data.message));

            await fetchData();
        } catch (error) {
            handleError(error);
        }
    }, [fetchData, handleError]);

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
                const response = await axiosInstance.post(`Machine_service.asmx/${endpoint}`, { MachineID: item });
                showSuccess(String(response.data.message));

                await fetchData();
            }
        } catch (error) {
            handleError(error);
        }
    }, [fetchData, handleError]);

    const tableData = useMemo(() => {
        return machine.map((item) => [
            machineGroup.find((group) => group.GMachineID === item.GMachineID)?.GMachineName || "",
            item.MachineName,
            item.Description,
            item.IsActive,
            item.MachineID,
        ])
    }, [machine, machineGroup, debouncedSearchQuery]);

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
        return Array.isArray(machineGroup)
            ? machineGroup.filter(
                (v) => v.IsActive || v.GMachineID === initialValues.machineGroupId
            )
            : [];
    }, [machineGroup, initialValues.machineGroupId]);

    return (
        <AccessibleView name="container-mahine">
            <Card style={[{ borderRadius: 0, flex: 1 }]}>
                <Card.Title
                    title="Create Machine"
                    titleStyle={[masterdataStyles.text, masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small - 10 }]}
                />
                {/* <Divider/> */}
                <View id="container-search" style={masterdataStyles.containerSearch}>
                    <Searchbar
                        placeholder="Search Machine..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                        testId="search-machine"
                    />
                    <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.textBold, { textAlign: 'center' }]}>Create Machine</Text>
                    </Pressable>
                </View>
                <Card.Content style={{ padding: 2, paddingVertical: 10, flex: 1 }}>
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
                </Card.Content>
            </Card>

            <Machine_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
                dropmachine={dropmachine}
                machineGroup={machineGroup}
            />
        </AccessibleView>
    );
};

export default React.memo(MachineGroupScreen);
