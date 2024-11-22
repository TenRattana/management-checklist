import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts/useToast";
import { useRes } from "@/app/contexts/useRes";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { FormScreenProps } from "@/typing/tag";
import { Form } from "@/typing/type";
import { useQuery, useQueryClient } from 'react-query';

const fetchForm = async (): Promise<Form[]> => {
    const response = await axiosInstance.post("Form_service.asmx/GetForms");
    return response.data.data ?? [];
};

const FormScreen: React.FC<FormScreenProps> = React.memo(({ navigation, route }) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [show, setShow] = useState<boolean>(false)
    const { messages } = route.params || {};

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize } = useRes();
    const queryClient = useQueryClient();

    const { data: form = [], isLoading } = useQuery<Form[], Error>(
        'form',
        fetchForm,
        {
            refetchOnWindowFocus: true,
        });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
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
                queryClient.invalidateQueries('form');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient]);

    const handleNewForm = () => {
        navigation.navigate("Create_form");
    };

    const tableData = useMemo(() => {
        return form.map((item) => [
            item.Disables,
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
            { label: "", align: "flex-start" },
            { label: "Form Name", align: "flex-start" },
            { label: "Form Description", align: "flex-start" },
            { label: "Status", align: "center" },
            { label: "Change", align: "center" },
            { label: "Copy", align: "center" },
            { label: "View", align: "center" },
        ],
        flexArr: [0, 2, 4, 1, 1, 1, 1],
        actionIndex: [{ disables: 0, changeIndex: 4, copyIndex: 5, preIndex: 6 }],
        showMessage: 1,
        handleAction,
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

    return (
        <AccessibleView name="container-form" style={styles.container}>
            <Card.Title
                title="Forms"
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Form..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-form"
                />
                <Pressable onPress={handleNewForm} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>New Form</Text>
                </Pressable>
            </AccessibleView>
            <Card.Content style={styles.cardcontent}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
            </Card.Content>
        </AccessibleView>
    );
});

export default FormScreen;
