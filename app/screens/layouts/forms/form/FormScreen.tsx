import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts/useToast";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { FormScreenProps } from "@/typing/tag";
import { Form } from "@/typing/type";
import { useQuery, useQueryClient } from 'react-query';
import { fetchForms, fetchSearchFomrs } from "@/app/services";

const FormScreen: React.FC<FormScreenProps> = React.memo(({ navigation, route }) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [show, setShow] = useState<boolean>(false);
    const { messages } = route.params || {};
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const queryClient = useQueryClient();

    const [paginationInfo, setPaginationInfo] = useState({
        currentPage: 0,
        pageSize: 100,
    });

    const handlePaginationChange = (currentPage: number, pageSize: number) => {
        setPaginationInfo({ currentPage, pageSize });
    };

    const { data: form = [], isLoading } = useQuery<Form[], Error>(
        ['form', paginationInfo, debouncedSearchQuery],
        () => debouncedSearchQuery ? fetchSearchFomrs(debouncedSearchQuery) : fetchForms(paginationInfo.currentPage, paginationInfo.pageSize),
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            keepPreviousData: true,
        }
    );

    useEffect(() => {
        if (messages && show) {
            showSuccess(String(messages));
            setShow(false);
        }
    }, [messages, show, showSuccess]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

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
    }, [handleError, queryClient, navigation, showSuccess]);

    const handleNewForm = useCallback(() => {
        navigation.navigate("Create_form");
    }, [navigation]);

    const tableData = useMemo(() => {
        return form.map((item) => [
            item.Disables,
            item.FormName,
            item.Description,
            item.FormState ?? "-",
            item.IsActive,
            item.FormID,
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
            { label: "Form Status", align: "center" },
            { label: "Status", align: "center" },
            { label: "Change", align: "center" },
            { label: "Copy", align: "center" },
            { label: "View", align: "center" },
            { label: "Delete", align: "center" },
        ],
        flexArr: [0, 2, 2, 1, 1, 1, 1, 1, 1],
        actionIndex: [{ disables: 0, changeIndex: 5, copyIndex: 6, preIndex: 7, delOnlyIndex: 8 }],
        showMessage: 1,
        handleAction,
        searchQuery: debouncedSearchQuery,
    }), [tableData, searchQuery, handleAction, debouncedSearchQuery]);

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
                <TouchableOpacity onPress={handleNewForm} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>New Form</Text>
                </TouchableOpacity>
            </AccessibleView>
            <Card.Content style={styles.cardcontent}>
                {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} handlePaginationChange={handlePaginationChange} />}
            </Card.Content>
        </AccessibleView>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontSize: 24,
        marginTop: 10,
        paddingVertical: 8,
    },
    functionname: {
        textAlign: 'center',
    },
    cardcontent: {
        padding: 2,
        flex: 1,
    },
});

export default FormScreen;
