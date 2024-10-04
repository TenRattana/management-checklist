import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { Customtable, LoadingSpinner, Searchbar } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Machine_group_dialog from "@/components/screens/Machine_group_dialog";
import { MachineGroup } from '@/typing/type'
import { InitialValuesMachineGroup } from '@/typing/value'

const MachineGroupScreen = () => {
    const [machineGroup, setMachineGroup] = useState<MachineGroup[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
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

    const { showSuccess, showError } = useToast();
    const { spacing } = useRes();

    const errorMessage = useCallback((error: unknown) => {
        let errorMessage: string | string[];

        if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.errors ?? ["Something went wrong!"];
        } else if (error instanceof Error) {
            errorMessage = [error.message];
        } else {
            errorMessage = ["An unknown error occurred!"];
        }

        showError(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
    }, [showError]);

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const response = await axiosInstance.post("MachineGroup_service.asmx/GetMachineGroups");
            setMachineGroup(response.data.data ?? []);
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            errorMessage(error);
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
            errorMessage(error);
        }
    };

    const tableData = useMemo(() => {
        return machineGroup.map(item => [
            item.MGroupName,
            item.Description,
            item.IsActive,
            item.MGroupID,
            item.MGroupID,
        ]);
    }, [machineGroup]);

    const tableHead = [
        { label: "Machine Group Name", align: "flex-start" },
        { label: "Description", align: "flex-start" },
        { label: "Change Status", align: "center" },
        { label: "Edit", align: "center" },
        { label: "Delete", align: "center" },
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
        flexArr: [2, 3, 1, 1, 1],
        actionIndex,
        handleAction,
        searchQuery,
    };

    return (
        <ScrollView>
            <Card>
                <Card.Title
                    titleStyle={[masterdataStyles.text, masterdataStyles.textBold, { fontSize: spacing.large, textAlign: "center", marginTop: 30, paddingTop: 10, marginBottom: 30 }]}
                    title="List Group Machine"
                />
                <Card.Content>
                    <Searchbar
                        viewProps={
                            <Pressable
                                onPress={handelNewData}
                                style={[masterdataStyles.button, masterdataStyles.backMain, { marginHorizontal: 0 }]}
                            >
                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Create Group Machine</Text>
                            </Pressable>
                        }
                        searchQuery={searchQuery}
                        handleChange={setSearchQuery}
                    />
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <Customtable {...customtableProps} />
                    )}
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
