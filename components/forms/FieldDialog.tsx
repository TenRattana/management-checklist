import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Checkboxs, Inputs } from "@/components/common";
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
import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchCheckList, fetchCheckListOption, fetchGroupCheckList, saveCheckList, saveCheckListOption, saveGroupCheckListOption } from "@/app/services";
import { InitialValuesChecklist, InitialValuesCheckListOption, InitialValuesGroupCheckList } from "@/typing/value";
import { useSelector } from "react-redux";

const AnimatedView = Animated.createAnimatedComponent(View);

const FieldDialog = React.memo(({ isVisible, formState, onDeleteField, editMode, setShowDialogs }: FieldDialogProps) => {
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

    const { data: checkList = [], isLoading: LoadCL } = useQuery("checkList", fetchCheckList, {
        staleTime: 1000 * 60 * 24,
        cacheTime: 1000 * 60 * 25,
    });

    const { data: checkListOption = [] } = useQuery("checkListOption", fetchCheckListOption, {
        staleTime: 1000 * 60 * 24,
        cacheTime: 1000 * 60 * 25,
    });

    const { data: groupCheckListOption = [], isLoading: LoadG } = useQuery("groupCheckListOption", fetchGroupCheckList, {
        staleTime: 1000 * 60 * 24,
        cacheTime: 1000 * 60 * 25,
    });

    useEffect(() => {
        queryClient.invalidateQueries("checkList");
        queryClient.invalidateQueries("groupCheckListOption");
    }, []);

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
                        validateOnBlur={false}
                        validateOnChange={true}
                        onSubmit={values => {
                            handleSaveField(values, editMode ? "update" : "add")
                            setShowDialogs()
                        }}
                        enableReinitialize={true}
                    >
                        {({ setFieldValue, values, handleSubmit, isValid, dirty }) => {
                            glc.current = values.GCLOptionID

                            const updateRenderStates = useCallback(() => {

                                const checkListTypeItem = checkListTypes.find(item => item.CTypeID === values.CTypeID)?.CTypeName ?? "";
                                const newRender = ["Dropdown", "Radio", "Checkbox"].includes(checkListTypeItem)
                                    ? "detail"
                                    : ["Textinput", "Time"].includes(checkListTypeItem)
                                        ? "text"
                                        : ["Text"].includes(checkListTypeItem) ? "label" : "";

                                if (newRender !== shouldRender) {
                                    setFieldValue(newRender === "detail" ? "DTypeID" : "GCLOptionID", null);
                                    setShouldRender(newRender);
                                }
                            }, [values.CTypeID, checkListTypes, shouldRender, setFieldValue]);

                            useEffect(() => {
                                values.CTypeID && updateRenderStates();
                            }, [values.CTypeID]);

                            const updateImportantList = useCallback((modifications: { Value?: string | string[]; MinLength?: number; MaxLength?: number; }) => {

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

                            const handleDataOption = useCallback(() => {

                                let options: { label: string; value: string; }[] = [];

                                if (values.GCLOptionID) {
                                    options = groupCheckListOption
                                        .filter(option => option.GCLOptionID === values.GCLOptionID)
                                        .flatMap(option => option.CheckListOptions?.filter(item => item.IsActive)
                                            .map(item => ({
                                                label: item.CLOptionName,
                                                value: item.CLOptionID,
                                            })) || []
                                        );
                                    updateImportantList({ MinLength: undefined, MaxLength: undefined });
                                }

                                setOption(prevOptions => {
                                    const isEqual = JSON.stringify(prevOptions) === JSON.stringify(options);
                                    return isEqual ? prevOptions : options;
                                });

                            }, [values.GCLOptionID, groupCheckListOption]);

                            useEffect(() => {
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

                                setShouldRenderDT(dataTypeItem === "Number");
                            }, [values.DTypeID, values.Important, dataType]);

                            useEffect(() => {
                                values.GCLOptionID && handleDataOption();
                            }, [values.GCLOptionID]);

                            return (
                                <View style={{ marginHorizontal: 12 }}>
                                    <ScrollView
                                        contentContainerStyle={{ paddingBottom: 5, paddingHorizontal: 10 }}
                                        showsVerticalScrollIndicator={false}
                                        style={{ maxHeight: Platform.OS === "web" ? 330 : '68%' }}
                                    >
                                        <FastField name="CListID" key={JSON.stringify(checkList)}>
                                            {({ field, form }: any) => (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <CustomDropdownSingle
                                                            title="Check List"
                                                            labels="CListName"
                                                            values="CListID"
                                                            data={checkList}
                                                            value={field.value}
                                                            handleChange={(value) => {
                                                                const stringValue = (value as { value: string }).value;
                                                                form.setFieldValue(field.name, stringValue);
                                                                form.setFieldTouched(field.name, true);
                                                            }}
                                                            handleBlur={() => {
                                                                form.setFieldTouched(field.name, true);
                                                            }}
                                                            testId={`CListID-form`}
                                                            error={form.touched.CListID && Boolean(form.errors.CListID)}
                                                            errorMessage={form.touched.CListID ? form.errors.CListID : ""}
                                                        />
                                                    </View>

                                                    <TouchableOpacity
                                                        onPress={() => handelAdd(true, "CheckList")}
                                                        style={{
                                                            alignItems: 'center',
                                                            paddingRight: 5
                                                        }}
                                                    >
                                                        <Icon source={"plus-box"} size={spacing.large + 3} color={theme.colors.drag} />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </FastField>

                                        <FastField name="CTypeID">
                                            {({ field, form }: any) => (
                                                <CustomDropdownSingle
                                                    title="Check List Type"
                                                    labels="CTypeTitle"
                                                    values="CTypeID"
                                                    data={editMode ? checkListTypes : checkListTypes.filter(v => v.IsActive)}
                                                    value={field.value}
                                                    handleChange={(value) => {
                                                        const stringValue = (value as { value: string }).value;
                                                        form.setFieldValue(field.name, stringValue);
                                                        form.setFieldTouched(field.name, true);
                                                    }}
                                                    handleBlur={() => {
                                                        form.setFieldTouched(field.name, true);
                                                    }}
                                                    testId={`CTypeID-form`}
                                                    error={form.touched.CTypeID && Boolean(form.errors.CTypeID)}
                                                    errorMessage={form.touched.CTypeID ? form.errors.CTypeID : ""}
                                                />
                                            )}
                                        </FastField>

                                        {shouldRender === "detail" && (
                                            <RenderView style={Platform.OS === 'web' ? memoizedAnimatedText : { opacity: 1 }}>
                                                <FastField name="GCLOptionID" key={JSON.stringify(groupCheckListOption)}>
                                                    {({ field, form }: any) => (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                            <View style={{ flex: 1 }}>
                                                                <CustomDropdownSingle
                                                                    title="Match Check List Option Group"
                                                                    labels="GCLOptionName"
                                                                    values="GCLOptionID"
                                                                    data={groupCheckListOption}
                                                                    value={field.value}
                                                                    handleChange={(value) => {
                                                                        const stringValue = (value as { value: string }).value;

                                                                        form.setFieldValue(field.name, stringValue);
                                                                        form.setFieldTouched(field.name, true);
                                                                    }}
                                                                    handleBlur={() => {
                                                                        form.setFieldTouched(field.name, true);
                                                                    }}
                                                                    testId={`GCLOptionID-form`}
                                                                    error={form.touched.GCLOptionID && Boolean(form.errors.GCLOptionID)}
                                                                    errorMessage={form.touched.GCLOptionID ? form.errors.GCLOptionID : ""}
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
                                                    )}
                                                </FastField>
                                            </RenderView>
                                        )}

                                        {shouldRender === "text" && (
                                            <RenderView style={Platform.OS === 'web' ? memoizedAnimatedText : { opacity: 1 }}>
                                                <FastField name="DTypeID">
                                                    {({ field, form }: any) => (
                                                        <CustomDropdownSingle
                                                            title="Data Type"
                                                            labels="DTypeName"
                                                            values="DTypeID"
                                                            data={editMode ? dataType : dataType.filter(v => v.IsActive)}
                                                            value={field.value}
                                                            handleChange={(value) => {
                                                                const stringValue = (value as { value: string }).value;
                                                                form.setFieldValue(field.name, stringValue);
                                                                form.setFieldTouched(field.name, true);
                                                            }}
                                                            handleBlur={() => {
                                                                form.setFieldTouched(field.name, true);
                                                            }}
                                                            testId={`DTypeID-form`}
                                                            error={form.touched.DTypeID && Boolean(form.errors.DTypeID)}
                                                            errorMessage={form.touched.DTypeID ? form.errors.DTypeID : ""}
                                                        />
                                                    )}
                                                </FastField>
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
