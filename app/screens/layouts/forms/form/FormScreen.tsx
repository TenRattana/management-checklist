import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts/useToast";
import { LoadingSpinner, Searchbar, Text } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { FormScreenProps } from "@/typing/tag";
import { Form } from "@/typing/type";
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { fetchForms, fetchSearchFomrs } from "@/app/services";
import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import { navigate } from "@/app/navigations/navigationUtils";
import { useFocusEffect } from "expo-router";
import { useSelector } from "react-redux";

const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

const FormScreen: React.FC<FormScreenProps> = React.memo(({ route }) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const state = useSelector((state: any) => state.prefix);

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing } = useRes();
    const { theme } = useTheme();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<Form[]>([])

    const { data, isFetching, fetchNextPage, hasNextPage, remove } = useInfiniteQuery(
        ['form', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchFomrs(debouncedSearchQuery)
                : fetchForms(pageParam, 50);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 50 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat()
                setForm(newItems);
            },
        }
    );

    useFocusEffect(
        useCallback(() => {
            return () => {
                remove()
                setForm([])
            };
        }, [])
    );

    const handlePaginationChange = useCallback(() => {
        if (hasNextPage && !isFetching) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetching, fetchNextPage]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        if (route.params?.fet) {
            queryClient.invalidateQueries('form');
        }
    }, [route.params]);

    const handleAction = useCallback(async (action?: string, item?: string) => {
        try {
            if (action === "changeIndex") {
                navigate("Create_form", { formId: item });
            } else if (action === "preIndex") {
                navigate("Preview", { formId: item });
            } else if (action === "copyIndex") {
                navigate("Create_form", { formId: item, action: "copy" });
            } else {
                const endpoint = action === "activeIndex" ? "ChangeForm" : "DeleteForm";
                const response = await axiosInstance.post(`Form_service.asmx/${endpoint}`, { FormID: item });
                showSuccess(String(response.data.message));
                queryClient.invalidateQueries('form');
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError, queryClient, navigate, showSuccess]);

    const handleNewForm = useCallback(() => {
        navigate("Create_form");
    }, [navigate]);

    const tableData = useMemo(() => {
        return form.map((item) => [
            item.Disables,
            item.Deletes,
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
            { label: "", align: "flex-start" },
            { label: `${state.Form} Name`, align: "flex-start" },
            { label: `${state.Form} Description`, align: "flex-start" },
            { label: `${state.Form} Status`, align: "center" },
            { label: "Status", align: "center" },
            { label: "Change", align: "center" },
            { label: "Copy", align: "center" },
            { label: "View", align: "center" },
            { label: "Delete", align: "center" },
        ],
        flexArr: [0, 0, 2, 2, 1, 1, 1, 1, 1, 1],
        actionIndex: [{ disables: 0, delete: 1, changeIndex: 6, copyIndex: 7, preIndex: 8, delOnlyIndex: 9 }],
        showMessage: 1,
        handleAction,
        searchQuery: debouncedSearchQuery,
        isFetching: isFetching
    }), [tableData, searchQuery, handleAction, debouncedSearchQuery, state.Form, isFetching]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            margin: 10,
            padding: 10,
            borderRadius: 8,
            backgroundColor: theme.colors.background
        },
        header: {
            fontSize: spacing.medium,
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

    return (
        <View id="container-form" style={styles.container}>
            <Card.Title
                title={`List ${state.Form}` || "List"}
                titleStyle={[masterdataStyles.textBold, styles.header]}
            />
            <Divider style={{ marginHorizontal: 15, marginBottom: 10 }} />

            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Searchbar
                    placeholder="Search Form..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    testId="search-form"
                />
                <TouchableOpacity onPress={handleNewForm} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>{`Create ${state.Form}`}</Text>
                </TouchableOpacity>
            </View>
            <Card.Content style={styles.cardcontent}>
                <Suspense fallback={<LoadingSpinner />}>
                    <LazyCustomtable {...customtableProps} handlePaginationChange={handlePaginationChange} />
                </Suspense>
            </Card.Content>
        </View>
    );
});

export default FormScreen;
