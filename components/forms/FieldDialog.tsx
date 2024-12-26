import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from "react";
import { ActivityIndicator, Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { Checkboxs, Dropdown, Inputs } from "@/components/common";
import { Portal, Dialog, Switch, Icon, HelperText } from "react-native-paper";
import { Formik, Field } from "formik";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import useMasterdataStyles from "@/styles/common/masterdata";
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { FieldDialogProps } from "@/typing/tag";
import Text from "@/components/Text";
import { styles } from "../screens/Schedule";
import useField from "@/hooks/FieldDialog";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import { fetchCheckList, fetchCheckListOption, fetchGroupCheckListOption, fetchSearchCheckList, fetchSearchCheckListOption, fetchSearchGroupCheckListOption, saveCheckList, saveCheckListOption, saveGroupCheckListOption } from "@/app/services";
import { InitialValuesChecklist, InitialValuesCheckListOption, InitialValuesGroupCheckList } from "@/typing/value";
import { useSelector } from "react-redux";
import { CheckListOption } from "@/typing/type";
import * as Yup from "yup";

const AnimatedView = Animated.createAnimatedComponent(View);

const LazyInfoGroup_dialog = lazy(() => import("../screens/InfoGroup_dialog"));
const LazyGroupCreate_dialog = lazy(() => import("../screens/GroupCreate_dialog"));
const LazyCheckListCreate_dialog = lazy(() => import("../screens/CheckListCreate_dialog"));

const CustomDialog = React.memo(({ visible, onDismiss, children }: { visible: boolean, onDismiss: any, children: any }) => {
    const { responsive } = useRes();

    return <Dialog
        visible={visible}
        style={{ zIndex: 3, width: responsive === "large" ? 500 : "60%", alignSelf: 'center', padding: 20, borderRadius: 0 }}
        onDismiss={onDismiss}
    >
        {children}
    </Dialog>
});

const FieldDialog = React.memo(({ isVisible, formState, onDeleteField, editMode, setShowDialogs }: FieldDialogProps) => {
    console.log("FieldDialog");

    const masterdataStyles = useMasterdataStyles();
    const [option, setOption] = useState<{ label: string; value: string; }[]>([]);
    const [shouldRender, setShouldRender] = useState<string>('');
    const [shouldRenderDT, setShouldRenderDT] = useState<boolean>(false);

    const [shouldRenderIT, setShouldRenderIT] = useState<boolean>(false);
    const [dialogAdd, setDialogAdd] = useState<{ CheckList: boolean, GroupCheckList: boolean, CheckListOption: boolean }>({ CheckList: false, GroupCheckList: false, CheckListOption: false });
    const [info, setInfo] = useState<{ GroupCheckList: boolean }>({ GroupCheckList: false })

    const glc = useRef<string | undefined>(undefined)

    const handelInfo = useCallback((v: boolean, field: string) => {
        setInfo((prev) => ({ ...prev, [field]: v }))
    }, [])

    const handelAdd = useCallback((v: boolean, field: string) => {
        setDialogAdd((prev) => ({ ...prev, [field]: v }))
    }, [])

    const queryClient = useQueryClient();
    const { handleError, showSuccess } = useToast()
    const { checkListTypes, dataType, handleSaveField, validationSchema } = useField();
    const state = useSelector((state: any) => state.prefix);

    const mutation = useMutation(saveCheckList, {
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries("checkList");
        },
        onError: handleError,
    });

    const mutationG = useMutation(saveGroupCheckListOption, {
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries("groupCheckListOption");
        },
        onError: handleError,
    });

    const mutationCL = useMutation(saveCheckListOption, {
        onSuccess: (data) => {
            showSuccess(data.message);
            queryClient.invalidateQueries("checkListOption");
        },
        onError: handleError,
    });

    const saveDataCheckListOption = useCallback(async (values: InitialValuesCheckListOption) => {
        const data = {
            Prefix: state.CheckListOption ?? "",
            CLOptionID: values.checkListOptionId,
            CLOptionName: values.checkListOptionName,
            IsActive: values.isActive,
            Disables: values.disables,
        };

        mutationCL.mutate(data);
    }, [mutationCL]);

    const saveDataCheckList = useCallback((values: InitialValuesChecklist) => {
        mutation.mutate({
            Prefix: state.CheckList ?? "",
            CListID: "",
            CListName: values.checkListName,
            IsActive: values.isActive,
            Disables: values.disables,
        });
    },
        [mutation, state.CheckList]
    );

    const saveDataGroupCheckList = useCallback((values: InitialValuesGroupCheckList, options: string[]) => {
        mutationG.mutate({
            Prefix: state.GroupCheckList ?? "",
            PrefixMatch: state.MatchCheckListOption ?? "",
            GCLOptionID: values.groupCheckListOptionId,
            GCLOptionName: values.groupCheckListOptionName,
            IsActive: values.isActive,
            Disables: values.disables,
            Options: JSON.stringify(options),
        });
    },
        [mutationG, state.GroupCheckList, state.MatchCheckListOption]
    );

    const [open, setOpen] = useState<{ CheckList: boolean, MatchChecklist: boolean, CheckListType: boolean, DataType: boolean }>({ CheckList: false, MatchChecklist: false, CheckListType: false, DataType: false });
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<{ CheckList: string, MatchChecklist: string }>({ CheckList: '', MatchChecklist: '' });
    const [itemsCL, setItemsCL] = useState<{ label: string; value: string }[]>([]);
    const [itemsML, setItemsML] = useState<any[]>([]);

    const { data: checkList, isFetching: isFetchingCL, fetchNextPage: fetchNextPageCL, hasNextPage: hasNextPageCL, refetch: refetchCL } = useInfiniteQuery(
        ['checkList', debouncedSearchQuery.CheckList],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery.CheckList
                ? fetchSearchCheckList(debouncedSearchQuery.CheckList)
                : fetchCheckList(pageParam, 100);
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
                    label: item.CListName || 'Unknown',
                    value: item.CListID || '',
                }));

                setItemsCL((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            },
        }
    );

    const { data: groupCheckListOption, isFetching: isFetchingML, fetchNextPage: fetchNextPageML, hasNextPage: hasNextPageML, refetch: refetchML } = useInfiniteQuery(
        ['groupCheckListOption', debouncedSearchQuery.MatchChecklist],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery.MatchChecklist
                ? fetchSearchGroupCheckListOption(debouncedSearchQuery.MatchChecklist)
                : fetchGroupCheckListOption(pageParam, 100);
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
                    ...item,
                    label: item.GCLOptionName || 'Unknown',
                    value: item.GCLOptionID || '',
                }));

                setItemsML((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            }

        }
    );

    const handleScrollCL = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent?.contentSize) {
            const contentHeight = nativeEvent?.contentSize.height;
            const layoutHeight = nativeEvent?.layoutMeasurement.height;
            const offsetY = nativeEvent?.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPageCL && !isFetchingCL) {
                fetchNextPageCL();
            }
        }
    };

    const handleScrollML = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent?.contentSize) {
            const contentHeight = nativeEvent?.contentSize.height;
            const layoutHeight = nativeEvent?.layoutMeasurement.height;
            const offsetY = nativeEvent?.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPageML && !isFetchingML) {
                fetchNextPageML();
            }
        }
    };

    useEffect(() => {
        if (editMode) {
            setDebouncedSearchQuery({ CheckList: formState.CListName ?? "", MatchChecklist: formState.GCLOptionName ?? "" })
        } else {
            queryClient.invalidateQueries("checkList")
        }
        queryClient.invalidateQueries("groupCheckListOption")
        queryClient.invalidateQueries("checkListOption")

    }, [editMode, formState]);

    const { spacing, responsive } = useRes();
    const { theme } = useTheme();

    const RenderView = Platform.OS === 'web' ? AnimatedView : View;

    const animatedText = useAnimatedStyle(() => ({
        opacity: shouldRender !== "" ? 1 : 0,
        transform: [{ scale: withTiming(shouldRender !== "" ? 1 : 0.5, { duration: 300 }) }]
    }), [shouldRender]);

    const animatedStyleNumber = useAnimatedStyle(() => ({
        opacity: shouldRenderDT ? 1 : 0,
        transform: [{ scale: withTiming(shouldRenderDT ? 1 : 0.5, { duration: 300 }) }]
    }), [shouldRenderDT]);

    const animatedStyleIT = useAnimatedStyle(() => {
        if (shouldRenderIT) {
            if (shouldRenderDT) {
                return { opacity: 1, transform: [{ scale: withTiming(1, { duration: 300 }) }] };
            } else if (option?.length > 0) {
                return { opacity: 1, transform: [{ scale: withTiming(1, { duration: 300 }) }] };
            } else {
                return { opacity: 0, transform: [{ scale: withTiming(0.5, { duration: 300 }) }] };
            }
        } else {
            return { opacity: 0, transform: [{ scale: withTiming(0.5, { duration: 300 }) }] };
        }
    }, [shouldRenderIT, shouldRenderDT, option]);

    useEffect(() => {

        if (!isVisible) {
            setOption([]);
            setShouldRender('');
            setShouldRenderDT(false);
            setShouldRenderIT(false);
        }
    }, [isVisible]);

    const handleDismissDialog = useCallback(() => {
        if (!isVisible) {
            setShowDialogs();
        }
    }, [isVisible, setShowDialogs]);

    const memoizedAnimatedText = useMemo(() => animatedText, [shouldRender]);
    const memoizedAnimatedDT = useMemo(() => animatedStyleNumber, [shouldRenderDT]);
    const memoizedAnimatedIT = useMemo(() => animatedStyleIT, [shouldRenderIT, shouldRenderDT, option]);

    const [itemsCLO, setItemsCLO] = useState<any[]>([]);
    const [debouncedSearchQueryCLO, setDebouncedSearchQueryCLO] = useState("");

    const { data: checkListOption, isFetching: isFetchingCLO, fetchNextPage: fetchNextPageCLO, hasNextPage: hasNextPageCLO, refetch: refetchCLO } = useInfiniteQuery(
        ['checkListOption', debouncedSearchQueryCLO],
        ({ pageParam = 0 }) => {
            return debouncedSearchQueryCLO
                ? fetchSearchCheckListOption(debouncedSearchQueryCLO)
                : fetchCheckListOption(pageParam, 100);
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
                    ...item,
                    label: item.CLOptionName || 'Unknown',
                    value: item.CLOptionID || '',
                }));

                setItemsCLO((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            }

        }
    );

    const handleScrollCLO = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent?.contentSize) {
            const contentHeight = nativeEvent?.contentSize.height;
            const layoutHeight = nativeEvent?.layoutMeasurement.height;
            const offsetY = nativeEvent?.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPageCLO && !isFetchingCLO) {
                fetchNextPageCLO();
            }
        }
    };

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={handleDismissDialog} style={[masterdataStyles.containerDialog, { width: responsive === "large" ? 650 : '80%' }]}>
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]}>
                    {editMode ? "Edit check list" : "Create check list"}
                </Dialog.Title>

                <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 30 }]}>
                    {editMode ? "Edit the details of the field." : "Enter the details for the new field."}
                </Text>

                {isVisible && (
                    <Formik
                        initialValues={formState}
                        validationSchema={validationSchema}
                        onSubmit={values => {
                            handleSaveField(values, editMode ? "update" : "add")
                            setShowDialogs()
                        }}
                        validateOnBlur={false}
                    >
                        {({ setFieldValue, values, handleSubmit, setFieldTouched, touched, errors, setFieldError }) => {
                            glc.current = values.GCLOptionID

                            // const updateRenderStates = useCallback(() => {
                            //     const checkListTypeItem = checkListTypes.find(item => item.CTypeID === values.CTypeID)?.CTypeName ?? "";
                            //     const newRender = ["Dropdown", "Radio", "Checkbox"].includes(checkListTypeItem)
                            //         ? "detail"
                            //         : ["Textinput", "Time"].includes(checkListTypeItem)
                            //             ? "text"
                            //             : ["Text"].includes(checkListTypeItem) ? "label" : "";

                            //     if (newRender !== shouldRender) {
                            //         if (newRender === "detail") {
                            //             setFieldValue("DTypeID", null);
                            //         } else {
                            //             setFieldValue("GCLOptionID", null);
                            //             setFieldValue("GCLOptionName", null)
                            //         }
                            //         setShouldRender(newRender);
                            //     }
                            // }, [values.CTypeID, checkListTypes, shouldRender, setFieldValue]);

                            // useEffect(() => {
                            //     if (values.CTypeID) updateRenderStates();
                            // }, [values.CTypeID, updateRenderStates]);

                            // const options = useMemo(() => {
                            //     if (values.GCLOptionID) {
                            //         const filteredItems = itemsML.filter(option => option.GCLOptionID === values.GCLOptionID);
                            //         setFieldValue("GCLOptionName", filteredItems[0]?.GCLOptionName);

                            //         return filteredItems?.flatMap(option => {
                            //             return option.CheckListOptions?.map((item: CheckListOption) => ({
                            //                 label: item.CLOptionName,
                            //                 value: item.CLOptionID,
                            //             })) || [];
                            //         }) || [];
                            //     }
                            //     return [];
                            // }, [values.GCLOptionID, itemsML, setFieldValue]);

                            // const updateImportantList = useCallback((modifications: { Value?: string | string[]; MinLength?: number; MaxLength?: number; }) => {
                            //     if (Array.isArray(values.ImportantList)) {
                            //         const idMcl = `MCL-ADD-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
                            //         const updatedList = values.ImportantList.map(item => ({
                            //             ...item,
                            //             ...modifications,
                            //             MCListID: item.MCListID || idMcl,
                            //         }));

                            //         if (JSON.stringify(values.ImportantList) !== JSON.stringify(updatedList)) {
                            //             setFieldValue("ImportantList", [...updatedList]);
                            //         }
                            //     }
                            // }, [values.ImportantList, setFieldValue]);

                            // useEffect(() => {
                            //     setOption(options);


                            //     if (values.Important !== shouldRenderIT) {
                            //         setShouldRenderIT(values.Important);
                            //     }
                            //     const dataTypeItem = values.DTypeID ? dataType.find(item => item.DTypeID === values.DTypeID)?.DTypeName : undefined;

                            //     if (values.Important) {
                            //         if (dataTypeItem === "Number") {
                            //             updateImportantList({ Value: undefined });
                            //         } else {
                            //             updateImportantList({ MinLength: undefined, MaxLength: undefined });
                            //         }
                            //     }
                            //     setShouldRenderDT(dataTypeItem === "Number");
                            // }, [values.GCLOptionID, itemsML, values.DTypeID, values.Important, dataType, checkListTypes]);

                            // const shouldRenderDT = useMemo(() => {
                            //     return values.DTypeID ? dataType.find(item => item.DTypeID === values.DTypeID)?.DTypeName === "Number" : false;
                            // }, [values.DTypeID, dataType]);

                            console.log("values", values);

                            return (
                                <View style={{ marginHorizontal: 12 }}>

                                    <ScrollView
                                        contentContainerStyle={{ paddingBottom: 5, paddingHorizontal: 10 }}
                                        showsVerticalScrollIndicator={false}
                                        style={{ maxHeight: Platform.OS === "web" ? 330 : '68%' }}
                                        keyboardShouldPersistTaps="handled"
                                        nestedScrollEnabled={true}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ flex: 1 }}>
                                                <Dropdown
                                                    label='check list'
                                                    open={open.CheckList}
                                                    searchQuery={debouncedSearchQuery.CheckList}
                                                    setOpen={(v: boolean) => setOpen((prev) => ({ ...prev, CheckList: v }))}
                                                    selectedValue={values.CListID}
                                                    setDebouncedSearchQuery={(value: string) => setDebouncedSearchQuery((prev) => ({ ...prev, CheckList: value }))}
                                                    items={itemsCL}
                                                    setSelectedValue={(stringValue: string | null) => {
                                                        setFieldTouched("CListID", true);
                                                        setFieldValue("CListID", stringValue);
                                                    }}
                                                    isFetching={isFetchingCL}
                                                    fetchNextPage={fetchNextPageCL}
                                                    handleScroll={handleScrollCL}
                                                />
                                                <HelperText
                                                    type="error"
                                                    visible={Boolean(touched.CListID && Boolean(errors.CListID))}
                                                    style={[{ display: Boolean(touched.CListID && Boolean(errors.CListID)) ? 'flex' : 'none' }, masterdataStyles.errorText]}
                                                >
                                                    {touched.CListID ? errors.CListID : ""}
                                                </HelperText>
                                            </View>

                                            <View>
                                                <TouchableOpacity
                                                    onPress={() => handelAdd(true, "CheckList")}
                                                    style={{
                                                        alignItems: 'center',
                                                        paddingRight: 5,
                                                    }}
                                                >
                                                    <Icon source={"plus-box"} size={spacing.large + 3} color={theme.colors.drag} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <Dropdown
                                            label='check list type'
                                            search={false}
                                            open={open.CheckListType}
                                            setOpen={(v: boolean) => setOpen((prev) => ({ ...prev, CheckListType: v }))}
                                            selectedValue={values.CTypeID}
                                            items={editMode ? checkListTypes.map((v => ({
                                                label: v.CTypeTitle,
                                                value: v.CTypeID,
                                            }))) : checkListTypes.filter(v => v.IsActive).map((v => ({
                                                label: v.CTypeTitle,
                                                value: v.CTypeID,
                                            })))}
                                            setSelectedValue={(stringValue: string | null) => {
                                                setFieldTouched("CTypeID", true);
                                                setFieldValue("CTypeID", stringValue);
                                            }}
                                        />

                                        <HelperText
                                            type="error"
                                            visible={Boolean(touched.CTypeID && Boolean(errors.CTypeID))}
                                            style={[{ display: Boolean(touched.CTypeID && Boolean(errors.CTypeID)) ? 'flex' : 'none' }, masterdataStyles.errorText]}
                                        >
                                            {touched.CTypeID ? errors.CTypeID : ""}
                                        </HelperText>

                                        {shouldRender === "detail" && (
                                            <RenderView style={Platform.OS === 'web' ? memoizedAnimatedText : { opacity: 1 }}>
                                                <View style={{ flex: 1 }}>
                                                    <Dropdown
                                                        label="match check list"
                                                        open={open.MatchChecklist}
                                                        setOpen={(v: boolean) => setOpen((prev) => ({ ...prev, MatchChecklist: v }))}
                                                        selectedValue={values.GCLOptionID}
                                                        searchQuery={debouncedSearchQuery.MatchChecklist}
                                                        setDebouncedSearchQuery={(value: string) =>
                                                            setDebouncedSearchQuery((prev) => ({ ...prev, MatchChecklist: value }))
                                                        }
                                                        items={itemsML}
                                                        setSelectedValue={(stringValue: string | null) => {
                                                            setFieldTouched('GCLOptionID', true);
                                                            setFieldValue('GCLOptionID', stringValue, true);

                                                            // updateImportantList({ Value: undefined });
                                                        }}
                                                        isFetching={isFetchingCL}
                                                        fetchNextPage={fetchNextPageML}
                                                        handleScroll={handleScrollML}
                                                    />
                                                    <HelperText
                                                        type="error"
                                                        visible={Boolean(touched.GCLOptionID && Boolean(errors.GCLOptionID))}
                                                        style={[{ display: Boolean(touched.GCLOptionID && Boolean(errors.GCLOptionID)) ? 'flex' : 'none' }, masterdataStyles.errorText]}
                                                    >
                                                        {touched.GCLOptionID ? errors.GCLOptionID : ""}
                                                    </HelperText>
                                                </View>

                                                <TouchableOpacity
                                                    onPress={() => {
                                                        handelInfo(true, "GroupCheckList")
                                                    }}
                                                    style={{
                                                        alignItems: 'center',
                                                        paddingRight: 5,
                                                        display: glc.current ? 'flex' : 'none'
                                                    }}
                                                >
                                                    <Icon source={"information"} size={spacing.large + 3} color={theme.colors.drag} />
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={() => {
                                                        handelAdd(true, "GroupCheckList")
                                                    }}
                                                    style={{
                                                        alignItems: 'center',
                                                        paddingRight: 5
                                                    }}
                                                >
                                                    <Icon source={"plus-box"} size={spacing.large + 3} color={theme.colors.drag} />
                                                </TouchableOpacity>
                                            </RenderView>
                                        )}

                                        {shouldRender === "text" && (
                                            <View>
                                                <RenderView style={Platform.OS === 'web' ? memoizedAnimatedText : { opacity: 1 }}>
                                                    <Dropdown
                                                        label='data type'
                                                        search={false}
                                                        open={open.DataType}
                                                        setOpen={(v: boolean) => setOpen((prev) => ({ ...prev, DataType: v }))}
                                                        selectedValue={values.DTypeID}
                                                        items={editMode ? dataType.map((v => ({
                                                            label: v.DTypeName,
                                                            value: v.DTypeID,
                                                        }))) : dataType.filter(v => v.IsActive).map((v => ({
                                                            label: v.DTypeName,
                                                            value: v.DTypeID,
                                                        })))}
                                                        setSelectedValue={(stringValue: string | null) => {
                                                            setFieldTouched("DTypeID", true);
                                                            setFieldValue("DTypeID", stringValue);
                                                        }}
                                                    />
                                                    <HelperText
                                                        type="error"
                                                        visible={Boolean(touched.DTypeID && Boolean(errors.DTypeID))}
                                                        style={[{ display: Boolean(touched.DTypeID && Boolean(errors.DTypeID)) ? 'flex' : 'none' }, masterdataStyles.errorText]}
                                                    >
                                                        {touched.DTypeID ? errors.DTypeID : ""}
                                                    </HelperText>
                                                </RenderView>
                                            </View>

                                        )}

                                        <Field name="Rowcolumn">
                                            {({ field, form }: any) => (
                                                <Inputs
                                                    placeholder="Columns"
                                                    label="Column in row"
                                                    handleChange={(value) => form.setFieldValue(field.name, value)}
                                                    handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                    value={String(field.value ?? "")}
                                                    error={form.touched?.Rowcolumn && Boolean(form.errors?.Rowcolumn)}
                                                    errorMessage={form.touched?.Rowcolumn ? form.errors?.Rowcolumn : ""}
                                                    testId={`Rowcolumn-form`}
                                                />
                                            )}
                                        </Field>

                                        {shouldRenderDT && (
                                            <RenderView style={Platform.OS === 'web' ? memoizedAnimatedDT : { opacity: 1 }}>
                                                <Field name="DTypeValue">
                                                    {({ field, form }: any) => (
                                                        <Inputs
                                                            placeholder="Digis Value"
                                                            label="Digit number"
                                                            handleChange={(value) => form.setFieldValue(field.name, value)}
                                                            handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                            value={String(field.value ?? "")}
                                                            error={form.touched?.DTypeValue && Boolean(form.errors?.DTypeValue)}
                                                            errorMessage={form.touched?.DTypeValue ? form.errors?.DTypeValue : ""}
                                                            testId={`DTypeValue-form`}
                                                        />
                                                    )}
                                                </Field >
                                            </RenderView>
                                        )}

                                        {shouldRender !== "label" && (
                                            <View id="form-active-fd" style={masterdataStyles.containerSwitch}>
                                                <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                                    Require: {values.Required ? "Yes" : "No"}
                                                </Text>
                                                <Switch
                                                    style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                    value={values.Required}
                                                    onValueChange={(v: boolean) => {
                                                        setFieldValue("Required", v);
                                                    }}
                                                    id="Required-form"
                                                />
                                            </View>
                                        )}

                                        {shouldRenderIT && shouldRender === "detail" && option?.length > 0 && (
                                            <RenderView style={Platform.OS === 'web' ? memoizedAnimatedIT : { opacity: 1 }}>

                                                <Text style={{ marginTop: 10, marginBottom: 10, paddingLeft: 10, fontSize: spacing.small, color: theme.colors.error }}>
                                                    {(values.ImportantList || []).some((item) => item.Value) ? "Select value is important!" : "Input value control!"}
                                                </Text>

                                                <Field name="ImportantList[0].Value" key={JSON.stringify(option)}>
                                                    {({ field, form }: any) => {
                                                        return (
                                                            <Checkboxs
                                                                option={option}
                                                                handleChange={(value) => {
                                                                    const processedValues = Array.isArray(value)
                                                                        ? value.filter((v: string) => v.trim() !== '')
                                                                        : String(value).split(',').filter((v: string) => v.trim() !== '');

                                                                    form.setFieldValue(field.name, processedValues);
                                                                    form.setFieldTouched(field.name, true);
                                                                }}
                                                                value={String(field.value ?? "")}
                                                                error={form.touched?.ImportantList?.[0]?.Value && Boolean(form.errors?.ImportantList?.[0]?.Value)}
                                                                errorMessage={form.touched?.ImportantList?.[0]?.Value ? form.errors?.ImportantList?.[0]?.Value : ""}
                                                                handleBlur={() => {
                                                                    form.setFieldTouched(field.name, true);
                                                                }}
                                                                testId="Value-Important-form-combined"
                                                            />
                                                        );
                                                    }}
                                                </Field>

                                            </RenderView>
                                        )}

                                        {shouldRenderIT && shouldRenderDT && (
                                            <RenderView style={Platform.OS === 'web' ? memoizedAnimatedIT : { opacity: 1 }}>
                                                <Text
                                                    style={[
                                                        { marginTop: 10, marginBottom: 10, paddingLeft: 10, fontSize: spacing.small, color: theme.colors.error }
                                                    ]}
                                                >
                                                    Input value control!
                                                </Text>
                                                <>
                                                    <Field name="ImportantList[0].MinLength">
                                                        {({ field, form }: any) => {
                                                            return (
                                                                <Inputs
                                                                    placeholder="Min Value"
                                                                    label="Min Value Control"
                                                                    handleChange={(value) => form.setFieldValue(field.name, value)}
                                                                    handleBlur={() => {
                                                                        form.setFieldTouched(field.name, true);
                                                                    }}
                                                                    value={String(field.value ?? "")}
                                                                    error={form.touched?.ImportantList?.[0]?.MinLength && Boolean(form.errors?.ImportantList?.[0]?.MinLength)}
                                                                    errorMessage={form.touched?.ImportantList?.[0]?.MinLength ? form.errors?.ImportantList?.[0]?.MinLength : ""}
                                                                    testId={`MinLength-form`}
                                                                />
                                                            )
                                                        }}
                                                    </Field>

                                                    <Field name="ImportantList[0].MaxLength">
                                                        {({ field, form }: any) => (
                                                            <Inputs
                                                                placeholder="Max Value"
                                                                label="Max Value Control"
                                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                                handleBlur={() => {
                                                                    form.setFieldTouched(field.name, true);
                                                                }}
                                                                value={String(field.value ?? "")}
                                                                error={form.touched?.ImportantList?.[0]?.MaxLength && Boolean(form.errors?.ImportantList?.[0]?.MaxLength)}
                                                                errorMessage={form.touched?.ImportantList?.[0]?.MaxLength ? form.errors?.ImportantList?.[0]?.MaxLength : ""}
                                                                testId={`MaxLength-form`}
                                                            />
                                                        )}
                                                    </Field>
                                                </>
                                            </RenderView>
                                        )}

                                        {shouldRender !== "label" && (
                                            <View id="form-important-fd" style={masterdataStyles.containerSwitch}>
                                                <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                                    Important: {values.Important ? "Yes" : "No"}
                                                </Text>
                                                <Switch
                                                    style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                    value={values.Important}
                                                    onValueChange={(v: boolean) => {
                                                        setFieldValue("Important", v);
                                                    }}
                                                    id="Important-form"
                                                />
                                            </View>
                                        )}

                                    </ScrollView>

                                    <Dialog.Actions>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                            <TouchableOpacity onPress={() => handleSubmit()} style={styles.actionButton}>
                                                <Text style={masterdataStyles.text}>{editMode ? "Update Field" : "Add Field"}</Text>
                                            </TouchableOpacity>

                                            {editMode && (
                                                <TouchableOpacity onPress={() => {
                                                    onDeleteField(values.SFormID, values.MCListID);
                                                    setShowDialogs();
                                                }} style={styles.actionButton}>
                                                    <Text style={masterdataStyles.text}>Delete</Text>
                                                </TouchableOpacity>
                                            )}

                                            <TouchableOpacity onPress={() => setShowDialogs()} style={styles.actionButton}>
                                                <Text style={masterdataStyles.text}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </Dialog.Actions>
                                </View>
                            );
                        }}
                    </Formik>
                )}

            </Dialog>

            {dialogAdd.CheckList && (
                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                    <CustomDialog visible={dialogAdd.CheckList} onDismiss={() => handelAdd(false, "CheckList")}>
                        <LazyCheckListCreate_dialog
                            setIsVisible={() => {
                                handelAdd(false, "CheckList");
                            }}
                            saveData={(value: any) => {
                                saveDataCheckList(value);
                                handelAdd(false, "CheckList");
                            }}
                        />
                    </CustomDialog>
                </Suspense>
            )}

            {info.GroupCheckList && (
                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                    <CustomDialog visible={info.GroupCheckList} onDismiss={() => handelInfo(false, "GroupCheckList")}>
                        <LazyInfoGroup_dialog
                            setDialogAdd={() => handelInfo(false, "GroupCheckList")}
                            option={option}
                        />
                    </CustomDialog>
                </Suspense>
            )}

            {dialogAdd.GroupCheckList && (
                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                    <CustomDialog visible={dialogAdd.GroupCheckList} onDismiss={() => handelAdd(false, "GroupCheckList")}>
                        <LazyGroupCreate_dialog
                            setIsVisible={() => {
                                handelAdd(false, "GroupCheckList");
                            }}
                            saveData={(value: any, mode: any) => {
                                saveDataGroupCheckList(value, mode);
                                handelAdd(false, "GroupCheckList");
                            }}
                            itemsCLO={itemsCLO}
                            debouncedSearchQuery={debouncedSearchQueryCLO}
                            setDebouncedSearchQuery={setDebouncedSearchQueryCLO}
                            handleScroll={handleScrollCLO}
                            isFetching={isFetchingCLO}
                            saveDataCheckListOption={saveDataCheckListOption}
                            key={`memooption`}
                        />
                    </CustomDialog>
                </Suspense>
            )}
        </Portal>
    );
});

export default FieldDialog;
