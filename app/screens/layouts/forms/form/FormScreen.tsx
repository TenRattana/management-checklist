import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { useToast, useTheme } from "@/app/contexts";
import { Customtable, LoadingSpinner, Searchbar } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";

interface FormScreenProps {
    navigation: any
}

interface Form {
    FormID: string;
    FormName: string;
    IsActive: boolean;
    Description: string;
}

const FormScreen: React.FC<FormScreenProps> = (({ navigation }) => {
    const [form, setForm] = useState<Form[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, showError } = useToast();
    const { colors } = useTheme();
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
            const formResponse = await axiosInstance.post("Form_service.asmx/GetForms");
            setForm(formResponse.data.data ?? []);
        } catch (error) {
            errorMessage(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (action?: string, item?: string) => {
        try {
            if (action === "changeIndex") {
                navigation.navigate("Create Form", { formId: item });
            } else if (action === "preIndex") {
                navigation.navigate("View Form", { formId: item });
            } else if (action === "copyIndex") {
                navigation.navigate("Create Form", { formId: item, action: "copy" });
            } else {
                const endpoint = action === "activeIndex" ? "ChangeForm" : "DeleteForm";
                const response = await axiosInstance.post(`Form_service.asmx/${endpoint}`, { FormID: item });
                showSuccess(String(response.data.message));

                await fetchData();
            }
        } catch (error) {
            errorMessage(error);
        }
    };

    const handleNewForm = () => {
        navigation.navigate("Create Form");
    };

    const tableData = useMemo(() => {
        return form.map((item) => {
            return [
                item.FormName,
                item.Description,
                item.IsActive,
                item.FormID,
                item.FormID,
                item.FormID,
            ];
        })
    }, [form]);

    const tableHead = [
        { label: "Form Name", align: "flex-start" },
        { label: "Form Description", align: "flex-start" },
        { label: "Change Status", align: "center" },
        { label: "Change Form", align: "center" },
        { label: "Copy Template", align: "center" },
        { label: "Preview", align: "center" },
    ];

    const actionIndex = [
        {
            changeIndex: 3,
            copyIndex: 4,
            preIndex: 5,
        },
    ];

    const customtableProps = {
        Tabledata: tableData,
        Tablehead: tableHead,
        flexArr: [2, 4, 1, 1, 1, 1],
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
                    title="Form"
                />
                <Card.Content>
                    <Searchbar
                        viewProps={
                            <Pressable
                                onPress={handleNewForm}
                                style={[masterdataStyles.button, masterdataStyles.backMain]}
                            >
                                <Text style={[masterdataStyles.text, masterdataStyles.textLight]}>New Form</Text>
                            </Pressable>
                        }
                        searchQuery={searchQuery}
                        handleChange={setSearchQuery}
                    />
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
                </Card.Content>
            </Card>
        </ScrollView>
    );
});

export default React.memo(FormScreen);

