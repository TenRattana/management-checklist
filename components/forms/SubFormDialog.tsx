import React from "react";
import { Pressable, View } from "react-native";
import { Inputs } from "@/components/common";
import { Portal, Dialog } from "react-native-paper";
import { FastField, Formik } from "formik";
import * as Yup from "yup";
import useMasterdataStyles from "@/styles/common/masterdata";
import { SubFormDialogProps } from "@/typing/value";
import { BaseSubForm } from "@/typing/form";
import Text from "@/components/Text";
import { AccessibleView } from "..";

const validationSchemaSubForm = Yup.object().shape({
    SFormName: Yup.string().required("The machine group name field is required."),
    Columns: Yup.number().typeError(`The column field must be a valid number`).required("The columns field is required."),
});

const SubFormDialog = ({
    isVisible,
    setIsVisible,
    isEditing,
    initialValues,
    saveData,
    onDelete,
}: SubFormDialogProps<BaseSubForm>) => {
    const masterdataStyles = useMasterdataStyles();
    console.log("SubFormDialog");

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog}>
                <Dialog.Title
                    style={[
                        masterdataStyles.text,
                        masterdataStyles.textBold,
                        { paddingLeft: 8 },
                    ]}
                >
                    {isEditing ? "Edit Subform Detail" : "Create Subform Detail"}
                </Dialog.Title>
                <Dialog.Content>
                    <Text
                        style={[
                            masterdataStyles.text,
                            masterdataStyles.textDark,
                            { marginBottom: 10, paddingLeft: 10 },
                        ]}
                    >
                        {isEditing
                            ? "Edit the details of the sub form."
                            : "Enter the details for the new sub form."}
                    </Text>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchemaSubForm}
                            validateOnBlur={false}
                            validateOnChange={true}
                            onSubmit={(values) => {
                                saveData(values, isEditing ? "update" : "add");
                            }}
                        >
                            {({
                                handleChange,
                                handleBlur,
                                values,
                                errors,
                                touched,
                                handleSubmit,
                                isValid,
                                dirty,
                            }) => (
                                <AccessibleView name="sfd">
                                    <FastField name="SFormName">
                                        {({ field, form }: any) => (
                                            <Inputs
                                                placeholder="Enter Sub Form Name"
                                                label="Sub Form Name"
                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                value={String(field.value ?? "")}
                                                error={form.touched.SFormName && Boolean(form.errors.SFormName)}
                                                errorMessage={form.touched.SFormName ? form.errors.SFormName : ""}
                                                testId={`SFormName-sform`}
                                            />
                                        )}
                                    </FastField >

                                    <FastField name="Columns">
                                        {({ field, form }: any) => (
                                            <Inputs
                                                placeholder="Enter Columns"
                                                label="Columns"
                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                value={String(field.value ?? "")}
                                                error={form.touched.Columns && Boolean(form.errors.Columns)}
                                                errorMessage={form.touched.Columns ? form.errors.Columns : ""}
                                                testId={`Columns-sform`}
                                            />
                                        )}
                                    </FastField >

                                    <AccessibleView name="sfd-action" style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                masterdataStyles.backMain,
                                                { opacity: isValid && dirty ? 1 : 0.5 }
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    masterdataStyles.textFFF,
                                                    masterdataStyles.textBold,
                                                ]}
                                            >
                                                {isEditing ? "Update SubForm" : "Add SubForm"}
                                            </Text>
                                        </Pressable>

                                        {isEditing && (
                                            <Pressable
                                                onPress={() => onDelete(values.SFormID)}
                                                style={[
                                                    masterdataStyles.button,
                                                    masterdataStyles.backMain,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        masterdataStyles.textFFF,
                                                        masterdataStyles.textBold,
                                                    ]}
                                                >
                                                    Delete sub form
                                                </Text>
                                            </Pressable>
                                        )}

                                        <Pressable
                                            onPress={() => setIsVisible(false)}
                                            style={[
                                                masterdataStyles.button,
                                                masterdataStyles.backMain,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    masterdataStyles.textFFF,
                                                    masterdataStyles.textBold,
                                                ]}
                                            >
                                                Cancel
                                            </Text>
                                        </Pressable>
                                    </AccessibleView>
                                </AccessibleView>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
};

export default React.memo(SubFormDialog);
