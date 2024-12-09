import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Checkboxs, Inputs } from "@/components/common";
import { Portal, Dialog, Switch } from "react-native-paper";
import { Formik, FastField } from "formik";
import Checklist_dialog from "../screens/Checklist_dialog";
import { useToast } from "@/app/contexts/useToast";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import axiosInstance from "@/config/axios";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { InitialValuesChecklist } from '@/typing/value'
import { FieldDialogProps } from "@/typing/tag";
import Text from "@/components/Text";
import { useFocusEffect } from "@react-navigation/native";

const FieldDialog = React.memo(({ isVisible, formState, onDeleteField, editMode, saveField, setShowDialogs
    , checkListType, dataType, checkList, groupCheckListOption, dropcheckList, dropcheckListType, dropdataType, dropgroupCheckListOption
}: FieldDialogProps) => {
    const [isVisibleCL, setIsVisibleCL] = useState<boolean>(false)
    const [initialValueCL, setInitialValueCL] = useState<InitialValuesChecklist>({ checkListId: "", checkListName: "", isActive: false, disables: false })
    const masterdataStyles = useMasterdataStyles()
    const { showSuccess, handleError } = useToast();
    const [option, setOption] = useState<{ label: string; value: string; }[]>([])
    const [shouldRender, setShouldRender] = useState<string>("");
    const [shouldRenderDT, setShouldRenderDT] = useState<boolean>(false);
    const [shouldRenderIT, setShouldRenderIT] = useState<boolean>(false);

    const { fontSize, spacing } = useRes()
    const { theme } = useTheme()

    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            CListID: Yup.string().required("The checklist field is required."),
            CTypeID: Yup.string().required("The checklist type field is required."),
            Required: Yup.boolean().required("The required field is required."),
            Important: Yup.boolean().required("The important field is required."),
            DTypeID: Yup.lazy((value, context) => {
                const CTypeID = checkListType.find(v => v.CTypeID === context.parent.CTypeID)?.CTypeName;
                if (CTypeID && ['Textinput'].includes(CTypeID)) {
                    return Yup.string().required("Data Type is required for Text.");
                }
                return Yup.string().nullable();
            }),
            DTypeValue: Yup.lazy((value, context) => {
                const DTypeID = dataType.find(v => v.DTypeID === context.context.DTypeID)?.DTypeName;
                if (DTypeID === "Number") {
                    return Yup.number().typeError("The digit value must be a number.").nullable();
                }
                return Yup.string().nullable();
            }),
            GCLOptionID: Yup.lazy((value, context) => {
                const CTypeID = checkListType.find(v => v.CTypeID === context.context.CTypeID)?.CTypeName;
                if (CTypeID && ['Dropdown', 'Checkbox', 'Radio'].includes(CTypeID)) {
                    return Yup.string().required("GCLOptionID is required for Dropdown/Select/Radio.");
                }
                return Yup.string().nullable();
            }),
            ImportantList: Yup.array().of(
                Yup.object().shape({
                    Value: Yup.lazy((value, context) => {
                        const isImportant = context.context?.Important || false;
                        const hasGCLOptionID = context.context?.GCLOptionID;

                        if (isImportant && hasGCLOptionID) {
                            if (Array.isArray(value)) {
                                return Yup.array()
                                    .of(Yup.string().required("Each selected option is required."))
                                    .min(1, "You must select at least one option.")
                                    .required("Important value is required when marked as important.");
                            } else {
                                return Yup.string()
                                    .required("Important value is required when marked as important.")
                                    .nullable();
                            }
                        }
                        return Yup.mixed().nullable();
                    }),
                    MinLength: Yup.lazy((value, context) => {
                        const DTypeID = dataType.find(v => v.DTypeID === context.context?.DTypeID)?.DTypeName;
                        const max = context.parent.MaxLength;
                        const isImportant = context.context?.Important;

                        if (DTypeID === "Number" && isImportant) {
                            if (!max && !value) {
                                return Yup.number()
                                    .typeError("The min value control must be a number.")
                                    .required("The min value control is required.");
                            } else if (max) {
                                return Yup.number()
                                    .typeError("The max value control must be a number.")
                                    .max(max, 'Min length must be less than or equal to Max length');
                            }
                        }

                        return Yup.number()
                            .typeError("The min value control must be a number.")
                            .nullable();
                    }),
                    MaxLength: Yup.lazy((value, context) => {
                        const DTypeID = dataType.find(v => v.DTypeID === context.context?.DTypeID)?.DTypeName;
                        const min = context.parent.MinLength;
                        const isImportant = context.context?.Important;

                        if (DTypeID === "Number" && isImportant) {
                            if (!min && !value) {
                                return Yup.number()
                                    .typeError("The max value control must be a number.")
                                    .min(min + 1, 'Max length must be greater than or equal to Min length')
                                    .required("The max value control is required.");
                            } else if (min) {
                                return Yup.number()
                                    .typeError("The max value control must be a number.")
                                    .min(min, 'Max length must be greater than or equal to Min length');
                            }
                        }

                        return Yup.number()
                            .typeError("The max value control must be a number.")
                            .nullable();
                    }),
                })
            )
        });
    }, [checkListType, dataType]);

    const saveDataCheckList = useCallback(async (values: InitialValuesChecklist) => {

        const data = {
            CListId: values.checkListId ?? "",
            CListName: values.checkListName,
            isActive: values.isActive,
        };

        try {
            const response = await axiosInstance.post("CheckList_service.asmx/SaveCheckList", data);
            setIsVisibleCL(!response.data.status);
            showSuccess(String(response.data.message));
        } catch (error) {
            handleError(error);
        }
    }, [handleError, showSuccess, setIsVisibleCL]);

    const animatedText = useAnimatedStyle(() => {

        if (shouldRender !== "") {
            return { opacity: 1, transform: [{ scale: withTiming(1, { duration: 300 }) }] };
        } else {
            return { opacity: 0, transform: [{ scale: withTiming(0.5, { duration: 300 }) }] };
        }
    }, [shouldRender]);

    const animatedStyleNumber = useAnimatedStyle(() => {

        if (shouldRenderDT) {
            return { opacity: 1, transform: [{ scale: withTiming(1, { duration: 300 }) }] };
        } else {
            return { opacity: 0, transform: [{ scale: withTiming(0.5, { duration: 300 }) }] };
        }
    }, [shouldRenderDT]);

    const animatedStyleIT = useAnimatedStyle(() => {

        if (shouldRenderIT) {
            if (shouldRenderDT) {
                return { opacity: 1, transform: [{ scale: withTiming(1, { duration: 300 }) }] };
            } else if (option.length > 0) {
                return { opacity: 1, transform: [{ scale: withTiming(1, { duration: 300 }) }] };
            } else {
                return { opacity: 0, transform: [{ scale: withTiming(0.5, { duration: 300 }) }] };
            }
        } else {
            return { opacity: 0, transform: [{ scale: withTiming(0.5, { duration: 300 }) }] };
        }
    }, [shouldRenderIT, shouldRenderDT, option]);

    useFocusEffect(
        useCallback(() => {
            return (() => {
                setOption([]);
                setShouldRender('');
                setShouldRenderDT(false);
                setShouldRenderIT(false);
                setIsVisibleCL(false);
                setInitialValueCL({ checkListId: "", checkListName: "", isActive: false, disables: false });
            })
        }, [])
    )

    const MemoChecklist_dialog = React.memo(Checklist_dialog)
    const memoizedAnimatedText = useMemo(() => animatedText, [shouldRender]);
    const memoizedAnimatedDT = useMemo(() => animatedStyleNumber, [shouldRenderDT]);
    const memoizedAnimatedIT = useMemo(() => animatedStyleIT, [shouldRenderIT, shouldRenderDT, option]);

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setShowDialogs()} style={masterdataStyles.containerDialog}>

                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]}>
                    {editMode ? "Edit check list" : "Create check list"}
                </Dialog.Title>

                <Dialog.Content>
                    <Text
                        style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 10 }]}
                    >
                        {editMode ? "Edit the details of the field." : "Enter the details for the new field."}
                    </Text>

                    {isVisible && (
                        <Formik
                            initialValues={formState}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={values => saveField(values, editMode ? "update" : "add")}
                        >
                            {({ setFieldValue, values, handleSubmit, isValid, dirty }) => {

                                const updateRenderStates = useCallback(() => {
                                    const checkListTypeItem = checkListType.find(
                                        item => item.CTypeID === values.CTypeID
                                    )?.CTypeName ?? "";

                                    const newRender = ["Dropdown", "Radio", "Checkbox"].includes(checkListTypeItem)
                                        ? "detail"
                                        : ["Textinput"].includes(checkListTypeItem)
                                            ? "text"
                                            : ["Text"].includes(checkListTypeItem) ? "label" : ""

                                    if (newRender !== shouldRender) {
                                        setFieldValue(newRender === "detail" ? "DTypeID" : "GCLOptionID", null);
                                        setShouldRender(newRender);
                                    }
                                }, [values.CTypeID, checkListType, shouldRender, setFieldValue]);

                                useEffect(updateRenderStates, [updateRenderStates]);

                                const updateImportantList = useCallback((modifications: {
                                    Value?: string | string[];
                                    MinLength?: number;
                                    MaxLength?: number;
                                }) => {
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
                                }, [values.ImportantList, setFieldValue]);

                                const handleDataTypeChange = useCallback(() => {
                                    const dataTypeItem = dataType.find(item => item.DTypeID === values.DTypeID)?.DTypeName;
                                    let options: { label: string; value: string; }[] = [];

                                    if (values.Important) {
                                        if (dataTypeItem === "Number") {
                                            updateImportantList({ Value: undefined });
                                        } else if (values.GCLOptionID) {
                                            options = groupCheckListOption
                                                .filter(option => option.GCLOptionID === values.GCLOptionID)
                                                .flatMap(option => option.CheckListOptions?.map(item => ({
                                                    label: item.CLOptionName,
                                                    value: item.CLOptionID,
                                                })) || []);

                                            updateImportantList({ MinLength: undefined, MaxLength: undefined });
                                        } else {
                                            updateImportantList({ MinLength: undefined, MaxLength: undefined, Value: undefined });
                                        }
                                    }

                                    setOption(prevOptions => {
                                        const isEqual = JSON.stringify(prevOptions) === JSON.stringify(options);
                                        return isEqual ? prevOptions : options;
                                    });
                                    setShouldRenderDT(dataTypeItem === "Number");
                                }, [values.DTypeID, values.GCLOptionID, values.Important, dataType, groupCheckListOption]);

                                useEffect(handleDataTypeChange, [values.DTypeID, values.GCLOptionID, values.Important]);

                                useEffect(() => {
                                    setShouldRenderIT(values.Important);
                                }, [values.Important]);

                                return (
                                    <View id="form-fd">

                                        <ScrollView
                                            contentContainerStyle={{ paddingBottom: 5, paddingHorizontal: 10 }}
                                            showsVerticalScrollIndicator={false}
                                            style={{ maxHeight: Platform.OS === "web" ? 330 : '68%' }}
                                        >
                                            <FastField name="CListID">
                                                {({ field, form }: any) => (
                                                    <CustomDropdownSingle
                                                        title="Check List"
                                                        labels="CListName"
                                                        values="CListID"
                                                        data={editMode ? checkList : dropcheckList}
                                                        value={field.value}
                                                        handleChange={(value) => {
                                                            const stringValue = (value as { value: string }).value;
                                                            form.setFieldValue(field.name, stringValue);
                                                            setTimeout(() => {
                                                                form.setFieldTouched(field.name, true);
                                                            }, 0);
                                                        }}
                                                        handleBlur={() => {
                                                            form.setFieldTouched(field.name, true);
                                                        }}
                                                        testId={`CListID-form`}
                                                        error={form.touched.CListID && Boolean(form.errors.CListID)}
                                                        errorMessage={form.touched.CListID ? form.errors.CListID : ""}
                                                    />
                                                )}
                                            </FastField>

                                            <FastField name="CTypeID">
                                                {({ field, form }: any) => (
                                                    <CustomDropdownSingle
                                                        title="Check List Type"
                                                        labels="CTypeName"
                                                        values="CTypeID"
                                                        data={editMode ? checkListType : dropcheckListType}
                                                        value={field.value}
                                                        handleChange={(value) => {
                                                            const stringValue = (value as { value: string }).value;
                                                            form.setFieldValue(field.name, stringValue);
                                                            setTimeout(() => {
                                                                form.setFieldTouched(field.name, true);
                                                            }, 0);
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
                                                <Animated.View style={[memoizedAnimatedText]}>
                                                    <FastField name="GCLOptionID" key={shouldRender === "detail"}>
                                                        {({ field, form }: any) =>
                                                            <CustomDropdownSingle
                                                                title="Match Check List Option Group"
                                                                labels="GCLOptionName"
                                                                values="GCLOptionID"
                                                                data={editMode ? groupCheckListOption : dropgroupCheckListOption}
                                                                value={field.value}
                                                                handleChange={(value) => {
                                                                    const stringValue = (value as { value: string }).value;

                                                                    form.setFieldValue(field.name, stringValue);
                                                                    setTimeout(() => {
                                                                        form.setFieldTouched(field.name, true);
                                                                    }, 0);
                                                                }}
                                                                handleBlur={() => {
                                                                    form.setFieldTouched(field.name, true);
                                                                }}
                                                                testId={`GCLOptionID-form`}
                                                                error={form.touched.GCLOptionID && Boolean(form.errors.GCLOptionID)}
                                                                errorMessage={form.touched.GCLOptionID ? form.errors.GCLOptionID : ""}
                                                            />
                                                        }
                                                    </FastField>
                                                </Animated.View>
                                            )}

                                            {shouldRender === "text" && (
                                                <Animated.View style={[memoizedAnimatedText]}>
                                                    <FastField name="DTypeID" key={shouldRender === "text"}>
                                                        {({ field, form }: any) => (
                                                            <CustomDropdownSingle
                                                                title="Data Type"
                                                                labels="DTypeName"
                                                                values="DTypeID"
                                                                data={editMode ? dataType : dropdataType}
                                                                value={field.value}
                                                                handleChange={(value) => {
                                                                    const stringValue = (value as { value: string }).value;
                                                                    form.setFieldValue(field.name, stringValue);
                                                                    setTimeout(() => {
                                                                        form.setFieldTouched(field.name, true);
                                                                    }, 0);
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
                                                </Animated.View>
                                            )}

                                            {shouldRenderDT && (
                                                <Animated.View style={[memoizedAnimatedDT]}>
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
                                                </Animated.View>
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

                                            {shouldRenderIT && option.length > 0 && (
                                                <Animated.View style={[memoizedAnimatedIT]}>
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
                                                                        setTimeout(() => {
                                                                            form.setFieldTouched(field.name, true);
                                                                        }, 0);
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

                                                </Animated.View>
                                            )}

                                            {shouldRenderIT && shouldRenderDT && (
                                                <Animated.View style={[memoizedAnimatedIT]}>
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
                                                </Animated.View>

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

                                        <View id="form-action-fd" style={masterdataStyles.containerAction}>
                                            <TouchableOpacity
                                                onPress={() => handleSubmit()}
                                                disabled={!isValid || !dirty}
                                                style={[
                                                    masterdataStyles.button,
                                                    masterdataStyles.backMain,
                                                    { opacity: isValid && dirty ? 1 : 0.5 }
                                                ]}
                                            >
                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>
                                                    {editMode ? "Update Field" : "Add Field"}
                                                </Text>
                                            </TouchableOpacity>

                                            {editMode && (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        onDeleteField(values.SFormID, values.MCListID);
                                                        setShowDialogs();
                                                    }}
                                                    style={[masterdataStyles.button, masterdataStyles.backMain]}
                                                >
                                                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>
                                                        Delete Field
                                                    </Text>
                                                </TouchableOpacity>
                                            )}

                                            <TouchableOpacity
                                                onPress={() => setShowDialogs()}
                                                style={[masterdataStyles.button, masterdataStyles.backMain]}
                                            >
                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>
                                                    Cancel
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            }}
                        </Formik>
                    )}
                </Dialog.Content>

            </Dialog>
            <MemoChecklist_dialog
                isEditing={false}
                isVisible={isVisibleCL}
                setIsVisible={() => {
                    setIsVisibleCL(false);
                    setInitialValueCL({ checkListId: "", checkListName: "", isActive: false, disables: false });
                }}
                initialValues={initialValueCL}
                saveData={saveDataCheckList}
            />
        </Portal>
    );
});

export default FieldDialog;
