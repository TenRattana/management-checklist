import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { Checkboxs, Dropdown, Inputs } from "@/components/common";
import { Portal, Dialog, Switch, Icon } from "react-native-paper";
import { Formik, FastField } from "formik";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import { useToast } from "@/app/contexts/useToast";
import useMasterdataStyles from "@/styles/common/masterdata";
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { FieldDialogProps } from "@/typing/tag";
import Text from "@/components/Text";
import InfoGroup_dialog from "../screens/InfoGroup_dialog";
import GroupCreate_dialog from "../screens/GroupCreate_dialog";
import CheckListCreate_dialog from "../screens/CheckListCreate_dialog";
import { styles } from "../screens/Schedule";
import useField from "@/hooks/FieldDialog";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "react-query";
import { fetchCheckList, fetchCheckListOption, fetchGroupCheckListOption, fetchSearchCheckList, fetchSearchGroupCheckListOption, saveCheckList, saveCheckListOption, saveGroupCheckListOption } from "@/app/services";
import { InitialValuesChecklist, InitialValuesCheckListOption, InitialValuesGroupCheckList } from "@/typing/value";
import { useSelector } from "react-redux";
import { CheckListOption } from "@/typing/type";

const AnimatedView = Animated.createAnimatedComponent(View);

const FieldDialog = React.memo(({ isVisible, formState, onDeleteField, editMode, setShowDialogs }: FieldDialogProps) => {
    const masterdataStyles = useMasterdataStyles();
    const [option, setOption] = useState<{ label: string; value: string; }[]>([]);
    const [shouldRender, setShouldRender] = useState<string>('');
    const [shouldRenderDT, setShouldRenderDT] = useState<boolean>(false);
    console.log("FieldDialog");

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

    const saveDataCheckListOption = useCallback(async (values: InitialValuesCheckListOption) => {
        const data = {
            Prefix: state.CheckListOption ?? "",
            CLOptionID: values.checkListOptionId,
            CLOptionName: values.checkListOptionName,
            IsActive: values.isActive,
            Disables: values.disables,
        };

        mutationCL.mutate(data);
    }, [mutation]);

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

    const { data: checkListOption = [] } = useQuery("checkListOption", () => fetchCheckListOption(0, 10000), {
        staleTime: 1000 * 60 * 24,
        cacheTime: 1000 * 60 * 25,
    });

    useEffect(() => {
        console.log("useEffect 1");

        if (editMode) {
            setDebouncedSearchQuery({ CheckList: formState.CListName ?? "", MatchChecklist: formState.GCLOptionName ?? "" })
        } else {
            queryClient.invalidateQueries("checkList")
            queryClient.invalidateQueries("groupCheckListOption")
        }
    }, [editMode]);

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
        console.log("useEffect 3");

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

    const MemoChecklist_dialog = React.memo(CheckListCreate_dialog);
    const MemoCreateGroupOption_dialog = React.memo(GroupCreate_dialog);
    const memoizedAnimatedText = useMemo(() => animatedText, [shouldRender]);
    const memoizedAnimatedDT = useMemo(() => animatedStyleNumber, [shouldRenderDT]);
    const memoizedAnimatedIT = useMemo(() => animatedStyleIT, [shouldRenderIT, shouldRenderDT, option]);

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
                        validateOnChange={true}
                        onSubmit={values => {
                            handleSaveField(values, editMode ? "update" : "add")
                            setShowDialogs()
                        }}
                        enableReinitialize={true}
                    >
                        {({ setFieldValue, values, handleSubmit, isValid, dirty, setFieldTouched, touched, errors }) => {
                            glc.current = values.GCLOptionID

                            const updateRenderStates = useCallback(() => {
                                console.log("updateRenderStates");

                                const checkListTypeItem = checkListTypes.find(item => item.CTypeID === values.CTypeID)?.CTypeName ?? "";
                                const newRender = ["Dropdown", "Radio", "Checkbox"].includes(checkListTypeItem)
                                    ? "detail"
                                    : ["Textinput", "Time"].includes(checkListTypeItem)
                                        ? "text"
                                        : ["Text"].includes(checkListTypeItem) ? "label" : "";

                                if (newRender !== shouldRender) {
                                    if (newRender === "detail") {
                                        setFieldValue("DTypeID", null);
                                    } else {
                                        setFieldValue("GCLOptionID", null);
                                        setFieldValue("GCLOptionName", null)
                                    }
                                    setShouldRender(newRender);
                                }
                            }, [values.CTypeID, checkListTypes, shouldRender, setFieldValue]);

                            useEffect(() => {
                                console.log("useEffect form 3");

                                values.CTypeID && updateRenderStates();
                            }, [values.CTypeID]);

                            const updateImportantList = useCallback((modifications: { Value?: string | string[]; MinLength?: number; MaxLength?: number; }) => {
                                console.log("updateImportantList");

                                if (Array.isArray(values.ImportantList)) {
                                    const idMcl = `MCL-ADD-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
                                    const updatedList = values.ImportantList.map(item => ({
                                        ...item,
                                        ...modifications,
                                        MCListID: item.MCListID || idMcl,
                                    }));
                                    if (JSON.stringify(values.ImportantList) !== JSON.stringify(updatedList)) {
                                        setFieldValue("ImportantList", [...updatedList]);
                                    }
                                }
                            }, [values.ImportantList]);

                            const handleDataOption = useCallback(async () => {
                                console.log("handleDataOption");

                                let options: { label: string; value: string; }[] = [];

                                if (values.GCLOptionID) {
                                    const filteredItems = itemsML.filter(option => option.GCLOptionID === values.GCLOptionID);

                                    setFieldValue("GCLOptionName", filteredItems[0]?.GCLOptionName)

                                    options = filteredItems?.flatMap(option => {
                                        return option.CheckListOptions?.map((item: CheckListOption) => ({
                                            label: item.CLOptionName,
                                            value: item.CLOptionID,
                                        })) || [];
                                    }) || [];

                                    updateImportantList({ MinLength: undefined, MaxLength: undefined });
                                }

                                setOption(prevOptions => {
                                    const isEqual = JSON.stringify(prevOptions) === JSON.stringify(options);
                                    return isEqual ? prevOptions : options;
                                });

                            }, [values.GCLOptionID, itemsML]);

                            useEffect(() => {
                                console.log("useEffect form 2");

                                if (values.Important !== shouldRenderIT) {
                                    setShouldRenderIT(values.Important);

                                }
                                const dataTypeItem = values.DTypeID ? dataType.find(item => item.DTypeID === values.DTypeID)?.DTypeName : undefined;

                                if (values.Important) {

                                    if (dataTypeItem === "Number") {
                                        updateImportantList({ Value: undefined });
                                    } else {
                                        updateImportantList({ MinLength: undefined, MaxLength: undefined, Value: undefined });
                                    }
                                }

                                setShouldRenderDT(prevOptions => {
                                    const isEqual = prevOptions && (dataTypeItem === "Number")
                                    return isEqual ? prevOptions : isEqual;
                                });
                            }, [values.DTypeID, values.Important, dataType]);

                            useEffect(() => {
                                console.log("useEffect form 1");

                                values.GCLOptionID && handleDataOption();
                            }, [values.GCLOptionID, itemsML]);

                            const handelChange = (field: string, value: any) => {
                                console.log("handelChange");

                                setFieldTouched(field, true)
                                setFieldValue(field, value)
                            }

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
                                                        handelChange("CListID", stringValue)
                                                    }}
                                                    isFetching={isFetchingCL}
                                                    fetchNextPage={fetchNextPageCL}
                                                    handleScroll={handleScrollCL}
                                                    error={Boolean(touched.CListID && Boolean(errors.CListID))}
                                                    errorMessage={touched.CListID ? errors.CListID : ""}
                                                />
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
                                                handelChange("CTypeID", stringValue)
                                            }}
                                            error={Boolean(touched.CTypeID && Boolean(errors.CTypeID))}
                                            errorMessage={touched.CTypeID ? errors.CTypeID : ""}
                                        />

                                        {shouldRender === "detail" && (
                                            <RenderView style={Platform.OS === 'web' ? memoizedAnimatedText : { opacity: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Dropdown
                                                            label='match check list'
                                                            open={open.MatchChecklist}
                                                            setOpen={(v: boolean) => setOpen((prev) => ({ ...prev, MatchChecklist: v }))}
                                                            selectedValue={values.GCLOptionID}
                                                            searchQuery={debouncedSearchQuery.MatchChecklist}
                                                            setDebouncedSearchQuery={(value: string) => setDebouncedSearchQuery((prev) => ({ ...prev, MatchChecklist: value }))}
                                                            items={itemsML}
                                                            setSelectedValue={(stringValue: string | null) => {
                                                                handelChange("GCLOptionID", stringValue)
                                                            }}
                                                            isFetching={isFetchingCL}
                                                            fetchNextPage={fetchNextPageML}
                                                            handleScroll={handleScrollML}
                                                            error={Boolean(touched.GCLOptionID && Boolean(errors.GCLOptionID))}
                                                            errorMessage={touched.GCLOptionID ? errors.GCLOptionID : ""}
                                                        />
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
                                                </View>
                                            </RenderView>
                                        )}

                                        {shouldRender === "text" && (
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
                                                        handelChange("DTypeID", stringValue)
                                                    }}
                                                    error={Boolean(touched.DTypeID && Boolean(errors.DTypeID))}
                                                    errorMessage={touched.DTypeID ? errors.DTypeID : ""}
                                                />
                                            </RenderView>
                                        )}

                                        <FastField name="Rowcolumn">
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
                                        </FastField >

                                        {shouldRenderDT && (
                                            <RenderView style={Platform.OS === 'web' ? memoizedAnimatedDT : { opacity: 1 }}>
                                                <FastField name="DTypeValue">
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
                                                </FastField >
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

                                        {shouldRenderIT && option?.length > 0 && (
                                            <RenderView style={Platform.OS === 'web' ? memoizedAnimatedIT : { opacity: 1 }}>
                                                <Text style={{ marginTop: 10, marginBottom: 10, paddingLeft: 10, fontSize: spacing.small, color: theme.colors.error }}>
                                                    {(values.ImportantList || []).some((item) => item.Value) ? "Select value is important!" : "Input value control!"}
                                                </Text>

                                                <FastField name="ImportantList[0].Value" key={JSON.stringify(option)}>
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
                                                </FastField>

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
                                                    <FastField name="ImportantList[0].MinLength">
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
                                                    </FastField>

                                                    <FastField name="ImportantList[0].MaxLength">
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
                                                    </FastField>
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
                <Dialog visible={dialogAdd.CheckList} style={{ zIndex: 3, width: responsive === "large" ? 500 : "60%", alignSelf: 'center', borderRadius: 8, padding: 20 }} onDismiss={() => handelAdd(false, "CheckList")}>
                    <MemoChecklist_dialog
                        setIsVisible={() => {
                            handelAdd(false, "CheckList");
                        }}
                        saveData={(value: any) => {
                            saveDataCheckList(value);
                            handelAdd(false, "CheckList");
                        }}
                    />
                </Dialog>
            )}

            {info.GroupCheckList && (
                <Dialog visible={info.GroupCheckList} style={{ zIndex: 3, width: responsive === "large" ? 500 : "60%", alignSelf: 'center' }} onDismiss={() => handelInfo(false, "GroupCheckList")}>
                    <InfoGroup_dialog
                        setDialogAdd={() => handelInfo(false, "GroupCheckList")}
                        option={option}
                    />
                </Dialog>
            )}

            {dialogAdd.GroupCheckList && (
                <Dialog visible={dialogAdd.GroupCheckList} style={{ zIndex: 3, width: responsive === "large" ? 500 : "60%", alignSelf: 'center', borderRadius: 8, padding: 20 }} onDismiss={() => handelAdd(false, "GroupCheckList")}>
                    <MemoCreateGroupOption_dialog
                        setIsVisible={() => {
                            handelAdd(false, "GroupCheckList");
                        }}
                        saveDataCheckListOption={saveDataCheckListOption}
                        checkListOption={checkListOption}
                        saveData={(value: any, mode: any) => {
                            saveDataGroupCheckList(value, mode);
                            handelAdd(false, "GroupCheckList");
                        }}
                    />
                </Dialog>
            )}
        </Portal>
    );
});

export default FieldDialog;
