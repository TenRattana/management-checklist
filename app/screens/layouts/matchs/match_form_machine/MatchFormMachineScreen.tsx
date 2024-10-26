import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar, Text } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Match_form_machine_dialog from "@/components/screens/Match_form_machine_dialog";
import { Form, MatchForm, Machine } from '@/typing/type'
import { InitialValuesMatchFormMachine } from '@/typing/value'
import { useFocusEffect } from "expo-router";

const MatchFormMachineScreen = ({ navigation }: any) => {
    const [forms, setForm] = useState<Form[]>([]);
    const [machine, setMachine] = useState<Machine[]>([]);
    const [matchForm, setMatchForm] = useState<MatchForm[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesMatchFormMachine>({
        machineId: "",
        formId: "",
    });

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const [machineResponse, formResponse, matchFormResponse] = await Promise.all([
                axiosInstance.post("Machine_service.asmx/GetMachines"),
                axiosInstance.post("Form_service.asmx/GetForms"),
                axiosInstance.post("MatchFormMachine_service.asmx/GetMatchFormMachines"),
            ]);
            setMachine(machineResponse.data.data ?? []);
            setForm(formResponse.data.data ?? []);
            setMatchForm(matchFormResponse.data.data ?? []);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const saveData = useCallback(async (values: InitialValuesMatchFormMachine, status: boolean) => {
        const data = {
            MachineID: values.machineId,
            FormID: values.formId,
            Mode: status ? "edit" : "add"
        };

        try {
            const response = await axiosInstance.post("MatchFormMachine_service.asmx/SaveMatchFormMachine", data);
            setIsVisible(!response.data.status);
            showSuccess(String(response.data.message));

            await fetchData();
        } catch (error) {
            handleError(error);
        }
    }, [fetchData, handleError]);

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
                });
                setIsVisible(true);
                setIsEditing(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeMatchFormMachine" : "DeleteMatchFormMachine";
                const response = await axiosInstance.post(`MatchFormMachine_service.asmx/${endpoint}`, { MachineID: item });
                showSuccess(String(response.data.message));

                await fetchData();
            }
        } catch (error) {
            handleError(error);
        }
    }, [fetchData, handleError]);

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

    const dropmachine = useMemo(() => {
        return Array.isArray(machine)
            ? machine.filter(
                (v) => v.IsActive || v.MachineID === initialValues.machineId
            )
            : [];
    }, [machine, initialValues.machineId]);

    const dropform = useMemo(() => {
        return Array.isArray(forms)
            ? forms.filter(
                (v) => v.IsActive || v.FormID === initialValues.formId
            )
            : [];
    }, [forms, initialValues.formId]);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Machine Name", align: "flex-start" },
            { label: "Form Name", align: "flex-start" },
            { label: "Change Form", align: "center" },
            { label: "Copy Template", align: "center" },
            { label: "Preview", align: "center" },
            { label: "", align: "flex-end" }
        ],
        flexArr: [2, 3, 1, 1, 1, 1],
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
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    return (
        <AccessibleView name="container-checklist" style={{ flex: 1 }}>
            <Card.Title
                title="Create Match Machine & Form"
                titleStyle={[masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small, paddingVertical: fontSize === "large" ? 7 : 5 }]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Macht Form Machine..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-match-form-machine"
                />
                <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textBold, { textAlign: 'center' }]}>Create Match Machine & Form</Text>
                </Pressable>
            </AccessibleView>
            <Card.Content style={{ padding: 2, flex: 1 }}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
            </Card.Content>

            <Match_form_machine_dialog
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                isEditing={isEditing}
                initialValues={initialValues}
                saveData={saveData}
                machine={machine}
                dropmachine={dropmachine}
                forms={forms}
                dropform={dropform}
            />
        </AccessibleView>
    );
};

export default React.memo(MatchFormMachineScreen);

