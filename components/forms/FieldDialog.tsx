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
import Animated, { FadeInUp, FadeOutDown, withDelay } from 'react-native-reanimated';

interface FormState {
    MCListID: string;
    CListID: string;
    GCLOptionID: string;
    CTypeID: string;
    CListName?: string;
    CTypeName?: string;
    DTypeID: string;
    DTypeValue?: number;
    SFormID: string;
    Required: boolean;
    MinLength?: number;
    MaxLength?: number;
    Description: string;
    Placeholder: string;
    Hint: string;
    DisplayOrder?: number;
    EResult: string;
}
interface CheckListType {
    CTypeID: string;
    CTypeName: string;
    Icon: string;
    IsActive: boolean;
}

interface DataType {
    DTypeID: string;
    DTypeName: string;
    IsActive: boolean;
    Icon: string;
}

interface Checklist {
    CListID: string;
    CListName: string;
    IsActive: boolean;
}

interface GroupCheckListOption {
    GCLOptionID: string;
    GCLOptionName: string;
    Description: string;
    IsActive: boolean;
}
interface InitialValuesCheckList {
    checkListId: string;
    checkListName: string;
    isActive: boolean;
}

interface FieldDialogProps {
    isVisible: boolean;
    formState: FormState;
    onDeleteField: (SFormID: string, MCListID: string) => void;
    setShowDialogs: () => void;
    editMode: boolean;
    saveField: (values: FormState, mode: string) => void;
    checkListType: CheckListType[]
    dataType: DataType[];
    checkList: Checklist[];
    groupCheckListOption: GroupCheckListOption[];
    dropcheckList: Checklist[];
    dropcheckListType: CheckListType[];
    dropdataType: DataType[];
    dropgroupCheckListOption: GroupCheckListOption[];
}

const validationSchemaField = Yup.object().shape({
    checkListId: Yup.string().required("Check List is required."),
    checkListTypeId: Yup.string().required("Check List Type is required."),
    placeholder: Yup.string().nullable(),
    hint: Yup.string().nullable(),
});

const FieldDialog: React.FC<FieldDialogProps> = ({ isVisible, formState, onDeleteField, editMode, saveField, setShowDialogs
    , checkListType, dataType, checkList, groupCheckListOption, dropcheckList, dropcheckListType, dropdataType, dropgroupCheckListOption
}) => {
    const [isVisibleCL, setIsVisibleCL] = useState(false)
    const [initialValueCL, setInitialValueCL] = useState<InitialValuesCheckList>({ checkListId: "", checkListName: "", isActive: false })
    const masterdataStyles = useMasterdataStyles()
    const { showSuccess, showError } = useToast();

    const [shouldRender, setShouldRender] = useState<string>("");
    const [shouldRenderDT, setShouldRenderDT] = useState<boolean>(false);
    const { colors } = useTheme()

    const errorMessage = useCallback((error: unknown) => {
        let errorMessage: string | string[];

        if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.errors ?? ["Something went wrong!"];
        } else if (error instanceof Error) {
            errorMessage = [error.message];
        } else {
            errorMessage = ["An unknown error occurred!"];
        }

        showError(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
    }, [showError]);

    const saveDataCheckList = async (values: InitialValuesCheckList) => {
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
            errorMessage(error);
        }
    };

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
                                            setFieldValue("GCLOptionID", []);
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
                                                        {touched.CListID && errors.CListID && (
                                                            <HelperText type="error" visible={Boolean(touched.CListID && errors.CListID)} style={{ left: -10 }}>
                                                                {errors.CListID}
                                                            </HelperText>
                                                        )}
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
                                                        {touched.CTypeID && errors.CTypeID && (
                                                            <HelperText type="error" visible={Boolean(touched.CTypeID && errors.CTypeID)} style={{ left: -10 }}>
                                                                {errors.CTypeID}
                                                            </HelperText>
                                                        )}
                                                    </AccessibleView>
                                                )}
                                            />


                                            <Animated.View
                                                entering={FadeInUp}
                                                exiting={FadeOutDown}
                                                style={{ display: shouldRender === "detail" ? 'flex' : 'none', opacity: withDelay(300, FadeInUp) }}
                                            >
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
                                                            {touched.GCLOptionID && errors.GCLOptionID && (
                                                                <HelperText type="error" visible style={{ left: -10 }}>
                                                                    {errors.GCLOptionID}
                                                                </HelperText>
                                                            )}
                                                        </AccessibleView>
                                                    )}
                                                />
                                            </Animated.View>

                                            <Animated.View
                                                entering={FadeInUp}
                                                exiting={FadeOutDown}
                                                style={{ display: shouldRender === "text" ? 'flex' : 'none', opacity: withDelay(300, FadeInUp) }}
                                            >
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
                                                                    console.log(shouldRender);

                                                                    form.setFieldValue(field.name, value);
                                                                    form.setTouched({ ...form.touched, [field.name]: true });
                                                                }}
                                                            />
                                                            {touched.DTypeID && errors.DTypeID && (
                                                                <HelperText type="error" visible style={{ left: -10 }}>
                                                                    {errors.DTypeID}
                                                                </HelperText>
                                                            )}
                                                        </AccessibleView>
                                                    )}
                                                />
                                            </Animated.View>

                                            <Animated.View
                                                entering={FadeInUp}
                                                exiting={FadeOutDown}
                                                style={{ display: shouldRenderDT ? 'flex' : 'none', opacity: withDelay(300, FadeInUp) }}
                                            >

                                                <Inputs
                                                    placeholder="Digis Value"
                                                    label="DTypeValue"
                                                    handleChange={handleChange("DTypeValue")}
                                                    handleBlur={handleBlur("DTypeValue")}
                                                    value={String(values.DTypeValue ?? "")}
                                                    error={touched.DTypeValue && Boolean(errors.DTypeValue)}
                                                    errorMessage={touched.DTypeValue ? errors.DTypeValue : ""}
                                                />

                                                <Inputs
                                                    placeholder="Min Value"
                                                    label="MinLength"
                                                    handleChange={handleChange("MinLength")}
                                                    handleBlur={handleBlur("MinLength")}
                                                    value={String(values.MinLength ?? "")}
                                                    error={touched.MinLength && Boolean(errors.MinLength)}
                                                    errorMessage={touched.MinLength ? errors.MinLength : ""}
                                                />

                                                <Inputs
                                                    placeholder="Max Value"
                                                    label="MaxLength"
                                                    handleChange={handleChange("MaxLength")}
                                                    handleBlur={handleBlur("MaxLength")}
                                                    value={String(values.MaxLength ?? "")}
                                                    error={touched.MaxLength && Boolean(errors.MaxLength)}
                                                    errorMessage={touched.MaxLength ? errors.MaxLength : ""}
                                                />

                                            </Animated.View>

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
                                                    onPress={() => onDeleteField(values.SFormID, values.MCListID)}
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
                isVisible={isVisibleCL}
                setIsVisible={() => { setIsVisibleCL(false); setInitialValueCL({ checkListId: "", checkListName: "", isActive: false }) }}
                initialValues={initialValueCL}
                saveData={saveDataCheckList}
            />

        </Portal>
    );
};

export default FieldDialog;
