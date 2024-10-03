import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { Customtable, LoadingSpinner, Searchbar } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Match_form_machine_dialog from "@/components/screens/Match_form_machine_dialog";

interface MatchFormMachineScreenProps {
    navigation: any;
}

interface Machine {
    MachineID: string;
    MachineName: string;
    IsActive: boolean;
}

interface Form {
    FormID: string;
    FormName: string;
    IsActive: boolean;
}

interface MatchForm {
    MachineID: string;
    FormID: string;
    MachineName: string;
    FormName: string;
}

interface InitialValues {
    machineId: string;
    formId: string;
}

const MatchFormMachineScreen: React.FC<MatchFormMachineScreenProps> = ({ navigation }) => {
    const [forms, setForm] = useState<Form[]>([]);
    const [machine, setMachine] = useState<Machine[]>([]);
    const [matchForm, setMatchForm] = useState<MatchForm[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<InitialValues>({
        machineId: "",
        formId: "",
    });

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, showError } = useToast();
    const { spacing } = useRes();

    const errorMessage = useCallback(
        (error: unknown) => {
            let errorMessage: string | string[];

            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.errors ?? ["Something went wrong!"];
            } else if (error instanceof Error) {
                errorMessage = [error.message];
            } else {
                errorMessage = ["An unknown error occurred!"];
            }

            showError(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
        },
        [showError]
    );

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
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveData = async (values: InitialValues) => {
        setIsLoadingButton(true);
        const data = {
            MachineID: values.machineId,
            FormID: values.formId,
        };

        try {
            const response = await axiosInstance.post("MatchFormMachine_service.asmx/SaveMatchFormMachine", data);
            setIsVisible(!response.data.status);
            showSuccess(String(response.data.message));

            await fetchData();
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoadingButton(false);
        }
    };

    const handleAction = async (action?: string, item?: string) => {
        try {
            if (action === "changeIndex") {
                navigation.navigate("Create Form", { formId: item });
            } else if (action === "preIndex") {
                navigation.navigate("View Form", { formId: item });
            } else if (action === "copyIndex") {
                navigation.navigate("Create Form", { formId: item, action: "copy" });
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
            errorMessage(error);
        }
    };

    const tableData = useMemo(() => {
        return matchForm.map((item) => {
            return [
                item.MachineName,
                item.FormName,
                item.FormID,
                item.FormID,
                item.FormID,
                item.MachineID,
                item.MachineID,
            ];
        })
    }, [machine]);

    const tableHead = [
        { label: "Machine Name", align: "flex-start" },
        { label: "Form Name", align: "flex-start" },
        { label: "Change Form", align: "center" },
        { label: "Copy Template", align: "center" },
        { label: "Preview", align: "center" },
        { label: "Edit", align: "center" },
        { label: "Delete", align: "center" },
    ];

    const actionIndex = [
        {
            changeIndex: 2,
            copyIndex: 3,
            preIndex: 4,
            editIndex: 5,
            delIndex: 6,
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
        flexArr: [2, 2, 1, 1, 1, 1, 1],
        actionIndex,
        handleAction,
        searchQuery,
    };

    return (
        <ScrollView>
            <Card>
                <Card.Title
                    titleStyle={[
                        masterdataStyles.text,
                        masterdataStyles.textBold,
                        { fontSize: spacing.large, textAlign: "center", marginTop: spacing.small, paddingTop: 10, marginBottom: spacing.small },
                    ]}
                    title="Create Match Machine & Form"
                />
                <Card.Content>
                    <Searchbar
                        viewProps={
                            <Pressable onPress={handleNewData} style={[masterdataStyles.button, masterdataStyles.backMain, { marginHorizontal: 0 }]}>
                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Create Group Machine</Text>
                            </Pressable>
                        }
                        searchQuery={searchQuery}
                        handleChange={setSearchQuery}
                    />
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

