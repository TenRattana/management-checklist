import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import axiosInstance from "@/config/axios";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import { Customtable, AccessibleView, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import Match_form_machine_dialog from "@/components/screens/Match_form_machine_dialog";
import { MatchForm } from '@/typing/type'
import { InitialValuesMatchFormMachine } from '@/typing/value'
import { useMutation, useQueryClient, useInfiniteQuery } from 'react-query';
import { useSelector } from "react-redux";
import { fetchMatchFormMchines, fetchSearchMatchFormMchine, SaveMatchFormMachine } from "@/app/services";

const MatchFormMachineScreen = React.memo(({ navigation }: any) => {
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
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();
    const [matchForm, setMatchForm] = useState<MatchForm[]>([])

    const handlePaginationChange = () => {
        hasNextPage && !isFetching && fetchNextPage()
    };

    const { data, isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['matchForm', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchMatchFormMchine(debouncedSearchQuery)
                : fetchMatchFormMchines(pageParam, 50);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
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

    useEffect(() => {
        if (debouncedSearchQuery === "") {
            setMatchForm([])
            remove()
        } else {
            setMatchForm([])
        }
    }, [debouncedSearchQuery, remove])

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
            Prefix: state.MatchFormMachine ?? "",
            MachineID: values.machineId,
            FormID: values.formId,
            Mode: status ? "edit" : "add"
        };

        mutation.mutate(data);
    }, [mutation]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "changeIndex") {
                navigation.navigate("Create_form", { formId: item });
            } else if (action === "preIndex") {
                navigation.navigate("Preview", { formId: item });
            } else if (action === "copyIndex") {
                navigation.navigate("Create_form", { formId: item, action: "copy" });
            } else if (action === "editIndex") {
                const response = await axiosInstance.post("MatchFormMachine_service.asmx/GetMatchFormMachine", {
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
                const response = await axiosInstance.post(`MatchFormMachine_service.asmx/${endpoint}`, { MachineID: item });
                showSuccess(String(response.data.message));
                queryClient.invalidateQueries('matchForm');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient]);

    const tableData = useMemo(() => {
        return matchForm.map((item) => [
            item.MachineName,
            item.FormName,
            item.FormID,
            item.FormID,
            item.FormID,
            item.MachineID,
        ])
    }, [matchForm, debouncedSearchQuery]);

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
            { label: "Machine Name", align: "flex-start" },
            { label: "Form Name", align: "flex-start" },
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

    const MemoMatch_form_machine_dialog = React.memo(Match_form_machine_dialog)

    return (
        <AccessibleView name="container-checklist" style={styles.container}>
            <Card.Title
                title="Create Match Machine & Form"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Macht Form Machine..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-match-form-machine"
                />
                <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>Create Match Machine & Form</Text>
                </TouchableOpacity>
            </AccessibleView>
            <Card.Content style={styles.cardcontent}>
                <Customtable {...customtableProps} handlePaginationChange={handlePaginationChange} />
            </Card.Content>

            {isVisible && (
                <MemoMatch_form_machine_dialog
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

export default MatchFormMachineScreen;

