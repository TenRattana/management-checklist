import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Checkboxs, Inputs } from "@/components/common";
import { Portal, Dialog, HelperText, Switch, IconButton } from "react-native-paper";
import { Formik, FastField, Field } from "formik";
import Checklist_dialog from "../screens/Checklist_dialog";
import { useRes, useToast, useTheme } from "@/app/contexts";
import axiosInstance from "@/config/axios";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { InitialValuesChecklist } from '@/typing/value'
import { FieldDialogProps } from "@/typing/tag";
import Text from "@/components/Text";
import { CheckListOption, GroupCheckListOption } from "@/typing/type";

const FieldDialog = ({ isVisible, formState, onDeleteField, editMode, saveField, setShowDialogs
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

    const validationSchema = Yup.object().shape({
        CListID: Yup.string().required("The checklist field is required."),
        CTypeID: Yup.string().required("The checklist type field is required."),
        Required: Yup.boolean().required("The required field is required."),
        Important: Yup.boolean().required("The important field is required."),
        DTypeID: Yup.lazy((value, context) => {
            const CTypeID = checkListType.find(v => v.CTypeID === context.parent.CTypeID)?.CTypeName;
            if (CTypeID && ['Textinput', 'Textarea'].includes(CTypeID)) {
                return Yup.string().required("Data Type is required for Text/TextArea.");
            }
            return Yup.string().nullable();
        }),
        DTypeValue: Yup.lazy((value, context) => {
            const DTypeID = dataType.find(v => v.DTypeID === context.context.DTypeID)?.DTypeName;
            if (DTypeID === "Number") {
                return Yup.number().typeError("The digit value must be a number.").nullable()
            }
            return Yup.number().nullable();
        }),
        GCLOptionID: Yup.lazy((value, context) => {
            const CTypeID = checkListType.find(v => v.CTypeID === context.parent.CTypeID)?.CTypeName;
            if (CTypeID && ['Dropdown', 'Checkbox', 'Radio'].includes(CTypeID)) {
                return Yup.string().required("GCLOptionID is required for Dropdown/Select/Radio.");
            }
            return Yup.string().nullable();
        }),
        ImportantList: Yup.object().shape({
            ImportantValue: Yup.lazy((value, context) => {
                const isImportant = context.context?.Important || false;
                const GCLOptionID = context.context?.GCLOptionID || false;

                if (isImportant && GCLOptionID) {
                    return Yup.array()
                        .min(1, "You must select at least one option.")
                        .typeError("The min value control must be a number.")
                        .required("Important value is required when marked as important.");
                }

                return Yup.array().nullable();
            }),
            MinLength: Yup.lazy((value, context) => {
                const DTypeID = dataType.find(v => v.DTypeID === context.context.DTypeID)?.DTypeName;
                const max = context.parent.MaxLength
                const isImportant = context.context.Important;

                if (DTypeID === "Number" && isImportant) {
                    if (!max && !value) {
                        return Yup.number()
                            .typeError("The min value control must be a number.")
                            .required("The min value control is required.")
                    }
                    return Yup.number()
                        .typeError("The min value control must be a number.")
                        .nullable()
                }

                return Yup.number().nullable();
            }),
            MaxLength: Yup.lazy((value, context) => {
                const DTypeID = dataType.find(v => v.DTypeID === context.context.DTypeID)?.DTypeName;
                const min = context.parent.MinLength
                const isImportant = context.context.Important;

                if (DTypeID === "Number" && isImportant) {
                    if (!min && !value) {
                        return Yup.number()
                            .typeError("The max value control must be a number.")
                            .min(min + 1 || true, 'Max length must be greater than or equal to Min length').required("The max value control is required.")
                    }
                    return Yup.number()
                        .typeError("The max value control must be a number.")
                        .min(min + 1 || true, 'Max length must be greater than or equal to Min length');
                }

                return Yup.number().nullable();
            }),
        }),
    });

    const saveDataCheckList = async (values: InitialValuesChecklist) => {
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
    };

    const opacityT = useSharedValue(0);
    const opacityD = useSharedValue(0);
    const opacityN = useSharedValue(0);
    const opacityIT = useSharedValue(0);

    const animatedText = useAnimatedStyle(() => ({
        opacity: opacityT.value,
        overflow: 'hidden',
    }));

    const animatedDetail = useAnimatedStyle(() => ({
        opacity: opacityD.value,
        overflow: 'hidden',
    }));

    const animatedStyleNumber = useAnimatedStyle(() => ({
        opacity: opacityN.value,
        overflow: 'hidden',
    }));

    const animatedStyleIT = useAnimatedStyle(() => ({
        opacity: opacityIT.value,
        overflow: 'hidden',
    }));

    useEffect(() => {
        opacityIT.value = withTiming(0, { duration: 0 });
        if (shouldRenderIT) {
            if (shouldRenderDT) {
                opacityIT.value = withTiming(1, { duration: 300 });
            } else if (option.length > 0) {
                opacityIT.value = withTiming(1, { duration: 300 });
            }
        } else {
            setTimeout(() => {
                opacityIT.value = withTiming(0, { duration: 300 });
            }, 300);
        }
    }, [shouldRenderIT, shouldRenderDT, shouldRender, option])

    useEffect(() => {
        opacityT.value = withTiming(0, { duration: 0 });
        opacityD.value = withTiming(0, { duration: 0 });

        if (shouldRender === "text") {
            opacityT.value = withTiming(1, { duration: 300 });
        } else if (shouldRender === "detail") {
            opacityT.value = withTiming(0, { duration: 200 });
            setTimeout(() => {
                opacityD.value = withTiming(1, { duration: 100 });
            }, 300);
        } else {
            opacityT.value = withTiming(0, { duration: 300 });
            opacityD.value = withTiming(0, { duration: 300 });
        }
    }, [shouldRender]);

    useEffect(() => {
        opacityN.value = withTiming(0, { duration: 0 });
        if (shouldRender) {
            opacityN.value = withTiming(1, { duration: 300 });
        } else {
            setTimeout(() => {
                opacityN.value = withTiming(0, { duration: 300 });
            }, 300);
        }
    }, [shouldRenderDT]);

    useEffect(() => {
        if (!isVisible) {
            setOption([]);
            setShouldRender('');
            setShouldRenderDT(false);
            setShouldRenderIT(false);
            setIsVisibleCL(false);
            setInitialValueCL({ checkListId: "", checkListName: "", isActive: false, disables: false });
        }
    }, [isVisible]);

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
                            {({
                                setFieldValue,
                                values,
                                handleSubmit,
                                isValid,
                                dirty,
                            }) => {
                                useEffect(() => {
                                    const checkListTypeItem = checkListType.find(
                                        item => item.CTypeID === values.CTypeID
                                    )?.CTypeName ?? "";

                                    const newRender = ["Dropdown", "Radio", "Checkbox"].includes(checkListTypeItem) ? "detail" : ["Textinput", "Textarea"].includes(checkListTypeItem) ? "text" : "";

                                    if (newRender !== shouldRender) {
                                        if (newRender === "detail") {
                                            setFieldValue("DTypeID", null);
                                        } else {
                                            setFieldValue("GCLOptionID", undefined);
                                        }
                                        setShouldRender(newRender);
                                    }
                                }, [values.CTypeID]);

                                useEffect(() => {
                                    const dataTypeItem = dataType.find(
                                        item => item.DTypeID === values.DTypeID
                                    )?.DTypeName;

                                    if (dataTypeItem === "Number") {
                                        if (values.ImportantList) {
                                            values.ImportantList.ImportantValue = undefined;
                                        }
                                    }
                                    setShouldRenderDT(dataTypeItem === "Number");

                                }, [values.DTypeID]);

                                useEffect(() => {
                                    if (values.Important && values.GCLOptionID) {
                                        if (values.ImportantList) {
                                            values.ImportantList.MinLength = undefined;
                                            values.ImportantList.MaxLength = undefined;
                                        }

                                        setOption(groupCheckListOption
                                            .filter(option => option.GCLOptionID === values.GCLOptionID)
                                            .flatMap(v => v.CheckListOptions?.map((item: CheckListOption) => ({
                                                label: item.CLOptionName,
                                                value: item.CLOptionID,
                                            })) || []))
                                    }
                                }, [values.Important, values.GCLOptionID, setOption]);

                                useEffect(() => {
                                    setShouldRenderIT(values.Important)
                                }, [values.Important]);

                                return (
                                    <View id="form-fd">

                                        <ScrollView
                                            contentContainerStyle={{ paddingBottom: 5, paddingHorizontal: 10 }}
                                            showsVerticalScrollIndicator={false}
                                            style={{ maxHeight: 330 }}
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
                                                <Animated.View style={[animatedDetail]}>
                                                    <FastField name="GCLOptionID">
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
                                                <Animated.View style={[animatedText]}>
                                                    <FastField name="DTypeID">
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
                                                <Animated.View style={[animatedStyleNumber]}>
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

                                            {shouldRenderIT && option.length > 0 && values.GCLOptionID && (
                                                <Animated.View style={[animatedStyleIT]}>
                                                    <Text
                                                        style={[{
                                                            marginTop: 10, marginBottom: 10, paddingLeft: 10, fontSize: spacing.small, color: theme.colors.error
                                                        }]}
                                                    >
                                                        Select value is important!
                                                    </Text>
                                                    <FastField name="ImportantList.ImportantValue">
                                                        {({ field, form }: any) => {

                                                            return (
                                                                <Checkboxs
                                                                    option={option}
                                                                    handleChange={(value: string | string[]) => {
                                                                        const processedValues = Array.isArray(value)
                                                                            ? value.filter((v: string) => v.trim() !== '')
                                                                            : value.split(',').filter((v: string) => v.trim() !== '');

                                                                        form.setFieldValue(field.name, processedValues);

                                                                        setTimeout(() => {
                                                                            form.setTouched({
                                                                                ...form.touched,
                                                                                ImportantList: {
                                                                                    ...form.touched.ImportantList,
                                                                                    ImportantValue: true,
                                                                                },
                                                                            });

                                                                            form.validateField(field.name);
                                                                        }, 0);
                                                                    }}
                                                                    error={form.touched?.ImportantList?.ImportantValue && Boolean(form.errors?.ImportantList?.ImportantValue)}
                                                                    errorMessage={form.touched?.ImportantList?.ImportantValue ? form.errors?.ImportantList?.ImportantValue : ""}
                                                                    handleBlur={() => {
                                                                        form.setTouched({
                                                                            ...form.touched,
                                                                            ImportantList: {
                                                                                ...form.touched.ImportantList,
                                                                                ImportantValue: true,
                                                                            },
                                                                        });
                                                                    }}
                                                                    value={String(field.value ?? "")}
                                                                    testId={`Value-Important-form`}
                                                                />
                                                            )
                                                        }}
                                                    </FastField>
                                                </Animated.View>
                                            )}

                                            {shouldRenderIT && shouldRenderDT && (
                                                <Animated.View style={[animatedStyleIT]}>
                                                    <Text
                                                        style={[
                                                            { marginTop: 10, marginBottom: 10, paddingLeft: 10, fontSize: spacing.small, color: theme.colors.error }
                                                        ]}
                                                    >
                                                        Input value control!
                                                    </Text>

                                                    <FastField name="ImportantList.MinLength">
                                                        {({ field, form }: any) =>
                                                            <Inputs
                                                                placeholder="Min Value"
                                                                label="Min Value Control"
                                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                                handleBlur={() => form.setTouched({ ...form.touched, ImportantList: { ...form.touched.ImportantList, MinLength: true } })}
                                                                value={String(field.value ?? "")}
                                                                error={form.touched?.ImportantList?.MinLength && Boolean(form.errors?.ImportantList?.MinLength)}
                                                                errorMessage={form.touched?.ImportantList?.MinLength ? form.errors?.ImportantList?.MinLength : ""}
                                                                testId={`MinLength-form`}
                                                            />
                                                        }
                                                    </FastField>

                                                    <FastField name="ImportantList.MaxLength">
                                                        {({ field, form }: any) => (
                                                            <Inputs
                                                                placeholder="Max Value"
                                                                label="Max Value Control"
                                                                handleChange={(value: string) => form.setFieldValue(field.name, value)}
                                                                handleBlur={() => form.setTouched({ ...form.touched, ImportantList: { ...form.touched.ImportantList, MaxLength: true } })}
                                                                value={String(field.value ?? "")}
                                                                error={form.touched?.ImportantList?.MaxLength && Boolean(form.errors?.ImportantList?.MaxLength)}
                                                                errorMessage={form.touched?.ImportantList?.MaxLength ? form.errors?.ImportantList?.MaxLength : ""}
                                                                testId={`MaxLength-form`}
                                                            />
                                                        )}
                                                    </FastField>

                                                </Animated.View>

                                            )}

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


                                        </ScrollView>

                                        <View id="form-action-fd" style={masterdataStyles.containerAction}>
                                            <Pressable
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
                                            </Pressable>

                                            {editMode && (
                                                <Pressable
                                                    onPress={() => {
                                                        onDeleteField(values.SFormID, values.MCListID);
                                                        setShowDialogs();
                                                    }}
                                                    style={[masterdataStyles.button, masterdataStyles.backMain]}
                                                >
                                                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>
                                                        Delete Field
                                                    </Text>
                                                </Pressable>
                                            )}

                                            <Pressable
                                                onPress={() => setShowDialogs()}
                                                style={[masterdataStyles.button, masterdataStyles.backMain]}
                                            >
                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>
                                                    Cancel
                                                </Text>
                                            </Pressable>
                                        </View>

                                    </View>
                                );
                            }}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>

            <Checklist_dialog
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
};

export default FieldDialog;
