import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView } from "@/components";
import { Card, Divider, Searchbar } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Machine_group_dialog from "@/components/screens/Machine_group_dialog";
import { MachineGroup } from '@/typing/type'
import { InitialValuesMachineGroup } from '@/typing/value'
import { useFocusEffect } from "expo-router";

const MachineGroupScreen = () => {
    const [machineGroup, setMachineGroup] = useState<MachineGroup[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesMachineGroup>({
        machineGroupId: "",
        machineGroupName: "",
        description: "",
        isActive: true,
    });
    const masterdataStyles = useMasterdataStyles();
    console.log("MachineGroupScreen");

    const { showSuccess, handleError } = useToast();
    const { spacing } = useRes();

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const response = await axiosInstance.post("MachineGroup_service.asmx/GetMachineGroups");
            setMachineGroup(response.data.data ?? []);
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

    const saveData = async (values: InitialValuesMachineGroup) => {
        setIsLoadingButton(true);
        const data = {
            MGroupID: values.machineGroupId ?? "",
            MGroupName: values.machineGroupName,
            Description: values.description,
            isActive: values.isActive,
        };

        try {
            const response = await axiosInstance.post("MachineGroup_service.asmx/SaveMachineGroup", data);
            setIsVisible(!response.data.status);
            showSuccess(String(response.data.message));

            await fetchData()
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoadingButton(false);
        }
    };

    const handleAction = async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post("MachineGroup_service.asmx/GetMachineGroup", { MGroupID: item });
                const machineGroupData = response.data.data[0] ?? {};
                setInitialValues({
                    machineGroupId: machineGroupData.MGroupID ?? "",
                    machineGroupName: machineGroupData.MGroupName ?? "",
                    description: machineGroupData.Description ?? "",
                    isActive: Boolean(machineGroupData.IsActive),
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeMachineGroup" : "DeleteMachineGroup";
                const response = await axiosInstance.post(`MachineGroup_service.asmx/${endpoint}`, { MGroupID: item });
                showSuccess(String(response.data.message));

                await fetchData()
            }
        } catch (error) {
            handleError(error);
        }
    };

    const tableData = useMemo(() => {
        return machineGroup.map(item => [
            item.MGroupName,
            item.Description,
            item.IsActive,
            item.MGroupID,
        ]);
    }, [machineGroup, debouncedSearchQuery]);

    const tableHead = [
        { label: "Machine Group Name", align: "flex-start" },
        { label: "Description", align: "flex-start" },
        { label: "Status", align: "center" },
        { label: "", align: "flex-end" },
    ];

    const actionIndex = [{ editIndex: 3, delIndex: 4 }];

    const handelNewData = useCallback(() => {
        setInitialValues({
            machineGroupId: "",
            machineGroupName: "",
            description: "",
            isActive: true,
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = {
        Tabledata: tableData,
        Tablehead: tableHead,
        flexArr: [3, 3, 1, 1, 1],
        actionIndex,
        handleAction,
        searchQuery: debouncedSearchQuery,
    };

    const handleChange = (text: string) => {
        setSearchQuery(text);
    };

    return (
        <ScrollView style={{ paddingHorizontal: 15 }}>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold,
            { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>Create Group Machine
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
                    <Pressable onPress={handelNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.textBold, masterdataStyles.textLight]}>Create Group Machine</Text>
                    </Pressable>
                </AccessibleView>
                <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
                </Card.Content>
            </Card>

            <Machine_group_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />

        </ScrollView>
    );
};

export default React.memo(MachineGroupScreen);
