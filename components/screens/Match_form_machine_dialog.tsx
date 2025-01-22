import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Portal, Dialog, HelperText, Icon } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";
import Dropdown from "../common/Dropdown";
import { fetchForms, fetchMachines, fetchSearchFomrs, fetchSearchMachines } from "@/app/services";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import HeaderDialog from "./HeaderDialog";
import { useSelector } from "react-redux";
import { InitialValuesMatchFormMachine, MatchFormMachineDialogProps } from "@/typing/screens/MatchFormMachine";

const Match_form_machine_dialog = React.memo(({ isVisible, setIsVisible, isEditing, initialValues, saveData }: MatchFormMachineDialogProps<InitialValuesMatchFormMachine>) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme();
    const { spacing } = useRes()
    const state = useSelector((state: any) => state.prefix);

    const [openMachine, setOpenMachine] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [debouncedSearchQueryMachine, setDebouncedSearchQueryMachine] = useState('');
    const [debouncedSearchQueryForm, setDebouncedSearchQueryForm] = useState('');
    const [itemsMachine, setItemsMachine] = useState<{ label: string; value: string }[]>([]);
    const [itemsForm, setItemsForm] = useState<{ label: string; value: string }[]>([]);

    const { data: machine, isFetching: isFetchingmachine, fetchNextPage: fetchNextPageMachine, hasNextPage: hasNextPageMachine, refetch: refetchMachine } = useInfiniteQuery(
        ['machine', debouncedSearchQueryMachine],
        ({ pageParam = 0 }) => {
            return debouncedSearchQueryMachine
                ? fetchSearchMachines(debouncedSearchQueryMachine)
                : fetchMachines(pageParam, 100);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 100 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().filter((item) => !isEditing ? item.IsActive : item).map((item) => ({
                    label: item.MachineName || 'Unknown',
                    value: item.MachineID || '',
                }));

                setItemsMachine((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            },
        }
    );

    const { data: form, isFetching: isFetchingForm, fetchNextPage: fetchNextPageForm, hasNextPage: hasNextPageForm, refetch: refetchForm } = useInfiniteQuery(
        ['form', debouncedSearchQueryForm],
        ({ pageParam = 0 }) => {
            return debouncedSearchQueryForm
                ? fetchSearchFomrs(debouncedSearchQueryForm)
                : fetchForms(pageParam, 100);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 100 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().filter((item) => !isEditing ? item.IsActive : item).map((item) => ({
                    label: item.FormName || 'Unknown',
                    value: item.FormID || '',
                }));

                setItemsForm((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            },
        }
    );

    const queryClient = useQueryClient();

    const validationSchema = Yup.object().shape({
        machineId: Yup.string().required("This machine field is required"),
        formId: Yup.string().required("This form field is required"),
    })

    useEffect(() => {
        if (isEditing) {
            setDebouncedSearchQueryForm(initialValues.formName ?? "")
            setDebouncedSearchQueryMachine(initialValues.machineName ?? "")
        } else {
            queryClient.invalidateQueries("form")
            queryClient.invalidateQueries("machine")
        }

    }, []);

    const handleScrollMachine = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent?.contentSize) {
            const contentHeight = nativeEvent?.contentSize.height;
            const layoutHeight = nativeEvent?.layoutMeasurement.height;
            const offsetY = nativeEvent?.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPageMachine && !isFetchingmachine) {
                fetchNextPageMachine();
            }
        }
    };

    const handleScrollForm = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent?.contentSize) {
            const contentHeight = nativeEvent?.contentSize.height;
            const layoutHeight = nativeEvent?.layoutMeasurement.height;
            const offsetY = nativeEvent?.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPageForm && !isFetchingForm) {
                fetchNextPageForm();
            }
        }
    };

    const styles = StyleSheet.create({
        button: {
            alignSelf: 'flex-end',
            paddingHorizontal: 20,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.drag,
            borderRadius: 4,
        },
        buttonSubmit: {
            backgroundColor: theme.colors.green,
            marginRight: 5,
            flexDirection: "row"
        },
        containerAction: {
            justifyContent: "flex-end",
            flexDirection: 'row',
            paddingTop: 10,
            paddingRight: 20
        }
    })

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog} testID="dialog-mfmd">
                <Dialog.Content>
                    <HeaderDialog isEditing setIsVisible={() => setIsVisible(false)} display={state.MatchFormMachine} />

                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={false}
                            onSubmit={(values: InitialValuesMatchFormMachine) => saveData(values, isEditing)}
                        >
                            {({ handleSubmit, dirty, isValid, setFieldValue, setFieldTouched, touched, errors, values }) => {

                                return (
                                    <View id="machine-mfmd">
                                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 30, paddingLeft: 10 }]}>
                                            {state.Machine}
                                        </Text>

                                        <Dropdown
                                            lefticon="desktop-classic"
                                            label={state.Machine}
                                            disable={isEditing}
                                            open={openMachine}
                                            setOpen={(v: boolean) => setOpenMachine(v)}
                                            selectedValue={values.machineId}
                                            searchQuery={debouncedSearchQueryMachine}
                                            setDebouncedSearchQuery={(value) => setDebouncedSearchQueryMachine(value)}
                                            items={itemsMachine}
                                            setSelectedValue={(stringValue: string | null) => {
                                                setFieldValue("machineId", stringValue);
                                                setFieldTouched("machineId", true);
                                            }}
                                            isFetching={isFetchingmachine}
                                            fetchNextPage={fetchNextPageMachine}
                                            handleScroll={handleScrollMachine}
                                            key={JSON.stringify({ machine: values.machineId })}
                                        />

                                        <HelperText
                                            type="error"
                                            visible={Boolean(touched.machineId && errors.machineId)}
                                            style={[{ display: Boolean(touched.machineId && errors.machineId) ? 'flex' : 'none' }, masterdataStyles.errorText]}
                                        >
                                            {touched.machineId ? errors.machineId : ""}
                                        </HelperText>

                                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 10 }]}>
                                            {state.Form}
                                        </Text>

                                        <Dropdown
                                            label={state.Form}
                                            lefticon="format-line-style"
                                            open={openForm}
                                            setOpen={(v: boolean) => setOpenForm(v)}
                                            selectedValue={values.formId}
                                            searchQuery={debouncedSearchQueryForm}
                                            setDebouncedSearchQuery={(value) => setDebouncedSearchQueryForm(value)}
                                            items={itemsForm}
                                            setSelectedValue={(stringValue: string | null) => {
                                                setFieldValue("formId", stringValue);
                                                setFieldTouched("formId", true);
                                            }}
                                            isFetching={isFetchingForm}
                                            fetchNextPage={fetchNextPageForm}
                                            handleScroll={handleScrollForm}
                                            key={JSON.stringify({ form: values.formId })}
                                        />

                                        <HelperText
                                            type="error"
                                            visible={Boolean(touched.formId && errors.formId)}
                                            style={[{ display: Boolean(touched.formId && errors.formId) ? 'flex' : 'none' }, masterdataStyles.errorText]}
                                        >
                                            {touched.formId ? errors.formId : ""}
                                        </HelperText>

                                        <View style={[masterdataStyles.containerAction, styles.containerAction]}>
                                            <TouchableOpacity
                                                onPress={() => handleSubmit()}
                                                style={[styles.button, styles.buttonSubmit]}
                                            >
                                                <Icon source="check" size={spacing.large} color={theme.colors.fff} />

                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                                    {isEditing ? "Update" : "Add"}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => setIsVisible(false)}
                                                style={[styles.button, masterdataStyles.backMain, { marginLeft: 10, flexDirection: "row" }]}
                                            >
                                                <Icon source="close" size={spacing.large} color={theme.colors.fff} />

                                                <Text style={[masterdataStyles.text, masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                                    Cancel
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            }}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
})

export default Match_form_machine_dialog