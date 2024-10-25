import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable, ScrollView } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Inputs } from "@/components/common";
import { Portal, Dialog, HelperText, Switch, IconButton, useTheme } from "react-native-paper";
import { Formik, FastField } from "formik";
import Checklist_dialog from "../screens/Checklist_dialog";
import { useToast } from "@/app/contexts";
import axiosInstance from "@/config/axios";
import axios from "axios";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { InitialValuesChecklist } from '@/typing/value'
import { FieldDialogProps } from "@/typing/tag";
import Text from "@/components/Text";

const FieldDialog = ({ isVisible, formState, onDeleteField, editMode, saveField, setShowDialogs
    , checkListType, dataType, checkList, groupCheckListOption, dropcheckList, dropcheckListType, dropdataType, dropgroupCheckListOption
}: FieldDialogProps) => {
    const [isVisibleCL, setIsVisibleCL] = useState<boolean>(false)
    const [initialValueCL, setInitialValueCL] = useState<InitialValuesChecklist>({ checkListId: "", checkListName: "", isActive: false })
    const masterdataStyles = useMasterdataStyles()
    const { showSuccess, handleError } = useToast();

    const [shouldRender, setShouldRender] = useState<string>("");
    const [shouldRenderDT, setShouldRenderDT] = useState<boolean>(false);

    console.log("FieldDialog");

    const validationSchema = Yup.object().shape({
        CListID: Yup.string().required("The checklist field is required."),
        CTypeID: Yup.string().required("The checklist type field is required."),
        Required: Yup.boolean().required("The required field is required."),
        DTypeID: Yup.lazy((value, context) => {
            const CTypeID = checkListType.find(v => v.CTypeID === context.parent.CTypeID)?.CTypeName;
            if (CTypeID && ['Textinput', 'Textarea'].includes(CTypeID)) {
                return Yup.string().required("DTypeID is required for Text/TextArea.");
            }
            return Yup.string().nullable();
        }),
        GCLOptionID: Yup.lazy((value, context) => {
            const CTypeID = checkListType.find(v => v.CTypeID === context.parent.CTypeID)?.CTypeName
            if (CTypeID && ['Dropdown', 'Checkbox', 'Radio'].includes(CTypeID)) {
                return Yup.string().required("GCLOptionID is required for Dropdown/Select/Radio.");
            }
            return Yup.string().nullable();
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

    const itemHeight = 100;
    const itemHeightN = itemHeight * 3

    const opacityT = useSharedValue(0);
    const heightT = useSharedValue(0);

    const opacityD = useSharedValue(0);
    const heightD = useSharedValue(0);

    const opacityN = useSharedValue(0);
    const heightN = useSharedValue(0);

    const animatedText = useAnimatedStyle(() => ({
        opacity: opacityT.value,
        height: heightT.value,
        overflow: 'hidden',
    }));

    const animatedDetail = useAnimatedStyle(() => ({
        opacity: opacityD.value,
        height: heightD.value,
        overflow: 'hidden',
    }));

    const animatedStyleNumber = useAnimatedStyle(() => ({
        opacity: opacityN.value,
        height: heightN.value,
        overflow: 'hidden',
    }));

    useEffect(() => {
        opacityT.value = withTiming(0, { duration: 0 });
        heightT.value = withTiming(0, { duration: 0 });
        opacityD.value = withTiming(0, { duration: 0 });
        heightD.value = withTiming(0, { duration: 0 });

        if (shouldRender === "text") {
            opacityT.value = withTiming(1, { duration: 300 });
            heightT.value = withTiming(itemHeight, { duration: 300 });
        } else if (shouldRender === "detail") {
            opacityT.value = withTiming(0, { duration: 200 });
            heightT.value = withTiming(0, { duration: 200 });
            setTimeout(() => {
                opacityD.value = withTiming(1, { duration: 100 });
                heightD.value = withTiming(itemHeight, { duration: 100 });
            }, 300);
        } else {
            opacityT.value = withTiming(0, { duration: 300 });
            heightT.value = withTiming(0, { duration: 300 });
            opacityD.value = withTiming(0, { duration: 300 });
            heightD.value = withTiming(0, { duration: 300 });
        }
    }, [shouldRender]);

    useEffect(() => {
        opacityN.value = withTiming(0, { duration: 0 });
        heightN.value = withTiming(0, { duration: 0 });

        if (shouldRender) {
            opacityN.value = withTiming(1, { duration: 300 });
            heightN.value = withTiming(itemHeightN, { duration: 300 });
        } else {
            setTimeout(() => {
                opacityN.value = withTiming(0, { duration: 300 });
                heightN.value = withTiming(0, { duration: 300 });
            }, 300);
        }
    }, [shouldRenderDT]);

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

                                    const newRender = ["Dropdown", "Radio", "Checkbox"].includes(checkListTypeItem)
                                        ? "detail"
                                        : ["Textinput", "Textarea"].includes(checkListTypeItem)
                                            ? "text"
                                            : "";

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

                                    setShouldRenderDT(dataTypeItem === "Number");
                                }, [values.DTypeID]);

                                return (
                                    <AccessibleView name="form-fd">

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
                                                            form.setFieldValue(field.name, value.value);
                                                            setTimeout(() => {
                                                                form.setFieldTouched(field.name, true);
                                                            }, 0)
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
                                                            form.setFieldValue(field.name, value.value);
                                                            setTimeout(() => {
                                                                form.setFieldTouched(field.name, true);
                                                            }, 0)
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
                                                        {({ field, form }: any) => (
                                                            <CustomDropdownSingle
                                                                title="Match Check List Option Group"
                                                                labels="GCLOptionName"
                                                                values="GCLOptionID"
                                                                data={editMode ? groupCheckListOption : dropgroupCheckListOption}
                                                                value={field.value}
                                                                handleChange={(value) => {
                                                                    form.setFieldValue(field.name, value.value);
                                                                    setTimeout(() => {
                                                                        form.setFieldTouched(field.name, true);
                                                                    }, 0)
                                                                }}
                                                                handleBlur={() => {
                                                                    form.setFieldTouched(field.name, true);
                                                                }}
                                                                testId={`GCLOptionID-form`}
                                                                error={form.touched.GCLOptionID && Boolean(form.errors.GCLOptionID)}
                                                                errorMessage={form.touched.GCLOptionID ? form.errors.GCLOptionID : ""}
                                                            />
                                                        )}
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
                                                                    form.setFieldValue(field.name, value.value);
                                                                    setTimeout(() => {
                                                                        form.setFieldTouched(field.name, true);
                                                                    }, 0)
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
                                                                label="DTypeValue"
                                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                                value={String(field.value ?? "")}
                                                                error={form.touched.DTypeValue && Boolean(form.errors.DTypeValue)}
                                                                errorMessage={form.touched.DTypeValue ? form.errors.DTypeValue : ""}
                                                                testId={`DTypeValue-form`}
                                                            />
                                                        )}
                                                    </FastField >

                                                    <FastField name="MinLength">
                                                        {({ field, form }: any) => (
                                                            <Inputs
                                                                placeholder="Min Value"
                                                                label="MinLength"
                                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                                value={String(field.value ?? "")}
                                                                error={form.touched.MinLength && Boolean(form.errors.MinLength)}
                                                                errorMessage={form.touched.MinLength ? form.errors.MinLength : ""}
                                                                testId={`MinLength-form`}
                                                            />
                                                        )}
                                                    </FastField >

                                                    <FastField name="MaxLength">
                                                        {({ field, form }: any) => (
                                                            <Inputs
                                                                placeholder="Max Value"
                                                                label="MaxLength"
                                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                                value={String(field.value ?? "")}
                                                                error={form.touched.MaxLength && Boolean(form.errors.MaxLength)}
                                                                errorMessage={form.touched.MaxLength ? form.errors.MaxLength : ""}
                                                                testId={`MaxLength-form`}
                                                            />
                                                        )}
                                                    </FastField >

                                                </Animated.View>
                                            )}

                                            <FastField name="Placeholder">
                                                {({ field, form }: any) => (
                                                    <Inputs
                                                        placeholder="Enter Placeholder"
                                                        label="Placeholder"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={field.value}
                                                        error={form.touched.Placeholder && Boolean(form.errors.Placeholder)}
                                                        errorMessage={form.touched.Placeholder ? form.errors.Placeholder : ""}
                                                        testId={`Placeholder-form`}
                                                    />
                                                )}
                                            </FastField >

                                            <FastField name="Hint">
                                                {({ field, form }: any) => (
                                                    <Inputs
                                                        placeholder="Enter Hint"
                                                        label="Hint"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={field.value}
                                                        error={form.touched.Hint && Boolean(form.errors.Hint)}
                                                        errorMessage={form.touched.Hint ? form.errors.Hint : ""}
                                                        testId={`Hint-form`}
                                                    />
                                                )}
                                            </FastField >


                                            <AccessibleView name="form-active-fd" style={masterdataStyles.containerSwitch}>
                                                <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                                    Required: {values.Required ? "Notnull" : "Nullable"}
                                                </Text>
                                                <Switch
                                                    style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                    // color={values.Required ? colors.succeass : colors.disable}
                                                    value={values.Required}
                                                    onValueChange={(v: boolean) => {
                                                        setFieldValue("Required", v);
                                                    }}
                                                />
                                            </AccessibleView>
                                        </ScrollView>

                                        <AccessibleView name="form-action-fd" style={masterdataStyles.containerAction}>
                                            <Pressable
                                                onPress={() => handleSubmit()}
                                                disabled={!isValid || !dirty}
                                                style={[
                                                    masterdataStyles.button,
                                                    isValid && dirty ? masterdataStyles.backMain : masterdataStyles.backDis,
                                                ]}
                                            >
                                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>
                                                    {editMode ? "Update SubForm" : "Add SubForm"}
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
                                                    <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>
                                                        Delete sub form
                                                    </Text>
                                                </Pressable>
                                            )}

                                            <Pressable
                                                onPress={() => setShowDialogs()}
                                                style={[masterdataStyles.button, masterdataStyles.backMain]}
                                            >
                                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>
                                                    Cancel
                                                </Text>
                                            </Pressable>
                                        </AccessibleView>

                                    </AccessibleView>
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
                    setInitialValueCL({ checkListId: "", checkListName: "", isActive: false });
                }}
                initialValues={initialValueCL}
                saveData={saveDataCheckList}
            />

        </Portal>
    );
};

export default FieldDialog;
