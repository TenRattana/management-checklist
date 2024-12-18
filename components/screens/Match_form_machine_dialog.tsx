import React, { useCallback, useEffect, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { Portal, Dialog } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { MatchFormMachineDialogProps, InitialValuesMatchFormMachine } from '@/typing/value'
import Text from "@/components/Text";
import { Dropdown } from "../common";
import { fetchForm, fetchMachines, fetchSearchFomrs, fetchSearchMachines } from "@/app/services";
import { useInfiniteQuery } from "react-query";

const validationSchema = Yup.object().shape({
    machineId: Yup.string().required("This machine field is required"),
    formId: Yup.string().required("This form field is required"),
});

const Match_form_machine_dialog = React.memo(({ isVisible, setIsVisible, isEditing, initialValues, saveData }: MatchFormMachineDialogProps<InitialValuesMatchFormMachine>) => {
    const masterdataStyles = useMasterdataStyles()

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
                const newItems = newData.pages.flat().map((item) => ({
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
                : fetchForm(pageParam, 100);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 100 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().map((item) => ({
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

    useEffect(() => {
        if (debouncedSearchQueryMachine === '') {
            refetchMachine();
        } else {
            setItemsMachine([])
        }

        if (debouncedSearchQueryForm === '') {
            refetchForm();
        } else {
            setItemsForm([])
        }
    }, [debouncedSearchQueryMachine, debouncedSearchQueryForm]);


    const handleScrollMachine = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent.contentSize) {
            const contentHeight = nativeEvent.contentSize.height;
            const layoutHeight = nativeEvent.layoutMeasurement.height;
            const offsetY = nativeEvent.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPageMachine && !isFetchingmachine) {
                fetchNextPageMachine();
            }
        }
    };

    const handleScrollForm = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent.contentSize) {
            const contentHeight = nativeEvent.contentSize.height;
            const layoutHeight = nativeEvent.layoutMeasurement.height;
            const offsetY = nativeEvent.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPageForm && !isFetchingForm) {
                fetchNextPageForm();
            }
        }
    };

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog} testID="dialog-mfmd">
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]} testID="dialog-title-mfmd">
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>
                    <Text
                        style={[masterdataStyles.text, { paddingLeft: 10 }]}
                    >
                        {isEditing ? "Edit the details of the match form & machine." : "Enter the details for the new match form & machine.."}
                    </Text>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={false}
                            validateOnChange={true}
                            onSubmit={(values: InitialValuesMatchFormMachine) => saveData(values, isEditing)}
                        >
                            {({ handleSubmit, dirty, isValid, setFieldValue, setFieldTouched, touched, errors, values }) => {

                                const handelChange = (field: string, value: any) => {
                                    setFieldTouched(field, true)
                                    setFieldValue(field, value)
                                }

                                return (
                                    <View id="machine-mfmd">
                                        <View style={{
                                            ...(Platform.OS !== 'android' && {
                                                zIndex: 7,
                                            }),
                                        }}>
                                            <Dropdown
                                                label='machine'
                                                open={openMachine}
                                                setOpen={(v: boolean) => setOpenMachine(v)}
                                                selectedValue={values.machineId}
                                                setDebouncedSearchQuery={(value) => setDebouncedSearchQueryMachine(value)}
                                                items={itemsMachine}
                                                setSelectedValue={(stringValue: string | null) => {
                                                    handelChange("machineId", stringValue)
                                                }}
                                                isFetching={isFetchingmachine}
                                                fetchNextPage={fetchNextPageMachine}
                                                handleScroll={handleScrollMachine}
                                                error={Boolean(touched.machineId && Boolean(errors.machineId))}
                                                errorMessage={touched.machineId ? errors.machineId : ""}
                                            />
                                        </View>
                                        <View style={{
                                            ...(Platform.OS !== 'android' && {
                                                zIndex: 6,
                                            }),
                                        }}>
                                            <Dropdown
                                                label='form'
                                                open={openForm}
                                                setOpen={(v: boolean) => setOpenForm(v)}
                                                selectedValue={values.formId}
                                                setDebouncedSearchQuery={(value) => setDebouncedSearchQueryForm(value)}
                                                items={itemsForm}
                                                setSelectedValue={(stringValue: string | null) => {
                                                    handelChange("formId", stringValue)
                                                }}
                                                isFetching={isFetchingForm}
                                                fetchNextPage={fetchNextPageForm}
                                                handleScroll={handleScrollForm}
                                                error={Boolean(touched.formId && Boolean(errors.formId))}
                                                errorMessage={touched.formId ? errors.formId : ""}
                                            />
                                        </View>

                                        <View id="form-action-mfmd" style={masterdataStyles.containerAction}>
                                            <TouchableOpacity
                                                onPress={() => handleSubmit()}
                                                disabled={!isValid || !dirty}
                                                style={[
                                                    masterdataStyles.button,
                                                    masterdataStyles.backMain,
                                                    { opacity: isValid && dirty ? 1 : 0.5 }
                                                ]}
                                                testID="Save-mfmd"
                                            >
                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-mfmd">
                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Cancel</Text>
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