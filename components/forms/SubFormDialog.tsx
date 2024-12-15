import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Inputs } from "@/components/common";
import { Portal, Dialog, Switch } from "react-native-paper";
import { FastField, Formik } from "formik";
import * as Yup from "yup";
import useMasterdataStyles from "@/styles/common/masterdata";
import { SubFormDialogProps } from "@/typing/value";
import { BaseSubForm } from "@/typing/form";
import Text from "@/components/Text";
import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";

const validationSchemaSubForm = Yup.object().shape({
    SFormName: Yup.string().required("The machine group name field is required."),
    Columns: Yup.number().typeError(`The column field must be a valid number`).required("The columns field is required."),
    Number: Yup.boolean().typeError('The number field must be a true or false').required("The number field is required.")
});

const SubFormDialog = React.memo(({
    isVisible,
    setIsVisible,
    isEditing,
    initialValues,
    saveData,
    onDelete,
}: SubFormDialogProps<BaseSubForm>) => {
    const masterdataStyles = useMasterdataStyles();
    const { responsive } = useRes()
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        actionButton: {
            margin: 5,
            padding: 10
        },
    })
    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={[masterdataStyles.containerDialog, { width: responsive === "large" ? 550 : '60%', }]}>
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
                            {({ handleSubmit, values, setFieldValue }) => (
                                <View id="sfd">
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

                                    <View id="form-active-md" style={masterdataStyles.containerSwitch}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                                Add number in front checklist: {values.Number ? "Add" : "None"}
                                            </Text>
                                            <Switch
                                                style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                color={values.Number ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                                value={values.Number}
                                                onValueChange={(v: boolean) => {
                                                    setFieldValue("Number", v);
                                                }}
                                                testID="Number-md"
                                            />
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }} id="sfd-action">
                                        <TouchableOpacity onPress={() => handleSubmit()} style={styles.actionButton}>
                                            <Text style={masterdataStyles.text}>{isEditing ? "Update SubForm" : "Add SubForm"}</Text>
                                        </TouchableOpacity>

                                        {isEditing && (
                                            <TouchableOpacity onPress={() => onDelete(values.SFormID)} style={styles.actionButton}>
                                                <Text style={masterdataStyles.text}>Delete</Text>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.actionButton}>
                                            <Text style={masterdataStyles.text}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
});

export default SubFormDialog;
