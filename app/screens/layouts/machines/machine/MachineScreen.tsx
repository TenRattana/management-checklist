import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { AccessibleView, Customtable, LoadingSpinner } from "@/components";
import { Card, Divider, Searchbar } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Machine_dialog from "@/components/screens/Machine_dialog";
import { Machine, MachineGroup } from '@/typing/type';
import { InitialValuesMachine } from '@/typing/value';
import { useFocusEffect } from "expo-router";

const MachineGroupScreen = () => {
    const [machine, setMachine] = useState<Machine[]>([]);
    const [machineGroup, setMachineGroup] = useState<MachineGroup[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
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

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const [machineResponse, machineGroupResponse] = await Promise.all([
                axios.post("Machine_service.asmx/GetMachines"),
                axios.post("MachineGroup_service.asmx/GetMachineGroups"),
            ]);
            setMachine(machineResponse.data.data ?? []);
            setMachineGroup(machineGroupResponse.data.data ?? []);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
            return () => { };
        }, [])
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const saveData = async (values: InitialValuesMachine) => {
        setIsLoadingButton(true);
        const data = {
            MachineID: values.machineId,
            MGroupID: values.machineGroupId ?? "",
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
        } finally {
            setIsLoadingButton(false);
        }
    };

    const handleAction = async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post("Machine_service.asmx/GetMachine", { MachineID: item });
                const machineData = response.data.data[0] ?? {};
                setInitialValues({
                    machineId: machineData.MachineID ?? "",
                    machineGroupId: machineData.MGroupID ?? "",
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
    };
    
    const fieldsToFilter: (keyof Machine)[] = ['MachineName', 'Description'];

    const tableData = useMemo(() => {
        return machine
            .filter(item =>
                fieldsToFilter.some(field => {
                    const value = item[field];
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
                    }
                    return false;
                }) ||
                machineGroup.some(group =>
                    group.MGroupName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) &&
                    group.MGroupID === item.MGroupID
                )
            )
            .map((item) => {
                return [
                    machineGroup.find((group) => group.MGroupID === item.MGroupID)?.MGroupName || "",
                    item.MachineName,
                    item.Description,
                    item.IsActive,
                    item.MachineID,
                ];
            });
    }, [machine, machineGroup, debouncedSearchQuery]);

    const tableHead = [
        { label: "Machine Group Name", align: "flex-start" },
        { label: "Machine Name", align: "flex-start" },
        { label: "Description", align: "flex-start" },
        { label: "Status", align: "center" },
        { label: "", align: "flex-end" },
    ];

    const actionIndex = [{ editIndex: 4, delIndex: 5 }];

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

    const customtableProps = {
        Tabledata: tableData,
        Tablehead: tableHead,
        flexArr: [2, 2, 2, 1, 1],
        actionIndex,
        handleAction,
        searchQuery,
    };

    const dropmachine = useMemo(() => {
        return Array.isArray(machineGroup)
            ? machineGroup.filter(
                (v) => v.IsActive || v.MGroupID === initialValues.machineGroupId
            )
            : [];
    }, [machineGroup, initialValues.machineGroupId]);

    const handleChange = (text: string) => {
        setSearchQuery(text);
    };

    return (
        <ScrollView style={{ paddingHorizontal: 15 }}>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold,
            { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>Create Machine
            </Text>
            <Divider style={{ marginBottom: 20 }} />
            <Card style={{ borderRadius: 5 }}>
                <AccessibleView style={{ paddingVertical: 20, flexDirection: 'row' }}>
                    <Searchbar
                        placeholder="Search Machine..."
                        value={searchQuery}
                        onChangeText={handleChange}
                        style={masterdataStyles.searchbar}
                        iconColor="#007AFF"
                        placeholderTextColor="#a0a0a0"
                    />
                    <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.textBold, masterdataStyles.textLight]}>Create Machine</Text>
                    </Pressable>
                </AccessibleView>
                <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
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
        </ScrollView>
    );
};

export default React.memo(MachineGroupScreen);
