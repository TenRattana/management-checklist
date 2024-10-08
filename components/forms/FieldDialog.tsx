import React, { useState, useEffect, useCallback } from "react";
import { Pressable, Text, ScrollView } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Inputs } from "@/components/common";
import { Portal, Dialog, HelperText, Switch, IconButton } from "react-native-paper";
import { Formik, Field } from "formik";
import Checklist_dialog from "../screens/Checklist_dialog";
import { useTheme, useToast } from "@/app/contexts";
import axiosInstance from "@/config/axios";
import axios from "axios";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { InitialValuesChecklist } from '@/typing/value'
import { FieldDialogProps } from "@/typing/tag";

const FieldDialog = ({ isVisible, formState, onDeleteField, editMode, saveField, setShowDialogs
    , checkListType, dataType, checkList, groupCheckListOption, dropcheckList, dropcheckListType, dropdataType, dropgroupCheckListOption
}: FieldDialogProps) => {
    const [isVisibleCL, setIsVisibleCL] = useState<boolean>(false)
    const [initialValueCL, setInitialValueCL] = useState<InitialValuesChecklist>({ checkListId: "", checkListName: "", isActive: false })
    const masterdataStyles = useMasterdataStyles()
    const { showSuccess, handleError } = useToast();

    const [shouldRender, setShouldRender] = useState<string>("");
    const [shouldRenderDT, setShouldRenderDT] = useState<boolean>(false);
    const { colors } = useTheme()
    console.log(editMode);

    const validationSchemaField = Yup.object().shape({
        CListID: Yup.string().required("The checklist field is required."),
        CTypeID: Yup.string().required("The checklist type field is required."),
        // DTypeID: Yup.string().required("The data type field is required."),
        // GCLOptionID: Yup.string().when(['shouldRender'], {
        //     is: (shouldRender: string) => shouldRender === "detail",
        //     then: Yup.string().required("The group checklist field is required."),
        //     otherwise: Yup.string().nullable(),
        // }),
        Placeholder: Yup.string().nullable(),
        Hint: Yup.string().nullable(),
        Required: Yup.boolean().required("The required field is required."),

        // DTypeValue?: number;
        // MinLength?: number;
        // MaxLength?: number;
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
            heightT.value = withTiming(70, { duration: 300 });
        } else if (shouldRender === "detail") {
            opacityT.value = withTiming(0, { duration: 200 });
            heightT.value = withTiming(0, { duration: 200 });
            setTimeout(() => {
                opacityD.value = withTiming(1, { duration: 100 });
                heightD.value = withTiming(70, { duration: 100 });
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
            heightN.value = withTiming(260, { duration: 300 });
        } else {
            setTimeout(() => {
                opacityN.value = withTiming(0, { duration: 300 });
                heightN.value = withTiming(0, { duration: 300 });
            }, 300);
        }
    }, [shouldRenderDT]);

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={setShowDialogs} style={masterdataStyles.containerDialog}>
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
                            validationSchema={validationSchemaField}
                            validateOnBlur={false}
                            validateOnChange={true}
                            onSubmit={values => saveField(values, editMode ? "update" : "add")}
                        >
                            {({
                                handleChange,
                                handleBlur,
                                setFieldValue,
                                values,
                                errors,
                                touched,
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
                                            setFieldValue("GCLOptionID", null);
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
                                    <AccessibleView>

                                        <ScrollView
                                            contentContainerStyle={{ paddingBottom: 5, paddingHorizontal: 10 }}
                                            showsVerticalScrollIndicator={false}
                                            style={{ maxHeight: 330 }}
                                        >
                                            <Field
                                                name="CListID"
                                                component={({ field, form }: any) => (
                                                    <AccessibleView style={[masterdataStyles.containerInput]}>
                                                        <CustomDropdownSingle
                                                            title="Check List"
                                                            labels="CListName"
                                                            values="CListID"
                                                            data={editMode ? checkList : dropcheckList}
                                                            selectedValue={field.value}
                                                            onValueChange={(value, icon) => {

                                                                form.setFieldValue(field.name, value);
                                                                form.setTouched({ ...form.touched, [field.name]: true });
                                                            }}
                                                            iconRight={(
                                                                <IconButton onPress={() => setIsVisibleCL(true)} icon="plus" />
                                                            )}
                                                        />
                                                        {touched.CListID && errors.CListID ? (
                                                            <HelperText type="error" visible={Boolean(touched.CListID && errors.CListID)} style={{ left: -10 }}>
                                                                {errors.CListID}
                                                            </HelperText>
                                                        ) : false}
                                                    </AccessibleView>
                                                )}
                                            />

                                            <Field
                                                name="CTypeID"
                                                component={({ field, form }: any) => (
                                                    <AccessibleView style={masterdataStyles.containerInput}>
                                                        <CustomDropdownSingle
                                                            title="Check List Type"
                                                            labels="CTypeName"
                                                            values="CTypeID"
                                                            data={editMode ? checkListType : dropcheckListType}
                                                            selectedValue={field.value}
                                                            onValueChange={(value, icon) => {

                                                                form.setFieldValue(field.name, value);
                                                                form.setTouched({ ...form.touched, [field.name]: true });
                                                            }}
                                                        />
                                                        {touched.CTypeID && errors.CTypeID ? (
                                                            <HelperText type="error" visible={Boolean(touched.CTypeID && errors.CTypeID)} style={{ left: -10 }}>
                                                                {errors.CTypeID}
                                                            </HelperText>
                                                        ) : false}
                                                    </AccessibleView>
                                                )}
                                            />

                                            {shouldRender === "detail" && (
                                                <Animated.View style={[animatedDetail]}>
                                                    <Field
                                                        name="GCLOptionID"
                                                        component={({ field, form }: any) => (
                                                            <AccessibleView style={masterdataStyles.containerInput}>
                                                                <CustomDropdownSingle
                                                                    title="Match Check List Option Group"
                                                                    labels="GCLOptionName"
                                                                    values="GCLOptionID"
                                                                    data={editMode ? groupCheckListOption : dropgroupCheckListOption}
                                                                    selectedValue={field.value}
                                                                    onValueChange={(value) => {
                                                                        form.setFieldValue(field.name, value);
                                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                                    }}
                                                                />
                                                                {touched.GCLOptionID && errors.GCLOptionID ? (
                                                                    <HelperText type="error" visible style={{ left: -10 }}>
                                                                        {errors.GCLOptionID}
                                                                    </HelperText>
                                                                ) : false}
                                                            </AccessibleView>
                                                        )}
                                                    />
                                                </Animated.View>
                                            )}

                                            {shouldRender === "text" && (
                                                <Animated.View style={[animatedText]}>
                                                    <Field
                                                        name="DTypeID"
                                                        component={({ field, form }: any) => (
                                                            <AccessibleView style={masterdataStyles.containerInput}>
                                                                <CustomDropdownSingle
                                                                    title="Data Type"
                                                                    labels="DTypeName"
                                                                    values="DTypeID"
                                                                    data={editMode ? dataType : dropdataType}
                                                                    selectedValue={field.value}
                                                                    onValueChange={(value) => {

                                                                        form.setFieldValue(field.name, value);
                                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                                    }}
                                                                />
                                                                {touched.DTypeID && errors.DTypeID ? (
                                                                    <HelperText type="error" visible style={{ left: -10 }}>
                                                                        {errors.DTypeID}
                                                                    </HelperText>
                                                                ) : false}
                                                            </AccessibleView>
                                                        )}
                                                    />
                                                </Animated.View>
                                            )}

                                            {shouldRenderDT && (
                                                <Animated.View style={[animatedStyleNumber]}>

                                                    <Inputs
                                                        placeholder="Digis Value"
                                                        label="DTypeValue"
                                                        handleChange={handleChange("DTypeValue")}
                                                        handleBlur={handleBlur("DTypeValue")}
                                                        value={String(values.DTypeValue ?? "")}
                                                        error={touched.DTypeValue && Boolean(errors.DTypeValue)}
                                                        errorMessage={touched.DTypeValue ? errors.DTypeValue : ""}
                                                        testId={`DTypeValue-form`}
                                                    />

                                                    <Inputs
                                                        placeholder="Min Value"
                                                        label="MinLength"
                                                        handleChange={handleChange("MinLength")}
                                                        handleBlur={handleBlur("MinLength")}
                                                        value={String(values.MinLength ?? "")}
                                                        error={touched.MinLength && Boolean(errors.MinLength)}
                                                        errorMessage={touched.MinLength ? errors.MinLength : ""}
                                                        testId={`MinLength-form`}
                                                    />

                                                    <Inputs
                                                        placeholder="Max Value"
                                                        label="MaxLength"
                                                        handleChange={handleChange("MaxLength")}
                                                        handleBlur={handleBlur("MaxLength")}
                                                        value={String(values.MaxLength ?? "")}
                                                        error={touched.MaxLength && Boolean(errors.MaxLength)}
                                                        errorMessage={touched.MaxLength ? errors.MaxLength : ""}
                                                        testId={`MaxLength-form`}
                                                    />
                                                </Animated.View>
                                            )}

                                            <Inputs
                                                placeholder="Enter Placeholder"
                                                label="Placeholder"
                                                handleChange={handleChange("Placeholder")}
                                                handleBlur={handleBlur("Placeholder")}
                                                value={values.Placeholder}
                                                error={touched.Placeholder && Boolean(errors.Placeholder)}
                                                errorMessage={touched.Placeholder ? errors.Placeholder : ""}
                                                testId={`Placeholder-form`}
                                            />

                                            <Inputs
                                                placeholder="Enter Hint"
                                                label="Hint"
                                                handleChange={handleChange("Hint")}
                                                handleBlur={handleBlur("Hint")}
                                                value={values.Hint}
                                                error={touched.Hint && Boolean(errors.Hint)}
                                                errorMessage={touched.Hint ? errors.Hint : ""}
                                                testId={`hint-form`}
                                            />

                                            <AccessibleView style={masterdataStyles.containerSwitch}>
                                                <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                                    Required: {values.Required ? "Notnull" : "Nullable"}
                                                </Text>
                                                <Switch
                                                    style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                    color={values.Required ? colors.succeass : colors.disable}
                                                    value={values.Required}
                                                    onValueChange={(v: boolean) => {
                                                        setFieldValue("Required", v);
                                                    }}
                                                />
                                            </AccessibleView>
                                        </ScrollView>

                                        <AccessibleView style={masterdataStyles.containerAction}>
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
                                                onPress={setShowDialogs}
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
                setIsVisible={() => { setIsVisibleCL(false); setInitialValueCL({ checkListId: "", checkListName: "", isActive: false }) }}
                initialValues={initialValueCL}
                saveData={saveDataCheckList}
            />

        </Portal>
    );
};

export default FieldDialog;
