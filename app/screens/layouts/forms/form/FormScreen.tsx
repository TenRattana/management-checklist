import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { useToast, useTheme, useRes } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";

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
                navigation.navigate("Create_form", { formId: item });
            } else if (action === "preIndex") {
                navigation.navigate("Preview", { formId: item });
            } else if (action === "copyIndex") {
                navigation.navigate("Create_form", { formId: item, action: "copy" });
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
        navigation.navigate("screens/layouts/forms/create/CreateFormScreen");
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
        <ScrollView style={{ paddingHorizontal: 15 }}>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold,
            { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>List Form
            </Text>
            <Divider style={{ marginBottom: 20 }} />
            <Card style={{ borderRadius: 5 }}>
                <AccessibleView style={{ paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Pressable
                        onPress={handleNewForm}
                        style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}
                    ></Pressable>
                </AccessibleView>
                <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
                </Card.Content>
            </Card>


        </ScrollView>
    );
});

export default React.memo(FormScreen);

