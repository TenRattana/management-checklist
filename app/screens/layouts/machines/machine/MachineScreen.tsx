import React, { useState, useCallback, useMemo, useEffect } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import axiosInstance from "@/config/axios";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import { AccessibleView, Customtable, LoadingSpinner, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import Machine_dialog from "@/components/screens/Machine_dialog";
import { Machine } from '@/typing/type';
import { InitialValuesMachine } from '@/typing/value';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSelector } from "react-redux";
import { fetchMachines, fetchSearchMachines, saveMachine } from "@/app/services";

const MachineGroupScreen: React.FC = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesMachine>({
        machineId: "",
        machineGroupId: "",
        machineCode: "",
        formId: "",
        building: "",
        floor: "",
        area: "",
        machineName: "",
        description: "",
        isActive: true,
        disables: false
    });

    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();

    const [paginationInfo, setPaginationInfo] = useState({
        currentPage: 0,
        pageSize: 100,
    });

    const handlePaginationChange = (currentPage: number, pageSize: number) => {
        setPaginationInfo({ currentPage, pageSize });
    };

    const { data: machines = [], isLoading } = useQuery<Machine[], Error>(
        ['machines', paginationInfo, debouncedSearchQuery],
        () => debouncedSearchQuery ? fetchSearchMachines(debouncedSearchQuery) : fetchMachines(paginationInfo.currentPage, paginationInfo.pageSize),
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            keepPreviousData: true,
        }
    );

    const mutation = useMutation(saveMachine, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setIsVisible(false)
            queryClient.invalidateQueries('machines');
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

    const saveData = useCallback(async (values: InitialValuesMachine) => {
        const data = {
            Prefix: state.Machine ?? "",
            MachineID: values.machineId,
            GMachineID: values.machineGroupId ?? "",
            MachineCode: values.machineCode,
            Building: values.building,
            Floor: values.floor,
            Area: values.area,
            MachineName: values.machineName,
            Description: values.description,
            IsActive: values.isActive,
            Disables: values.disables,
            FormID: values.formId
        };
        mutation.mutate(data);
    }, [mutation, state]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post("Machine_service.asmx/GetMachine", { MachineID: item });
                const machineData = response.data.data[0] ?? {};
                setInitialValues({
                    machineId: machineData.MachineID ?? "",
                    machineGroupId: machineData.GMachineID ?? "",
                    machineName: machineData.MachineName ?? "",
                    formId: machineData.FormID ?? "",
                    machineCode: machineData.MachineCode ?? "",
                    building: machineData.Building ?? "",
                    floor: machineData.Floor ?? "",
                    area: machineData.Area ?? "",
                    description: machineData.Description ?? "",
                    isActive: Boolean(machineData.IsActive),
                    disables: Boolean(machineData.Disables),
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeMachine" : "DeleteMachine";
                const response = await axiosInstance.post(`Machine_service.asmx/${endpoint}`, { MachineID: item });
                showSuccess(String(response.data.message));
                queryClient.invalidateQueries('machines');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient]);

    const tableData = useMemo(() => {
        return machines.map((item) => [
            item.Disables,
            item.GMachineName || "",
            item.MachineName,
            item.Description,
            item.IsActive,
            item.MachineID,
        ]);
    }, [machines, debouncedSearchQuery]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            machineId: "",
            machineGroupId: "",
            machineCode: "",
            formId: "",
            building: "",
            floor: "",
            area: "",
            machineName: "",
            description: "",
            isActive: true,
            disables: false
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "", align: "flex-start" },
            { label: "Group Machine Name", align: "flex-start" },
            { label: "Machine Name", align: "flex-start" },
            { label: "Description", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [0, 2, 2, 2, 1, 1],
        actionIndex: [{ disables: 0, editIndex: 5, delIndex: 6 }],
        handleAction,
        showMessage: 2,
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

    const MemoMachine_dialog = React.memo(Machine_dialog)

    return (
        <AccessibleView name="container-machine" style={styles.container}>
            <Card.Title
                title="Create Machine"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Machine..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-machine"
                />
                <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>Create Machine</Text>
                </TouchableOpacity>
            </AccessibleView>
            <Card.Content style={styles.cardcontent}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} handlePaginationChange={handlePaginationChange} />}
            </Card.Content>

            {isVisible && (
                <MemoMachine_dialog
                    isVisible={isVisible}
                    setIsVisible={setIsVisible}
                    isEditing={isEditing}
                    initialValues={initialValues}
                    saveData={saveData}
                />
            )}
        </AccessibleView>
    );
});

export default MachineGroupScreen;
