import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast, useTheme, useRes } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { FormScreenProps } from "@/typing/tag";
import { Form } from "@/typing/type";
import { useFocusEffect } from "expo-router";

const FormScreen: React.FC<FormScreenProps> = (({ navigation, route }) => {
    const [form, setForm] = useState<Form[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { messages } = route.params || {};
    console.log("FormScreen");

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { colors } = useTheme();
    const { spacing } = useRes();

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const formResponse = await axiosInstance.post("Form_service.asmx/GetForms");
            setForm(formResponse.data.data ?? []);
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

    useEffect(() => {
        if (messages) {
            showSuccess(String(messages));
        }
    }, [messages]);

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
            handleError(error);
        }
    };

    const handleNewForm = () => {
        navigation.navigate("Create_form");
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
        searchQuery: debouncedSearchQuery,
    };

    const handleChange = (text: string) => {
        setSearchQuery(text);
    };

    return (
        <ScrollView style={{ paddingHorizontal: 15 }}>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold,
            { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>List Form
            </Text>
            <Divider style={{ marginBottom: 20 }} />
            <Card style={{ borderRadius: 5 }}>
                <AccessibleView style={{ paddingVertical: 20, flexDirection: 'row' }}>
                    <Searchbar
                        placeholder="Search Machine..."
                        value={searchQuery}
                        onChangeText={handleChange}
                    />
                    <Pressable
                        onPress={handleNewForm}
                        style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}
                    >
                        <Text style={[masterdataStyles.textBold, masterdataStyles.textLight]}>New Form</Text></Pressable>
                </AccessibleView>
                <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
                </Card.Content>
            </Card>


        </ScrollView>
    );
});

export default React.memo(FormScreen);

