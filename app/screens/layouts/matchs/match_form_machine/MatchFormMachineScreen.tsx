import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { TouchableOpacity, StyleSheet, View, Platform } from "react-native";
import axiosInstance from "@/config/axios";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import { LoadingSpinner, LoadingSpinnerTable, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useMutation, useQueryClient, useInfiniteQuery } from 'react-query';
import { useSelector } from "react-redux";
import { fetchMatchFormMchines, fetchSearchMatchFormMchine, SaveMatchFormMachine } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";
import { navigate } from "@/app/navigations/navigationUtils";
import { useFocusEffect } from "expo-router";
import { InitialValuesMatchFormMachine, MatchForm } from "@/typing/screens/MatchFormMachine";

const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));
const LazyMatch_form_machine_dialog = lazy(() => import("@/components/screens/Match_form_machine_dialog"));

const MatchFormMachineScreen = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesMatchFormMachine>({
        machineId: "",
        formId: "",
    });

    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize, responsive } = useRes();
    const { theme, darkMode } = useTheme();
    const queryClient = useQueryClient();
    const [matchForm, setMatchForm] = useState<MatchForm[]>([])

    const { isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['matchForm', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchMatchFormMchine(debouncedSearchQuery)
                : fetchMatchFormMchines(pageParam, 50);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 50 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat()
                setMatchForm(newItems);
            },
        }
    );

    useFocusEffect(
        useCallback(() => {
            return () => {
                remove()
                setMatchForm([])
            };
        }, [remove])
    );

    const handlePaginationChange = useCallback(() => {
        if (hasNextPage && !isFetching) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetching, fetchNextPage]);

    const mutation = useMutation(SaveMatchFormMachine, {
        onSuccess: (data) => {
            showSuccess(data.message);
            setIsVisible(false)
            queryClient.invalidateQueries('matchForm');
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

    const saveData = useCallback(async (values: InitialValuesMatchFormMachine, status: boolean) => {
        const data = {
            Prefix: state.PF_MatchFormMachine ?? "",
            MachineID: values.machineId,
            FormID: values.formId,
            Mode: status ? "edit" : "add"
        };

        mutation.mutate(data);
    }, [mutation]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "changeIndex") {
                navigate("Create_form", { formId: item });
            } else if (action === "preIndex") {
                navigate("Preview", { formId: item });
            } else if (action === "copyIndex") {
                navigate("Create_form", { formId: item, action: "copy" });
            } else if (action === "editIndex") {
                const response = await axiosInstance.post("MatchFormMachine/GetMatchFormMachine", {
                    MachineID: item,
                });
                const machineData = response.data.data[0] ?? {};
                setInitialValues({
                    machineId: machineData.MachineID ?? "",
                    formId: machineData.FormID ?? "",
                    machineName: machineData?.MachineName,
                    formName: machineData?.FormName
                });
                setIsVisible(true);
                setIsEditing(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeMatchFormMachine" : "DeleteMatchFormMachine";
                const response = await axiosInstance.post(`MatchFormMachine/${endpoint}`, { MachineID: item });
                showSuccess(String(response.data.message));
                queryClient.invalidateQueries('matchForm');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient, navigate]);

    const tableData = useMemo(() => {
        return matchForm.map((item) => [
            item.MachineName,
            item.FormName,
            item.FormID,
            item.FormID,
            item.FormID,
            item.MachineID,
        ])
    }, [matchForm]);

    const handleNewData = useCallback(() => {
        setInitialValues({
            machineId: "", formId: ""
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: state.Machine, align: "flex-start" },
            { label: state.Form, align: "flex-start" },
            { label: "Change", align: "center" },
            { label: "Copy", align: "center" },
            { label: "Preview", align: "center" },
            { label: "", align: "flex-end" }
        ],
        flexArr: [2, 2, 1, 1, 1, 1],
        actionIndex: [
            {
                changeIndex: 2,
                copyIndex: 3,
                preIndex: 4,
                editIndex: 5,
                delIndex: 6
            },
        ],
        handleAction,
        showMessage: [0, 1],
        searchQuery: debouncedSearchQuery,
        isFetching: isFetching
    }), [tableData, debouncedSearchQuery, handleAction, isFetching, state.Machine, state.Form]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            padding: 10,
            paddingHorizontal: 20
        },
        header: {
            fontSize: spacing.large,
            paddingVertical: fontSize === "large" ? 7 : 5,
            fontWeight: 'bold',
            color: theme.colors.onBackground
        },
        functionname: {
            textAlign: 'center'
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
                    boxShadow: `2px 5px 10px ${!darkMode ? 'rgba(0, 0, 0, 0.24)' : 'rgba(193, 214, 255, 0.56)'}`,
                },
            }),
        },
        containerSearch: {
            paddingHorizontal: 20,
            paddingVertical: 5,
            flexDirection: responsive === "small" ? "column" : 'row',
        },
        contentSearch: {
            flexDirection: responsive === "small" ? "column" : 'row',
        },
        containerTable: {
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center'
        }
    });

    return (
        <View id="container-checklist" style={styles.container}>
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Text style={[masterdataStyles.textBold, styles.header]}>{`List ${state.MatchFormMachine}` || "List"}</Text>
            </View>

            <Card.Content style={styles.cardcontent}>
                <View style={styles.containerSearch}>
                    <View style={styles.contentSearch}>
                        <Searchbar
                            placeholder={`Search ${state.MatchFormMachine}...`}
                            value={searchQuery}
                            onChange={setSearchQuery}
                            testId="search-match-form-machine"
                        />
                    </View>

                    <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>{`Create ${state.MatchFormMachine}`}</Text>
                    </TouchableOpacity>
                </View>

                <Suspense fallback={<LoadingSpinnerTable />}>
                    <LazyCustomtable {...customtableProps} handlePaginationChange={handlePaginationChange} />
                </Suspense>
            </Card.Content>

            {isVisible && (
                <View style={styles.containerTable}>
                    <Suspense fallback={<LoadingSpinner />}>
                        <LazyMatch_form_machine_dialog
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

export default MatchFormMachineScreen;

