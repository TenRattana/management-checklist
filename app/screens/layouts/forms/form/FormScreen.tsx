import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, Text } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast, useTheme, useRes } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { FormScreenProps } from "@/typing/tag";
import { Form } from "@/typing/type";
import { useFocusEffect } from "expo-router";

const FormScreen: React.FC<FormScreenProps> = ({ navigation, route }) => {
    const [form, setForm] = useState<Form[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false)
    const { messages } = route.params || {};

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
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
            // return () => setShow(true)
        }, [])
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        if (messages && show) {
            showSuccess(String(messages));
            setShow(false)
        }
    }, [messages, show]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
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
    }, [navigation, fetchData]);

    const handleNewForm = () => {
        navigation.navigate("Create_form");
    };

    const tableData = useMemo(() => {
        return form.map((item) => [
            item.FormName,
            item.Description,
            item.IsActive,
            item.FormID,
            item.FormID,
            item.FormID,
        ]);
    }, [form]);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Form Name", align: "flex-start" },
            { label: "Form Description", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "Change", align: "center" },
            { label: "Copy", align: "center" },
            { label: "View", align: "center" },
        ],
        flexArr: [2, 4, 1, 1, 1, 1],
        actionIndex: [{ changeIndex: 3, copyIndex: 4, preIndex: 5 }],
        handleAction,
        searchQuery: debouncedSearchQuery,
    }), [tableData, debouncedSearchQuery, handleAction]);

    return (
        <AccessibleView name="container-form" style={{ paddingHorizontal: 15 }}>
            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small - 10 }]}>
                List Form
            </Text>
            <Divider style={{ marginBottom: 10 }} />
            <Card style={{ borderRadius: 5 }}>
                <AccessibleView name="form" style={masterdataStyles.containerSearch}>
                    <Searchbar
                        placeholder="Search Form..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                        testId="search-form"
                    />
                    <Pressable onPress={handleNewForm} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>New Form</Text>
                    </Pressable>
                </AccessibleView>
                <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
                    {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
                </Card.Content>
            </Card>
        </AccessibleView>
    );
};

export default React.memo(FormScreen);
