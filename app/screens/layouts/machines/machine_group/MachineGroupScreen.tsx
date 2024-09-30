import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { useToast, useTheme } from "@/app/contexts";
import { Customtable, LoadingSpinner, Inputs, Searchbar, AccessibleView } from "@/components";
import { Portal, Switch, Dialog, Card } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";

interface FormValues {
    machineGroupId: string;
    machineGroupName: string;
    description: string;
    isActive: boolean;
}

const validationSchema = Yup.object().shape({
    machineGroupName: Yup.string().required("The machine group name field is required."),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const MachineGroupScreen = () => {
    const [machineGroup, setMachineGroup] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoadingButton, setIsLoadingButton] = useState(false);
    const [initialValues, setInitialValues] = useState<FormValues>({
        machineGroupId: "",
        machineGroupName: "",
        description: "",
        isActive: true,
    });
    const masterdataStyles = useMasterdataStyles();

    const { showSuccess, showError } = useToast();
    const { colors } = useTheme();
    const { spacing } = useRes();

    const errorMessage = useCallback((error: unknown) => {
        let errorMessage: string | string[];

        if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.errors ?? ["Something went wrong!"];
        } else if (error instanceof Error) {
            errorMessage = [error.message];
        } else {
            errorMessage = ["An unknown error occurred!"];
        }

        showError(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
    }, [showError]);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.post("MachineGroup_service.asmx/GetMachineGroups");
            setMachineGroup(response.data.data ?? []);
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveData = async (values: FormValues) => {
        setIsLoadingButton(true);
        const data = {
            MGroupID: values.machineGroupId ?? "",
            MGroupName: values.machineGroupName,
            Description: values.description,
            isActive: values.isActive,
        };

        try {
            const response = await axiosInstance.post("MachineGroup_service.asmx/SaveMachineGroup", data);
            setIsVisible(!response.data.status);
            showSuccess(String(response.data.message));

            await fetchData()
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoadingButton(false);
        }
    };

    const handleAction = async (action?: string, item?: string) => {
        try {
            if (action === "editIndex") {
                const response = await axiosInstance.post("MachineGroup_service.asmx/GetMachineGroup", { MGroupID: item });
                const machineGroupData = response.data.data[0] ?? {};
                setInitialValues({
                    machineGroupId: machineGroupData.MGroupID ?? "",
                    machineGroupName: machineGroupData.MGroupName ?? "",
                    description: machineGroupData.Description ?? "",
                    isActive: Boolean(machineGroupData.IsActive),
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeMachineGroup" : "DeleteMachineGroup";
                const response = await axiosInstance.post(`MachineGroup_service.asmx/${endpoint}`, { MGroupID: item });
                showSuccess(String(response.data.message));

                await fetchData()
            }
        } catch (error) {
            errorMessage(error);
        }
    };

    const tableData = useMemo(() => {
        return machineGroup.map(item => [
            item.MGroupName,
            item.Description,
            item.IsActive,
            item.MGroupID,
            item.MGroupID,
        ]);
    }, [machineGroup]);

    const tableHead = [
        { label: "Machine Group Name", align: "flex-start" },
        { label: "Description", align: "flex-start" },
        { label: "Change Status", align: "center" },
        { label: "Edit", align: "center" },
        { label: "Delete", align: "center" },
    ];

    const actionIndex = [{ editIndex: 3, delIndex: 4 }];

    const handelNewData = useCallback(() => {
        setInitialValues({
            machineGroupId: "",
            machineGroupName: "",
            description: "",
            isActive: true,
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = {
        Tabledata: tableData,
        Tablehead: tableHead,
        flexArr: [2, 3, 1, 1, 1],
        actionIndex,
        handleAction,
        searchQuery,
    };

    return (
        <ScrollView>
            <Card>
                <Card.Title
                    titleStyle={[masterdataStyles.text, masterdataStyles.textBold, { fontSize: spacing.large, textAlign: "center", marginTop: 30, paddingTop: 10, marginBottom: 30 }]}
                    title="List Group Machine"
                />
                <Card.Content>
                    <Searchbar
                        viewProps={
                            <Pressable
                                onPress={handelNewData}
                                style={[masterdataStyles.button, masterdataStyles.backMain, { marginHorizontal: 0 }]}
                            >
                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Create Group Machine</Text>
                            </Pressable>
                        }
                        searchQuery={searchQuery}
                        handleChange={setSearchQuery}
                    />
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <Customtable {...customtableProps} />
                    )}
                </Card.Content>
            </Card>
            <Portal>
                <Dialog
                    visible={isVisible}
                    onDismiss={() => setIsVisible(false)}
                    style={masterdataStyles.containerDialog}
                >
                    <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]}>
                        {isEditing ? "Edit" : "Create"}
                    </Dialog.Title>
                    <Dialog.Content>
                        {isVisible && (
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                validateOnBlur={false}
                                validateOnChange={true}
                                onSubmit={saveData}
                            >
                                {({ handleChange, handleBlur, values, errors, touched, handleSubmit, setFieldValue }) => (
                                    <AccessibleView>
                                        <Inputs
                                            placeholder="Enter Machine Group Name"
                                            label="Machine Group Name"
                                            handleChange={handleChange("machineGroupName")}
                                            handleBlur={handleBlur("machineGroupName")}
                                            value={values.machineGroupName}
                                            error={touched.machineGroupName && Boolean(errors.machineGroupName)}
                                            errorMessage={touched.machineGroupName ? errors.machineGroupName : ""}
                                        />
                                        <Inputs
                                            placeholder="Enter Description"
                                            label="Description"
                                            handleChange={handleChange("description")}
                                            handleBlur={handleBlur("description")}
                                            value={values.description}
                                            error={touched.description && Boolean(errors.description)}
                                            errorMessage={touched.description ? errors.description : ""}
                                        />
                                        <AccessibleView style={masterdataStyles.containerSwitch}>
                                            <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                                Status: {values.isActive ? "Active" : "Inactive"}
                                            </Text>
                                            <Switch
                                                style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                color={values.isActive ? colors.succeass : colors.disable}
                                                value={values.isActive}
                                                onValueChange={(v: boolean) => {
                                                    setFieldValue("isActive", v);
                                                }}
                                            />
                                        </AccessibleView>
                                        <AccessibleView style={masterdataStyles.containerAction}>
                                            <Pressable
                                                onPress={() => handleSubmit()}
                                                disabled={!values.machineGroupName || !values.description}
                                                style={[
                                                    masterdataStyles.button,
                                                    (values.machineGroupName && values.description) ? masterdataStyles.backMain : masterdataStyles.backDis,
                                                ]}
                                            >
                                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Save</Text>
                                            </Pressable>
                                            <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]}>
                                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Cancel</Text>
                                            </Pressable>
                                        </AccessibleView>
                                    </AccessibleView>
                                )}
                            </Formik>
                        )}
                    </Dialog.Content>
                </Dialog>
            </Portal>
        </ScrollView>
    );
};

export default React.memo(MachineGroupScreen);
