import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Formik } from "formik";
import * as Yup from 'yup';
import { Portal, Switch, Dialog, HelperText, Icon } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";
import { fetchCheckListOption, fetchGroupCheckListOption, fetchSearchCheckListOption, fetchSearchGroupCheckListOption } from "@/app/services";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { Dropdown, DropdownMulti } from "../common";
import { useRes } from "@/app/contexts/useRes";
import HeaderDialog from "./HeaderDialog";
import { useSelector } from "react-redux";
import { CheckListOption } from "@/typing/screens/CheckListOption";
import { InitialValuesMatchCheckListOption, MatchChecklistOptionProps } from "@/typing/screens/MatchCheckListOption";

const validationSchema = Yup.object().shape({
    groupCheckListOptionId: Yup.string().required("This group check list field is required"),
    checkListOptionId: Yup.array().of(Yup.string()).min(1, "The check list option field requires at least one option to be selected"),
    isActive: Yup.boolean().required("The active field is required."),
});

const Match_checklist_option = React.memo(({ isVisible, setIsVisible, isEditing, initialValues, saveData }: MatchChecklistOptionProps<InitialValuesMatchCheckListOption>) => {
    const masterdataStyles = useMasterdataStyles();
    const { theme } = useTheme();
    const { spacing } = useRes()
    const state = useSelector((state: any) => state.prefix);

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
                const newItems = newData.pages.flat().filter((item) => !isEditing ? item.IsActive : item).map((item) => ({
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
                const newItems = newData.pages.flat().filter((item) => !isEditing ? item.IsActive : item).map((item) => ({
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
        if (isEditing) {
            setDebouncedSearchQuery(initialValues.groupCheckListOptionName ?? "");
            queryClient.invalidateQueries('checkListOption');

        } else {
            queryClient.invalidateQueries('checkListOption');
            queryClient.invalidateQueries('groupCheckListOption');
        }

    }, [initialValues, isEditing]);

    const handleScroll = ({ nativeEvent }: any) => {
        if (nativeEvent?.contentSize && nativeEvent?.layoutMeasurement) {
            const { contentHeight, layoutHeight, contentOffset } = nativeEvent;
            if (contentHeight - layoutHeight - contentOffset.y <= 0 && hasNextPageCL && !isFetchingCL) {
                fetchNextPageCL();
            }
        }
    };

    const handleScrollCO = ({ nativeEvent }: any) => {
        if (nativeEvent?.contentSize && nativeEvent?.layoutMeasurement) {
            const { contentHeight, layoutHeight, contentOffset } = nativeEvent;
            if (contentHeight - layoutHeight - contentOffset.y <= 0 && hasNextPageCO && !isFetchingCO) {
                fetchNextPageCO();
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
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog}>
                <Dialog.Content>
                    <HeaderDialog isEditing setIsVisible={() => setIsVisible(false)} display={state.MatchCheckListOption} />

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        validateOnBlur={false}
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

                                setItemsCO((prevItems) => {
                                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                                    return [...prevItems, ...options.filter((item) => !newItemsSet.has(item.value))];
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
                                    <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 20, paddingLeft: 10 }]}>
                                        {state.GroupCheckList}
                                    </Text>

                                    <Dropdown
                                        label={state.GroupCheckList}
                                        disable={isEditing && (values.disables || values.delete)}
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
                                    />

                                    <HelperText
                                        type="error"
                                        visible={Boolean(touched.groupCheckListOptionId && errors.groupCheckListOptionId)}
                                        style={[{ display: Boolean(touched.groupCheckListOptionId && errors.groupCheckListOptionId) ? 'flex' : 'none' }, masterdataStyles.errorText]}
                                    >
                                        {errors.groupCheckListOptionId || ""}
                                    </HelperText>

                                    <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 5, paddingLeft: 10 }]}>
                                        {state.CheckListOption}
                                    </Text>

                                    <DropdownMulti
                                        label={state.CheckListOption}
                                        open={openCO}
                                        setOpen={setOpenCO}
                                        disable={isEditing && (values.disables || values.delete)}
                                        searchQuery={debouncedSearchQueryCO}
                                        setDebouncedSearchQuery={setDebouncedSearchQueryCO}
                                        items={itemsCO}
                                        isFetching={isFetchingCO}
                                        fetchNextPage={fetchNextPageCO}
                                        handleScroll={handleScrollCO}
                                        selectedValue={values.checkListOptionId}
                                        setSelectedValue={(value: string | string[] | null) => handelChange("checkListOptionId", value)}
                                    />

                                    <HelperText
                                        type="error"
                                        visible={Boolean(touched.checkListOptionId && errors.checkListOptionId)}
                                        style={[{ display: Boolean(touched.checkListOptionId && errors.checkListOptionId) ? 'flex' : 'none' }, masterdataStyles.errorText]}
                                    >
                                        {errors.checkListOptionId || ""}
                                    </HelperText>

                                    <ScrollView showsVerticalScrollIndicator={false}>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 10 }}>
                                            {values.checkListOptionId && Array.isArray(values.checkListOptionId) && values.checkListOptionId.length > 0 && values.checkListOptionId?.map((item, index) => (
                                                <TouchableOpacity onPress={() => {
                                                    setFieldValue("checkListOptionId", values.checkListOptionId && Array.isArray(values.checkListOptionId) && values.checkListOptionId.filter((id) => id !== item))
                                                }} key={index} disabled={isEditing && (values.disables || values.delete)}>
                                                    <View id="container-renderSelect" style={masterdataStyles.selectedStyle}>
                                                        <Text style={masterdataStyles.textFFF}>{itemsCO.find((v) => v.value === item)?.label}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>

                                    <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 10, paddingLeft: 10 }]}>
                                        {`${state.MatchCheckListOption} Status`}
                                    </Text>

                                    <View id="form-active-mcod" style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            {values.isActive ? "Active" : "Inactive"}
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
                            );
                        }}
                    </Formik>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
});

export default Match_checklist_option;
