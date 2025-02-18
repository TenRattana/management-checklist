import React, {
    useState,
    useCallback,
    useMemo,
    useEffect,
    lazy,
    Suspense,
} from "react";
import { TouchableOpacity, StyleSheet, View, Platform } from "react-native";
import axiosInstance from "@/config/axios";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import {
    LoadingSpinner,
    LoadingSpinnerTable,
    Searchbar,
    Text,
} from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useMutation, useQueryClient, useInfiniteQuery } from "react-query";
import { useSelector } from "react-redux";
import {
    fetchMachines,
    fetchSearchMachines,
    saveMachine,
} from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { useFocusEffect } from "expo-router";
import { InitialValuesMachine, Machine } from "@/typing/screens/Machine";

const LazyCustomtable = lazy(() =>
    import("@/components").then((module) => ({ default: module.Customtable }))
);
const LazyMachine_dialog = lazy(
    () => import("@/components/screens/Machine_dialog")
);

const MachineGroupScreen = React.memo(() => {
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
        disables: false,
        delete: false,
    });

    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize, responsive } = useRes();
    const { theme, darkMode } = useTheme();
    const queryClient = useQueryClient();
    const [machines, setMachine] = useState<Machine[]>([]);

    const { isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ["machines", debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchMachines(debouncedSearchQuery)
                : fetchMachines(pageParam, 1000);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 1000 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat();
                setMachine(newItems);
            },
        }
    );

    useFocusEffect(
        useCallback(() => {
            return () => {
                remove();
                setMachine([]);
            };
        }, [remove])
    );

    const handlePaginationChange = useCallback(() => {
        if (hasNextPage && !isFetching) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetching, fetchNextPage]);

    const mutation = useMutation(saveMachine, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setIsVisible(false);
            queryClient.invalidateQueries("machines");
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

    const saveData = useCallback(
        async (values: InitialValuesMachine) => {
            const data = {
                Prefix: state.PF_Machine ?? "",
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
                FormID: values.formId,
            };
            mutation.mutate(data);
        },
        [mutation, state]
    );

    const handleAction = useCallback(
        async (action?: string, item?: string) => {
            try {
                if (action === "editIndex") {
                    const response = await axiosInstance.post(`Machines/GetMachine/${item}`);
                    const machineData = response.data.data[0] ?? {};
                    setInitialValues({
                        machineId: machineData.MachineID ?? "",
                        machineGroupId: machineData.GMachineID ?? "",
                        machineGroupName: machineData.GMachineName ?? "",
                        machineName: machineData.MachineName ?? "",
                        formId: machineData.FormID ?? "",
                        machineCode: machineData.MachineCode ?? "",
                        building: machineData.Building ?? "",
                        floor: machineData.Floor ?? "",
                        area: machineData.Area ?? "",
                        description: machineData.Description ?? "",
                        isActive: Boolean(machineData.IsActive),
                        disables: Boolean(machineData.Disables),
                        delete: Boolean(machineData.Deletes),
                    });
                    setIsEditing(true);
                    setIsVisible(true);
                } else {
                    const endpoint = action === "activeIndex" ? "ChangeMachine" : "DeleteMachine";
                    const response = await axiosInstance.post(`Machines/${endpoint}`, { MachineID: item });
                    showSuccess(String(response.data.message));
                    queryClient.invalidateQueries("machines");
                }
            } catch (error) {
                handleError(error);
            }
        },
        [handleError, queryClient]
    );

    const tableData = useMemo(() => {
        return machines.map((item) => [
            item.Disables,
            item.Deletes,
            item.GMachineName || "",
            item.MachineName,
            item.MachineCode,
            item.Description,
            item.FormID ? "Used" : "Null",
            item.IsActive,
            item.MachineID,
        ]);
    }, [machines]);

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
            disables: false,
            delete: false,
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(
        () => ({
            Tabledata: tableData,
            Tablehead: [
                { label: "", align: "flex-start" },
                { label: "", align: "flex-start" },
                { label: state.GroupMachine, align: "flex-start" },
                { label: state.Machine, align: "flex-start" },
                { label: "Code", align: "flex-start" },
                { label: "Description", align: "flex-start" },
                { label: "Used Form", align: "center" },
                { label: "Status", align: "center" },
                { label: "", align: "center" },
            ],
            flexArr: [0, 0, 1, 1.5, 1, 1.5, 0.5, 0.5, 1],
            actionIndex: [{ disables: 0, delete: 1, editIndex: 8, delIndex: 9 }],
            handleAction,
            showMessage: 3,
            searchQuery: debouncedSearchQuery,
            isFetching: isFetching,
        }),
        [tableData, debouncedSearchQuery, handleAction, state.GroupMachine, state.Machine, isFetching]
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            padding: 10,
            paddingHorizontal: 20,
        },
        header: {
            fontSize: spacing.large,
            paddingVertical: fontSize === "large" ? 7 : 5,
            fontWeight: "bold",
            color: theme.colors.onBackground,
        },
        functionname: {
            textAlign: "center",
        },
        cardcontent: {
            marginTop: 10,
            paddingVertical: 10,
            paddingHorizontal: 0,
            flex: 1,
            borderRadius: 10,
            backgroundColor: theme.colors.background,
            ...Platform.select({
                ios: {
                    shadowColor: theme.colors.onBackground,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                },
                android: {
                    elevation: 6,
                },
                web: {
                    boxShadow: `2px 5px 10px ${!darkMode ? "rgba(0, 0, 0, 0.24)" : "rgba(193, 214, 255, 0.56)"
                        }`,
                },
            }),
        },
        containerSearch: {
            paddingHorizontal: 20,
            paddingVertical: 5,
            flexDirection: responsive === "small" ? "column" : "row",
        },
        contentSearch: {
            flexDirection: responsive === "small" ? "column" : "row",
        },
        containerTable: {
            flex: 1,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
        },
    });

    return (
        <View id="container-machine" style={styles.container}>
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Text style={[masterdataStyles.textBold, styles.header]}>
                    {`List ${state.Machine}` || "List"}
                </Text>
            </View>

            <Card.Content style={styles.cardcontent}>
                <View style={styles.containerSearch}>
                    <View style={styles.contentSearch}>
                        <Searchbar
                            placeholder={`Search ${state.Machine}...`}
                            value={searchQuery}
                            onChange={setSearchQuery}
                            testId="search-machine"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleNewData}
                        style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}
                    >
                        <Text
                            style={[
                                masterdataStyles.textFFF,
                                masterdataStyles.textBold,
                                styles.functionname,
                            ]}
                        >{`Create ${state.Machine}`}</Text>
                    </TouchableOpacity>
                </View>

                <Suspense fallback={<LoadingSpinnerTable />}>
                    <LazyCustomtable
                        {...customtableProps}
                        handlePaginationChange={handlePaginationChange}
                    />
                </Suspense>
            </Card.Content>

            {isVisible && (
                <View style={styles.containerTable}>
                    <Suspense fallback={<LoadingSpinner />}>
                        <LazyMachine_dialog
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
