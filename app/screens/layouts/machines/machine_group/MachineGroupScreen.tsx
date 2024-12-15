import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import { LoadingSpinner, AccessibleView, Searchbar, Customtable, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import Machine_group_dialog from "@/components/screens/Machine_group_dialog";
import { GroupMachine } from '@/typing/type';
import { InitialValuesGroupMachine } from '@/typing/value';
import { useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { fetchMachineGroups, saveGroupMachine } from "@/app/services";
import axiosInstance from "@/config/axios";

const MachineGroupScreen = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesGroupMachine>({
        machineGroupId: "",
        machineGroupName: "",
        description: "",
        isActive: true,
        disables: false
    });
    const [machineGroups, setMachineGroups] = useState<GroupMachine[]>([])
    const [isLoading, setLoading] = useState<boolean>(true)
    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();

    const fetchData = async () => {
        try {
            const data = await fetchMachineGroups();
            setMachineGroups(data);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const mutation = useMutation(saveGroupMachine, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setIsVisible(false)
            queryClient.invalidateQueries('machineGroups');
            fetchData();
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

    const saveData = useCallback(async (values: InitialValuesGroupMachine) => {
        const data = {
            Prefix: state.GroupMachine ?? "",
            GMachineID: values.machineGroupId ?? "",
            GMachineName: values.machineGroupName,
            Description: values.description,
            IsActive: values.isActive,
        };

        mutation.mutate(data);
    }, [mutation, state]);

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
                    disables: Boolean(machineGroupData.Disables)
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeGroupMachine" : "DeleteGroupMachine";
                const response = await axiosInstance.post(`GroupMachine_service.asmx/${endpoint}`, { GMachineID: item });
                showSuccess(String(response.data.message));
                await fetchData();
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient]);

    const tableData = useMemo(() => {
        return machineGroups.map(item => [
            item.Disables,
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
            disables: false,
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "", align: "flex-start" },
            { label: "Group Machine Name", align: "flex-start" },
            { label: "Description", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [0, 3, 3, 1, 1, 1],
        actionIndex: [{ disables: 0, editIndex: 4, delIndex: 5 }],
        showMessage: 1,
        handleAction,
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

    const MemoMachine_group_dialog = React.memo(Machine_group_dialog)

    return (
        <AccessibleView name="container-groupmachine" style={styles.container}>
            <Card.Title
                title="Create Group Machine"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Machine Group..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-machine-group"
                />
                <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>Create Group Machine</Text>
                </TouchableOpacity>
            </AccessibleView>
            <Card.Content style={styles.cardcontent}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
            </Card.Content>

            <MemoMachine_group_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
            />
        </AccessibleView>
    );
});

export default MachineGroupScreen;
