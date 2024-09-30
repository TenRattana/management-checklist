import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from 'axios'
import axiosInstance from "@/config/axios";
import { useToast, useTheme } from "@/app/contexts";
import { Customtable, LoadingSpinner, Inputs, Searchbar, AccessibleView } from "@/components";
import { Portal, Switch, Dialog, Card } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";

interface FormValues {
    checkListId: string;
    checkListName: string;
    isActive: boolean;
}

const validationSchema = Yup.object().shape({
    checkListName: Yup.string().required("Check list name is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const CheckListScreen = () => {
    const [checkList, setCheckList] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<FormValues>({
        checkListId: "",
        checkListName: "",
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
            const response = await axiosInstance.post("CheckList_service.asmx/GetCheckLists");
            setCheckList(response.data.data ?? []);
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
            CListId: values.checkListId ?? "",
            CListName: values.checkListName,
            isActive: values.isActive,
        };

        try {
            const response = await axiosInstance.post("CheckList_service.asmx/SaveCheckList", data);
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
            if (action === "editIndex") {
                const response = await axiosInstance.post("CheckList_service.asmx/GetCheckList", { CListID: item });
                const checkListData = response.data.data[0] ?? {};
                setInitialValues({
                    checkListId: checkListData.CListID ?? "",
                    checkListName: checkListData.CListName ?? "",
                    isActive: Boolean(checkListData.IsActive),
                });
                setIsEditing(true);
                setIsVisible(true);
            } else {
                const endpoint = action === "activeIndex" ? "ChangeCheckList" : "DeleteCheckList";
                const response = await axiosInstance.post(`CheckList_service.asmx/${endpoint}`, { CListID: item });
                showSuccess(String(response.data.message));

                await fetchData();
            }
        } catch (error) {
            errorMessage(error);
        }
    };

    const tableData = useMemo(() => {
        return checkList.map(item => [
            item.CListName,
            item.IsActive,
            item.CListID,
            item.CListID,
        ]);
    }, [checkList]);

    const tableHead = [
        { label: "Check List Name", align: "flex-start" },
        { label: "Change Status", align: "center" },
        { label: "Edit", align: "center" },
        { label: "Delete", align: "center" },
    ];

    const actionIndex = [{ editIndex: 2, delIndex: 3 }];

    const handelNewData = useCallback(() => {
        setInitialValues({
            checkListId: "",
            checkListName: "",
            isActive: true,
        });
        setIsEditing(false);
        setIsVisible(true);
    }, []);

    const customtableProps = {
        Tabledata: tableData,
        Tablehead: tableHead,
        flexArr: [3, 1, 1, 1],
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
                        { fontSize: spacing.large, textAlign: "center", marginTop: 30, paddingTop: 10, marginBottom: 30 }
                    ]}
                    title="List of Check Lists"
                />
                <Card.Content>
                    <Searchbar
                        viewProps={
                            <Pressable
                                onPress={handelNewData}
                                style={[masterdataStyles.button, masterdataStyles.backMain, { marginHorizontal: 0 }]}
                            >
                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Create Check List</Text>
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
                                            placeholder="Enter Check List Name"
                                            label="Check List Name"
                                            handleChange={handleChange("checkListName")}
                                            handleBlur={handleBlur("checkListName")}
                                            value={values.checkListName}
                                            error={touched.checkListName && Boolean(errors.checkListName)}
                                            errorMessage={touched.checkListName ? errors.checkListName : ""}
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
                                                disabled={!values.checkListName}
                                                style={[
                                                    masterdataStyles.button,
                                                    values.checkListName ? masterdataStyles.backMain : masterdataStyles.backDis,
                                                ]}
                                            >
                                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>
                                                    Save
                                                </Text>
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

export default React.memo(CheckListScreen);
