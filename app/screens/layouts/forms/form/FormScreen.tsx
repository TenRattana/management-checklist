import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { TouchableOpacity, StyleSheet, View, Platform } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts/useToast";
import { LoadingSpinner, LoadingSpinnerTable, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { fetchForms, fetchSearchFomrs } from "@/app/services";
import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import { navigate } from "@/app/navigations/navigationUtils";
import { useFocusEffect } from "expo-router";
import { useSelector } from "react-redux";
import { Form, FormScreenProps } from "@/typing/screens/Form";

const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

const FormScreen = React.memo(({ route }: FormScreenProps) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const state = useSelector((state: any) => state.prefix);

    const masterdataStyles = useMasterdataStyles();
    const { showSuccess, handleError } = useToast();
    const { spacing, fontSize, responsive } = useRes();
    const { theme, darkMode } = useTheme();
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
        }, [remove])
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
            item.FormNumber ?? "-",
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
            { label: `${state.Form} Number`, align: "flex-start" },
            { label: `${state.Form} Description`, align: "flex-start" },
            { label: `${state.Form} Status`, align: "center" },
            { label: "Status", align: "center" },
            { label: "Change", align: "center" },
            { label: "Copy", align: "center" },
            { label: "View", align: "center" },
            { label: "Delete", align: "center" },
        ],
        flexArr: [0, 0, 2, 2, 3, 1, 1, 1, 1, 1, 1],
        actionIndex: [{ disables: 0, delete: 1, changeIndex: 7, copyIndex: 8, preIndex: 9, delOnlyIndex: 10 }],
        showMessage: [2, 3],
        handleAction,
        searchQuery: debouncedSearchQuery,
        isFetching: isFetching
    }), [tableData, searchQuery, handleAction, debouncedSearchQuery, state.Form, isFetching]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            padding: 10,
            paddingHorizontal: 20
        },
        header: {
            fontSize: spacing.large,
            paddingVertical: fontSize === "large" ? 7 : 5,
            fontWeight: 'bold',
            color: theme.colors.onBackground
        },
        functionname: {
            textAlign: 'center'
        },
        cardcontent: {
            marginTop: 10,
            paddingVertical: 10,
            paddingHorizontal: 0,
            flex: 1,
            borderRadius: 10,
            backgroundColor: theme.colors.background,
            ...Platform.select({
                ios: {
                    shadowColor: theme.colors.onBackground,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                },
                android: {
                    elevation: 6,
                },
                web: {
                    boxShadow: `2px 5px 10px ${!darkMode ? 'rgba(0, 0, 0, 0.24)' : 'rgba(193, 214, 255, 0.56)'}`,
                },
            }),
        },
        containerSearch: {
            paddingHorizontal: 20,
            paddingVertical: 5,
            flexDirection: responsive === "small" ? "column" : 'row',
        },
        contentSearch: {
            flexDirection: responsive === "small" ? "column" : 'row',
        },
        containerTable: {
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center'
        }
    });

    return (
        <View id="container-form" style={styles.container}>
            <View id="container-search" style={masterdataStyles.containerSearch}>
                <Text style={[masterdataStyles.textBold, styles.header]}>{`List ${state.Form}` || "List"}</Text>
            </View>

            <Card.Content style={styles.cardcontent}>
                <View style={styles.containerSearch}>
                    <View style={styles.contentSearch}>
                        <Searchbar
                            placeholder="Search Form..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            testId="search-form"
                        />
                    </View>

                    <TouchableOpacity onPress={handleNewForm} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
                        <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>{`Create ${state.Form}`}</Text>
                    </TouchableOpacity>
                </View>

                <Suspense fallback={<LoadingSpinnerTable />}>
                    <LazyCustomtable {...customtableProps} handlePaginationChange={handlePaginationChange} />
                </Suspense>
            </Card.Content>
        </View>
    );
});

export default FormScreen;
