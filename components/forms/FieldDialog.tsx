import React, { useRef, useState, useEffect } from "react";
import {
    View,
    Pressable,
    Animated,
    ScrollView,
    GestureResponderEvent,
} from "react-native";
import { Portal, Dialog, Text, Switch } from "react-native-paper";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import Inputs from "@/components/common/Inputs";
import { Formik, Field } from "formik";
import * as Yup from "yup";

interface FormValues {
    checkListId: string;
    groupCheckListOptionId: string;
    checkListTypeId: string;
    dataTypeId: string;
    dataTypeValue: string;
    subFormId: string;
    require: boolean;
    minLength: string;
    maxLength: string;
    description: string;
    placeholder: string;
    hint: string;
    displayOrder: string;
}

interface FieldDialogProps {
    isVisible: boolean;
    formState: FormValues;
    validationSchemaField: Yup.ObjectSchema<FormValues>;
    checkList: any[];
    checkListType: any[];
    dataType: any[];
    onDeleteField: (subFormId: string, matchCheckListId: string) => void;
    style: {
        styles: any;
        colors: any;
        spacing: any;
    };
    setShowDialogs: () => void;
    editMode: boolean;
    saveField: (values: any, mode: string) => void;
    groupCheckListOption: any[];
}

const FieldDialog: React.FC<FieldDialogProps> = ({
    isVisible,
    formState,
    validationSchemaField,
    checkList,
    checkListType,
    dataType,
    onDeleteField,
    style,
    editMode,
    saveField,
    groupCheckListOption,
    setShowDialogs,
}) => {
    const { styles, colors, spacing } = style;
    const [shouldRender, setShouldRender] = useState<string>("");
    const [shouldRenderDT, setShouldRenderDT] = useState<boolean>(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const fadeAnimDT = useRef(new Animated.Value(0)).current;

    const startAnimation = (anim: Animated.Value) => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    };

    const resetAnimation = (anim: Animated.Value) => {
        Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        if (!editMode) {
            resetAnimation(fadeAnim);
            startAnimation(fadeAnim);
        }
    }, [shouldRender, editMode]);

    useEffect(() => {
        if (!editMode) {
            resetAnimation(fadeAnimDT);
            startAnimation(fadeAnimDT);
        }
    }, [shouldRenderDT, editMode]);

    const dropcheckList = checkList.filter(v => v.IsActive);
    const dropcheckListType = checkListType.filter(v => v.IsActive);
    const dropdataType = dataType.filter(v => v.IsActive);
    const dropgroupCheckListOption = groupCheckListOption.filter(v => v.IsActive);

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={setShowDialogs}>
                <Dialog.Title style={{ paddingLeft: 8 }}>
                    {editMode ? "Edit check list" : "Create check list"}
                </Dialog.Title>
                <Dialog.Content>
                    <Text style={[{ marginBottom: 10, paddingLeft: 10 }]}>
                        {editMode ? "Edit the details of the field." : "Enter the details for the new field."}
                    </Text>

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
                                    item => item.CTypeID === values.checkListTypeId
                                )?.CTypeName;

                                const newRender = ["Dropdown", "Radio", "Checkbox"].includes(checkListTypeItem)
                                    ? "detail"
                                    : ["Textinput", "Textarea"].includes(checkListTypeItem)
                                        ? "text"
                                        : "";

                                if (newRender !== shouldRender) {
                                    setShouldRender(newRender);
                                }
                            }, [values.checkListTypeId]);

                            useEffect(() => {
                                const dataTypeItem = dataType.find(
                                    item => item.DTypeID === values.dataTypeId
                                )?.DTypeName;

                                setShouldRenderDT(dataTypeItem === "Number");
                            }, [values.dataTypeId]);

                            return (
                                <View>
                                    <ScrollView
                                        contentContainerStyle={{ paddingBottom: 5, paddingHorizontal: 10 }}
                                        showsVerticalScrollIndicator={false}
                                        style={{ maxHeight: 330 }}
                                    >
                                        <Field
                                            name="checkListId"
                                            component={({ field, form }: any) => (
                                                <CustomDropdownSingle
                                                    title="Check List"
                                                    labels="CListName"
                                                    values="CListID"
                                                    data={editMode ? checkList : dropcheckList}
                                                    selectedValue={values.checkListId}
                                                    onValueChange={(value: any) => {
                                                        setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                    lefticon={"check-all"}
                                                />
                                            )}
                                        />

                                        {touched.checkListId && errors.checkListId && typeof errors.checkListId === 'string' && (
                                            <Text style={[styles.text, styles.textError, { marginLeft: spacing.xs, top: -spacing.xxs }]}>
                                                {errors.checkListId}
                                            </Text>
                                        )}

                                        <Field
                                            name="checkListTypeId"
                                            component={({ field, form }: any) => (
                                                <CustomDropdownSingle
                                                    title="Check list Type"
                                                    labels="CTypeName"
                                                    values="CTypeID"
                                                    lefticon={"card-text"}
                                                    data={editMode ? checkListType : dropcheckListType}
                                                    selectedValue={values.checkListTypeId}
                                                    onValueChange={(value: any) => {
                                                        setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                />
                                            )}
                                        />
                                        {touched.checkListTypeId && errors.checkListTypeId && typeof errors.checkListTypeId === 'string' && (
                                            <Text style={[styles.text, styles.textError, { marginLeft: spacing.xs, top: -spacing.xxs }]}>
                                                {errors.checkListTypeId}
                                            </Text>
                                        )}

                                        <Animated.View style={[styles.animatedText, { opacity: fadeAnim }]}>
                                            {shouldRender === "detail" && (
                                                <>
                                                    <Field
                                                        name="groupCheckListOptionId"
                                                        component={({ field, form }: any) => (
                                                            <CustomDropdownSingle
                                                                title="Match Check List Option Group"
                                                                labels="GCLOptionName"
                                                                values="GCLOptionID"
                                                                data={editMode ? groupCheckListOption : dropgroupCheckListOption}
                                                                selectedValue={values.groupCheckListOptionId}
                                                                onValueChange={(value: any) => {
                                                                    setFieldValue(field.name, value);
                                                                    form.setTouched({ ...form.touched, [field.name]: true });
                                                                }}
                                                                lefticon={"format-list-group"}
                                                            />
                                                        )}
                                                    />
                                                    {touched.groupCheckListOptionId && errors.groupCheckListOptionId && typeof errors.groupCheckListOptionId === 'string' && (
                                                        <Text style={[styles.text, styles.textError, { marginLeft: spacing.xs, top: -spacing.xxs }]}>
                                                            {errors.groupCheckListOptionId}
                                                        </Text>
                                                    )}
                                                </>
                                            )}

                                            {shouldRender === "text" && (
                                                <>
                                                    <Field
                                                        name="dataTypeId"
                                                        component={({ field, form }: any) => (
                                                            <CustomDropdownSingle
                                                                title="Data Type"
                                                                labels="DTypeName"
                                                                values="DTypeID"
                                                                lefticon={"text-recognition"}
                                                                data={editMode ? dataType : dropdataType}
                                                                selectedValue={values.dataTypeId}
                                                                onValueChange={(value: any) => {
                                                                    setFieldValue(field.name, value);
                                                                    form.setTouched({ ...form.touched, [field.name]: true });
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {touched.dataTypeId && errors.dataTypeId && typeof errors.dataTypeId === 'string' && (
                                                        <Text style={[styles.text, styles.textError, { marginLeft: spacing.xs, top: -spacing.xxs }]}>
                                                            {errors.dataTypeId}
                                                        </Text>
                                                    )}
                                                </>
                                            )}
                                        </Animated.View>

                                        {shouldRenderDT && (
                                            <Animated.View style={[styles.animatedText, { opacity: fadeAnimDT }]}>
                                                <Field
                                                    name="minLength"
                                                    component={({ field, form }: any) => (
                                                        <Inputs
                                                            label="Min Value"
                                                            lefticon="minus"
                                                            value={field.value}
                                                            handleChange={(v: string) => {
                                                                form.setFieldValue(field.name, v);
                                                            }}
                                                            handleBlur={() => form.handleBlur(field.name)}
                                                        />
                                                    )}
                                                />

                                                {touched.minLength && errors.minLength && typeof errors.minLength === 'string' && (
                                                    <Text style={[styles.text, styles.textError, { marginLeft: spacing.xs, top: -spacing.xxs }]}>
                                                        {errors.minLength}
                                                    </Text>
                                                )}

                                                <Field
                                                    name="maxLength"
                                                    component={({ field, form }: any) => (
                                                        <Inputs
                                                            label="Max Value"
                                                            lefticon="plus"
                                                            value={field.value}
                                                            handleChange={(v: string) => {
                                                                form.setFieldValue(field.name, v);
                                                            }}
                                                            handleBlur={() => handleBlur(field.name)}
                                                        />
                                                    )}
                                                />
                                                {touched.maxLength && errors.maxLength && typeof errors.maxLength === 'string' && (
                                                    <Text style={[styles.text, styles.textError, { marginLeft: spacing.xs, top: -spacing.xxs }]}>
                                                        {errors.maxLength}
                                                    </Text>
                                                )}

                                            </Animated.View>
                                        )}

                                        <Field
                                            name="isRequired"
                                            component={({ field }: any) => (
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <Text style={[styles.text]}>Required Field</Text>
                                                    <Switch
                                                        value={field.value}
                                                        onValueChange={value => {
                                                            setFieldValue(field.name, value);
                                                            field.onChange(value);
                                                        }}
                                                    />
                                                </View>
                                            )}
                                        />
                                    </ScrollView>
                                </View>
                            );
                        }}
                    </Formik>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
};

export default FieldDialog;
