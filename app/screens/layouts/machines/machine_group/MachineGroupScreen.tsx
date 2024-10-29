import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { LoadingSpinner, AccessibleView, Searchbar, Customtable, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Machine_group_dialog from "@/components/screens/Machine_group_dialog";
import { GroupMachine } from '@/typing/type';
import { InitialValuesGroupMachine } from '@/typing/value';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';

const MachineGroupScreen = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesGroupMachine>({
        machineGroupId: "",
        machineGroupName: "",
        description: "",
        isActive: true,
    });
    
    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();

    const fetchMachineGroups = async (): Promise<GroupMachine[]> => {
        console.time("Fetch Machine Groups");
        const response = await axiosInstance.post("GroupMachine_service.asmx/GetGroupMachines");
        console.timeEnd("Fetch Machine Groups");
        return response.data.data ?? [];
    };
    
    const saveGroupMachine = async (data: GroupMachine): Promise<{ message: string }> => {
        const response = await axiosInstance.post("GroupMachine_service.asmx/SaveGroupMachine", data);
        return response.data;
    };
    
    const { data: machineGroups = [], isLoading, isError, error } = useQuery<GroupMachine[], Error>(
        'machineGroups',
        fetchMachineGroups,
        {
            refetchOnWindowFocus: false,
            staleTime: 30000, // ข้อมูลจะถือว่าใหม่อยู่ 30 วินาที
            cacheTime: 60000, // ข้อมูลจะถูกเก็บใน cache 1 นาที
        }
    );

    console.log(isLoading);
    console.log(isError);
    console.log(error);
    console.log(machineGroups);
    
    const mutation = useMutation(saveGroupMachine, {
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries('machineGroups');
        },
        onError: handleError,
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300); // ลดเวลาลงเป็น 300 มิลลิวินาที

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const saveData = useCallback(async (values: InitialValuesGroupMachine) => {
        const data = {
            Prefix: state.GroupMachine ?? "",
            GMachineID: values.machineGroupId ?? "",
            GMachineName: values.machineGroupName,
            Description: values.description,
            IsActive: values.isActive,
        };

        mutation.mutate(data);
    }, [mutation]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post("GroupMachine_service.asmx/GetGroupMachine", { GMachineID: item });
                const machineGroupData = response.data.data[0] ?? {};
                setInitialValues({
                    machineGroupId: machineGroupData.GMachineID ?? "",
                    machineGroupName: machineGroupData.GMachineName ?? "",
                    description: machineGroupData.Description ?? "",
                    isActive: Boolean(machineGroupData.IsActive),
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeGroupMachine" : "DeleteGroupMachine";
                const response = await axiosInstance.post(`GroupMachine_service.asmx/${endpoint}`, { GMachineID: item });
                showSuccess(String(response.data.message));
                queryClient.invalidateQueries('machineGroups');
            }
        } catch (error) {
            handleError(error);
        }
    }, [queryClient, handleError]);

    const tableData = useMemo(() => {
        return machineGroups.map(item => [
            item.GMachineName,
            item.Description,
            item.IsActive,
            item.GMachineID,
        ]);
    }, [machineGroups, debouncedSearchQuery]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            machineGroupId: "",
            machineGroupName: "",
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
            { label: "Description", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [3, 3, 1, 1, 1],
        actionIndex: [{ editIndex: 3, delIndex: 4 }],
        handleAction,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError) {
        return <Text>Error: {error.message}</Text>;
    }

    return (
        <AccessibleView name="container-groupmachine" style={{ flex: 1 }}>
            <Card.Title
                title="Create Group Machine"
                titleStyle={[masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small, paddingVertical: fontSize === "large" ? 7 : 5 }]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Machine Group..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-machine-group"
                />
                <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { textAlign: 'center' }]}>Create Group Machine</Text>
                </Pressable>
            </AccessibleView>
            <Card.Content style={{ padding: 2, flex: 1 }}>
                <Customtable {...customtableProps} />
            </Card.Content>

            <Machine_group_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />
        </AccessibleView>
    );
};

export default React.memo(MachineGroupScreen);
