import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import { LoadingSpinner, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { GroupMachine } from '@/typing/type';
import { InitialValuesGroupMachine } from '@/typing/value';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { fetchMachineGroups, fetchSearchMachineGroups, saveGroupMachine } from "@/app/services";
import axiosInstance from "@/config/axios";
import { useTheme } from "@/app/contexts/useTheme";
import { useFocusEffect } from "expo-router";

const LazyMachine_group_dialog = lazy(() => import("@/components/screens/Machine_group_dialog"));
const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

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
    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const { theme } = useTheme();
    const queryClient = useQueryClient();
    const [machineGroup, setMachineGroup] = useState<GroupMachine[]>([]);

    const { data, isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['machineGroups', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchMachineGroups(debouncedSearchQuery)
                : fetchMachineGroups(pageParam, 50);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 50 ? allPages.length : undefined;
            },
            onSuccess: (newData) => {
                const newItems = newData.pages.flat();
                setMachineGroup(newItems);
            },
        }
    );

    useFocusEffect(
        useCallback(() => {
            return () => {
                remove()
                setMachineGroup([])
            };
        }, [])
    );

    const handlePaginationChange = useCallback(() => {
        if (hasNextPage && !isFetching) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetching, fetchNextPage]);

    const mutation = useMutation(saveGroupMachine, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setIsVisible(false);
            queryClient.invalidateQueries('machineGroups');
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
            Prefix: state.PF_GroupMachine ?? "",
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
                queryClient.invalidateQueries('machineGroups');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient]);

    const tableData = useMemo(() => {
        return machineGroup.map(item => [
            item.Disables,
            item.Deletes,
            item.GMachineName,
            item.Description,
            item.IsActive,
            item.GMachineID,
        ]);
    }, [machineGroup]);

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
            { label: "", align: "flex-start" },
            { label: state.GroupMachine, align: "flex-start" },
            { label: "Description", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "", align: "flex-end" },
        ],
        flexArr: [0, 0, 3, 3, 1, 1, 1],
        actionIndex: [{ disables: 0, delete: 1, editIndex: 5, delIndex: 6 }],
        showMessage: 2,
        handleAction,
        searchQuery: debouncedSearchQuery,
        isFetching: isFetching
    }), [tableData, debouncedSearchQuery, handleAction, state.GroupMachine, isFetching]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background
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
    });

    return (
        <View id="container-groupmachine" style={styles.container}>
            <Card.Title
                title={`List ${state.GroupMachine}` || "List"}
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder={`Search ${state.GroupMachine}...`}
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-machine-group"
                />
                <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>{`Create ${state.GroupMachine}`}</Text>
                </TouchableOpacity>
            </View>

            <Card.Content style={styles.cardcontent}>
                <Suspense fallback={<LoadingSpinner />}>
                    <LazyCustomtable {...customtableProps} handlePaginationChange={handlePaginationChange} />
                </Suspense>
            </Card.Content>

            {isVisible && (
                <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                    <Suspense fallback={<LoadingSpinner />}>
                        <LazyMachine_group_dialog
                            isVisible={isVisible}
                            setIsVisible={setIsVisible}
                            isEditing={isEditing}
                            initialValues={initialValues}
                            saveData={saveData}
                        />
                    </Suspense>
                </View>
            )}
        </View>
    );
});

export default MachineGroupScreen;
