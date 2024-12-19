import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Formik } from "formik";
import * as Yup from 'yup';
import { Portal, Switch, Dialog } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { CheckListOption, GroupCheckListOption } from '@/typing/type';
import { InitialValuesMatchCheckListOption, MatchChecklistOptionProps } from '@/typing/value';
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";
import { fetchCheckListOption, fetchGroupCheckListOption, fetchSearchCheckListOption, fetchSearchGroupCheckListOption } from "@/app/services";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { Dropdown, DropdownMulti } from "../common";

const validationSchema = Yup.object().shape({
    groupCheckListOptionId: Yup.string().required("This group check list field is required"),
    checkListOptionId: Yup.array().of(Yup.string()).min(1, "The check list option field requires at least one option to be selected"),
    isActive: Yup.boolean().required("The active field is required."),
});

const Match_checklist_option = React.memo(({
    isVisible,
    setIsVisible,
    isEditing,
    initialValues,
    saveData,
}: MatchChecklistOptionProps<InitialValuesMatchCheckListOption>) => {
    const masterdataStyles = useMasterdataStyles();
    const { theme } = useTheme();
    const [open, setOpen] = useState(false);
    const [openCO, setOpenCO] = useState(false);

    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [debouncedSearchQueryCO, setDebouncedSearchQueryCO] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [itemsCO, setItemsCO] = useState<any[]>([]);

    const { data: checkListOption, isFetching: isFetchingCO, fetchNextPage: fetchNextPageCO, hasNextPage: hasNextPageCO, refetch: refetchCO } = useInfiniteQuery(
        ['checkListOption', debouncedSearchQueryCO],
        ({ pageParam = 0 }) => {
            return debouncedSearchQueryCO
                ? fetchSearchCheckListOption(debouncedSearchQueryCO)
                : fetchCheckListOption(pageParam, 100);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 100 ? allPages.length : undefined;
            },
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().map((item) => ({
                    ...item,
                    label: item.CLOptionName || 'Unknown',
                    value: item.CLOptionID || '',
                }));

                setItemsCO((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    return [...prevItems, ...newItems.filter((item) => !newItemsSet.has(item.value))];
                });
            },
        }
    );

    const { data, isFetching: isFetchingCL, fetchNextPage: fetchNextPageCL, hasNextPage: hasNextPageCL, refetch: refetchCL } = useInfiniteQuery(
        ['groupCheckListOption', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchGroupCheckListOption(debouncedSearchQuery)
                : fetchGroupCheckListOption(pageParam, 100);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 100 ? allPages.length : undefined;
            },
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().map((item) => ({
                    ...item,
                    label: item.GCLOptionName || 'Unknown',
                    value: item.GCLOptionID || '',
                }));

                setItems((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    return [...prevItems, ...newItems.filter((item) => !newItemsSet.has(item.value))];
                });
            },
        }
    );
    const queryClient = useQueryClient();

    useEffect(() => {
        debouncedSearchQuery === '' && refetchCL()
        debouncedSearchQueryCO === '' && refetchCO()
    }, [debouncedSearchQuery, debouncedSearchQueryCO]);

    useEffect(() => {
        setDebouncedSearchQuery(initialValues.groupCheckListOptionId ?? "");
        queryClient.invalidateQueries('checkListOption');

    }, [initialValues]);

    const handleScroll = ({ nativeEvent }: any) => {
        if (nativeEvent.contentSize && nativeEvent.layoutMeasurement) {
            const { contentHeight, layoutHeight, contentOffset } = nativeEvent;
            if (contentHeight - layoutHeight - contentOffset.y <= 0 && hasNextPageCL && !isFetchingCL) {
                fetchNextPageCL();
            }
        }
    };

    const handleScrollCO = ({ nativeEvent }: any) => {
        if (nativeEvent.contentSize && nativeEvent.layoutMeasurement) {
            const { contentHeight, layoutHeight, contentOffset } = nativeEvent;
            if (contentHeight - layoutHeight - contentOffset.y <= 0 && hasNextPageCO && !isFetchingCO) {
                fetchNextPageCO();
            }
        }
    };

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog}>
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold]}>{isEditing ? "Edit" : "Create"}</Dialog.Title>
                <Dialog.Content>
                    <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10 }]}>
                        {isEditing ? "Edit the details of the match check list option & group check list option." : "Enter the details for the match check list option & group check list option."}
                    </Text>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values: InitialValuesMatchCheckListOption) => saveData(values)}
                    >
                        {({ values, errors, touched, handleSubmit, setFieldValue, dirty, isValid, setFieldTouched }) => {
                            const handleDataOption = useCallback(async () => {
                                let options: { label: string; value: string; }[] = [];
                                if (values.groupCheckListOptionId) {
                                    const filteredItems = items.filter(option => option.GCLOptionID === values.groupCheckListOptionId);
                                    options = filteredItems.flatMap(option => option.CheckListOptions?.map((item: CheckListOption) => ({
                                        label: item.CLOptionName,
                                        value: item.CLOptionID,
                                    })) || []);
                                }

                                setItemsCO(prevOptions => {
                                    return JSON.stringify(prevOptions) === JSON.stringify(options) ? prevOptions : options;
                                });
                            }, [values.groupCheckListOptionId, items]);

                            useEffect(() => {
                                if (values.groupCheckListOptionId && isEditing) handleDataOption();
                            }, [values.groupCheckListOptionId, items]);

                            const handelChange = (field: string, value: any) => {
                                setFieldTouched(field, true);
                                setFieldValue(field, value);
                            };

                            return (
                                <View id="form-mcod">
                                    <Dropdown
                                        label='Group Check List Type'
                                        open={open}
                                        setOpen={setOpen}
                                        setDebouncedSearchQuery={setDebouncedSearchQuery}
                                        searchQuery={debouncedSearchQuery}
                                        items={items}
                                        isFetching={isFetchingCL}
                                        fetchNextPage={fetchNextPageCL}
                                        handleScroll={handleScroll}
                                        selectedValue={values.groupCheckListOptionId}
                                        setSelectedValue={(value: string | null) => handelChange("groupCheckListOptionId", value)}
                                        error={Boolean(touched.groupCheckListOptionId && errors.groupCheckListOptionId)}
                                        errorMessage={errors.groupCheckListOptionId || ""}
                                    />

                                    <DropdownMulti
                                        label='Check List Type'
                                        open={openCO}
                                        setOpen={setOpenCO}
                                        searchQuery={debouncedSearchQueryCO}
                                        setDebouncedSearchQuery={setDebouncedSearchQueryCO}
                                        items={itemsCO}
                                        isFetching={isFetchingCO}
                                        fetchNextPage={fetchNextPageCO}
                                        handleScroll={handleScrollCO}
                                        selectedValue={values.checkListOptionId}
                                        setSelectedValue={(value: string | string[] | null) => handelChange("checkListOptionId", value)}
                                        error={Boolean(touched.checkListOptionId && errors.checkListOptionId)}
                                        errorMessage={String(errors.checkListOptionId || "")}
                                    />

                                    <View id="form-active-mcod" style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            Status: {values.isActive ? "Active" : "Inactive"}
                                        </Text>
                                        <Switch
                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                            color={values.disables ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                            value={values.isActive}
                                            disabled={Boolean(values.disables)}
                                            onValueChange={(v: boolean) => {
                                                setFieldValue("isActive", v);
                                            }}
                                            testID="isActive-mcod"
                                        />
                                    </View>

                                    <View id="form-action-mcod" style={masterdataStyles.containerAction}>
                                        <TouchableOpacity
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                masterdataStyles.backMain,
                                                { opacity: isValid && dirty ? 1 : 0.5 }
                                            ]}
                                            testID="Save-mcod"
                                        >
                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Save</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-mcod">
                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        }}
                    </Formik>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
});

export default Match_checklist_option;
