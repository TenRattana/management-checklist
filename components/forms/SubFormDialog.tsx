import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Inputs } from "@/components/common";
import { Portal, Dialog, Switch, Icon, IconButton } from "react-native-paper";
import { FastField, Formik } from "formik";
import * as Yup from "yup";
import useMasterdataStyles from "@/styles/common/masterdata";
import { SubFormDialogProps } from "@/typing/value";
import { BaseSubForm } from "@/typing/form";
import Text from "@/components/Text";
import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import { styles } from "../screens/Schedule";

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
    const { responsive, spacing } = useRes()
    const { theme } = useTheme();

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={[masterdataStyles.containerDialog, { width: responsive === "large" ? 550 : '60%' }]}>
                <Dialog.Content>
                    <View style={{ justifyContent: "space-between", flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                            <Icon source="information-outline" size={spacing.large} color={theme.colors.green} />
                            <Text style={[masterdataStyles.text, masterdataStyles.title, masterdataStyles.textBold, { paddingLeft: 8 }]}>{isEditing ? "Edit Subform Detail" : "Create Subform Detail"}</Text>
                        </View>
                        <IconButton icon="close" size={20} iconColor={theme.colors.black} onPress={() => setIsVisible(false)} />
                    </View>

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
                                <>
                                    <View id="sfd">
                                        <FastField name="SFormName">
                                            {({ field, form }: any) => (
                                                <>
                                                    <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 20, paddingLeft: 10 }]}>
                                                        SubForm Name
                                                    </Text>

                                                    <Inputs
                                                        mode="outlined"
                                                        placeholder="Enter Sub Form Name"
                                                        label="Sub Form Name"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={String(field.value ?? "")}
                                                        error={form.touched.SFormName && Boolean(form.errors.SFormName)}
                                                        errorMessage={form.touched.SFormName ? form.errors.SFormName : ""}
                                                        testId={`SFormName-sform`}
                                                    />
                                                </>
                                            )}
                                        </FastField >

                                        <FastField name="Columns">
                                            {({ field, form }: any) => (
                                                <>
                                                    <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 10 }]}>
                                                        Columns
                                                    </Text>

                                                    <Inputs
                                                        mode="outlined"
                                                        placeholder="Enter Columns"
                                                        label="Columns"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={String(field.value ?? "")}
                                                        error={form.touched.Columns && Boolean(form.errors.Columns)}
                                                        errorMessage={form.touched.Columns ? form.errors.Columns : ""}
                                                        testId={`Columns-sform`}
                                                    />
                                                </>
                                            )}
                                        </FastField >

                                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 5, paddingLeft: 10 }]}>
                                            Add number in front checklist
                                        </Text>

                                        <View id="form-active-md" style={masterdataStyles.containerSwitch}>
                                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                                <Text style={[masterdataStyles.text, masterdataStyles.textDark, { margin: 10 }]}>
                                                    {values.Number ? "Add" : "None"}
                                                </Text>
                                                <Switch
                                                    style={{ transform: [{ scale: 1.1 }], top: 2, alignSelf: 'center' }}
                                                    color={values.Number ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                                    value={values.Number}
                                                    onValueChange={(v: boolean) => {
                                                        setFieldValue("Number", v);
                                                    }}
                                                    testID="Number-md"
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={[masterdataStyles.containerAction, { justifyContent: "space-between", paddingTop: 10 }]}>
                                        <TouchableOpacity
                                            onPress={() => handleSubmit()}
                                            style={[styles.button, { backgroundColor: theme.colors.green, flex: 1, marginRight: 5, flexDirection: "row" }]}
                                        >
                                            <Icon source="check" size={spacing.large} color={theme.colors.fff} />

                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                                {isEditing ? "Update" : "Add"}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => setIsVisible(false)}
                                            style={[styles.button, masterdataStyles.backMain, { flex: 1, marginLeft: 10, flexDirection: "row" }]}
                                        >
                                            <Icon source="close" size={spacing.large} color={theme.colors.fff} />

                                            <Text style={[masterdataStyles.text, masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>

                                        {isEditing && (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    onDelete(values.SFormID)
                                                }}
                                                style={[styles.button, { backgroundColor: theme.colors.error, flexDirection: "row", flex: 1, marginLeft: 100 }]}
                                            >
                                                <Icon source="trash-can" size={spacing.large} color={theme.colors.fff} />

                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                                    Delete
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
});

export default SubFormDialog;
