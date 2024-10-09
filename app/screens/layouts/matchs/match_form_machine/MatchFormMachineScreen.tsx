import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView } from "@/components";
import { Card, Divider, Searchbar } from "react-native-paper";
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
    const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValuesMatchFormMachine>({
        machineId: "",
        formId: "",
    });

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing } = useRes();

    const fetchData = async () => {
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

    const saveData = async (values: InitialValuesMatchFormMachine) => {
        setIsLoadingButton(true);

        const data = {
            MachineID: values.machineId,
            FormID: values.formId,
            Mode: isEditing ? "edit" : "add"
        };

        try {
            const response = await axiosInstance.post("MatchFormMachine_service.asmx/SaveMatchFormMachine", data);
            setIsVisible(!response.data.status);
            showSuccess(String(response.data.message));

            await fetchData();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoadingButton(false);
        }
    };

    const handleAction = async (action?: string, item?: string) => {
        try {
            if (action === "changeIndex") {
                navigation.navigate("Create_form", { formId: item });
            } else if (action === "preIndex") {
                navigation.navigate("Preview", { formId: item });
            } else if (action === "copyIndex") {
                navigation.navigate("Create_form", { formId: item, action: "copy" });
            } else if (action === "editIndex") {
                const response = await axios.post("MatchFormMachine_service.asmx/GetMatchFormMachine", {
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
    };

    const fieldsToFilter: (keyof MatchForm)[] = ['MachineName', 'FormName'];

    const tableData = useMemo(() => {
        return matchForm
            .filter(item =>
                fieldsToFilter.some(field => {
                    const value = item[field];
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
                    }
                    return false;
                }))
            .map((item) => {
                return [
                    item.MachineName,
                    item.FormName,
                    item.FormID,
                    item.FormID,
                    item.FormID,
                    item.MachineID,
                ];
            })
    }, [machine, debouncedSearchQuery]);

    const tableHead = [
        { label: "Machine Name", align: "flex-start" },
        { label: "Form Name", align: "flex-start" },
        { label: "Change Form", align: "center" },
        { label: "Copy Template", align: "center" },
        { label: "Preview", align: "center" },
        { label: "", align: "flex-end" }
    ];

    const actionIndex = [
        {
            changeIndex: 2,
            copyIndex: 3,
            preIndex: 4,
            editIndex: 5,
            delIndex: 6
        },
    ];

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

    const customtableProps = {
        Tabledata: tableData,
        Tablehead: tableHead,
        flexArr: [2, 3, 1, 1, 1, 1],
        actionIndex,
        handleAction,
        searchQuery,
    };

    const handleChange = (text: string) => {
        setSearchQuery(text);
    };

    return (
        <ScrollView style={{ paddingHorizontal: 15 }}>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold,
            { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>Create Match Machine & Form
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
                    <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.textBold, masterdataStyles.textLight]}>Create Match Machine & Form</Text>
                    </Pressable>
                </AccessibleView>
                <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
                </Card.Content>
            </Card>

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
        </ScrollView>
    );
};

export default React.memo(MatchFormMachineScreen);

