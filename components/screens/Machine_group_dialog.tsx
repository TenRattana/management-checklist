import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog, Icon, IconButton } from "react-native-paper";
import { FastField, Field, Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { GroupMachineDialogProps, InitialValuesGroupMachine } from '@/typing/value'
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";

const validationSchema = Yup.object().shape({
    machineGroupName: Yup.string().required("The group machine name field is required."),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The status field is required."),
});

const Machine_group_dialog = React.memo(({ isVisible, setIsVisible, isEditing, initialValues, saveData }: GroupMachineDialogProps<InitialValuesGroupMachine>) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()
    const { spacing } = useRes()

    const styles = StyleSheet.create({
        button: {
            alignSelf: 'flex-end',
            paddingHorizontal: 20,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.drag,
            borderRadius: 4,
        },
    })

    return (
        <Portal>
            <Dialog
                visible={isVisible}
                onDismiss={() => setIsVisible(false)}
                style={masterdataStyles.containerDialog}
                testID="dialog-mgd"
            >
                <Dialog.Content>
                    <View style={{ justifyContent: "space-between", flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                            <Icon source="information-outline" size={spacing.large} color={theme.colors.green} />
                            <Text style={[masterdataStyles.text, masterdataStyles.title, masterdataStyles.textBold, { paddingLeft: 8 }]}>{isEditing ? "Edit" : "Create"}
                            </Text>
                        </View>
                        <IconButton icon="close" size={20} iconColor={theme.colors.onBackground} onPress={() => setIsVisible(false)} />
                    </View>

                    <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 10 }]}>
                        {isEditing
                            ? "Edit the details of the group machine."
                            : "Enter the details for the new group machine."}
                    </Text>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={false}
                            onSubmit={(values: InitialValuesGroupMachine) => saveData(values)}
                        >
                            {({ values, handleSubmit, setFieldValue, isValid, dirty, touched }) => {

                                return (
                                    <View id="form-mgd">
                                        <Field name="machineGroupName">
                                            {({ field, form }: any) => (
                                                <>
                                                    <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 20, paddingLeft: 10 }]}>
                                                        Group Machine Name
                                                    </Text>

                                                    <Inputs
                                                        mode="outlined"
                                                        placeholder="Enter Group Machine Name"
                                                        label="Group Machine Name"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={field.value}
                                                        error={form.touched.machineGroupName && Boolean(form.errors.machineGroupName)}
                                                        errorMessage={form.touched.machineGroupName ? form.errors.machineGroupName : ""}
                                                        testId="machineGroupName-mgd"
                                                    />
                                                </>
                                            )}
                                        </Field >

                                        <Field name="description">
                                            {({ field, form }: any) => (
                                                <>
                                                    <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 10 }]}>
                                                        Group Machine Name
                                                    </Text>

                                                    <Inputs
                                                        mode="outlined"
                                                        placeholder="Enter Description"
                                                        label="Description"
                                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                                        handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                        value={field.value}
                                                        error={form.touched.description && Boolean(form.errors.description)}
                                                        errorMessage={form.touched.description ? form.errors.description : ""}
                                                        testId="description-mgd"
                                                    />
                                                </>
                                            )}
                                        </Field >

                                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 10, paddingLeft: 10 }]}>
                                            Group Machine Status
                                        </Text>

                                        <View id="form-active-mgd" style={masterdataStyles.containerSwitch}>
                                            <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                                {values.isActive ? "Active" : "Inactive"}
                                            </Text>
                                            <Switch
                                                style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                color={values.disables ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                                disabled={Boolean(values.disables)}
                                                value={values.isActive}
                                                onValueChange={(v: boolean) => {
                                                    setFieldValue("isActive", v);
                                                }}
                                                testID="isActive-mgd"
                                            />
                                        </View>

                                        <View style={[masterdataStyles.containerAction, { justifyContent: "flex-end", flexDirection: 'row', paddingTop: 10, paddingRight: 20 }]}>
                                            <TouchableOpacity
                                                onPress={() => handleSubmit()}
                                                style={[styles.button, { backgroundColor: theme.colors.green, marginRight: 5, flexDirection: "row" }]}
                                            >
                                                <Icon source="check" size={spacing.large} color={theme.colors.fff} />

                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                                    {isEditing ? "Update" : "Add"}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => setIsVisible(false)}
                                                style={[styles.button, masterdataStyles.backMain, { marginLeft: 10, flexDirection: "row" }]}
                                            >
                                                <Icon source="close" size={spacing.large} color={theme.colors.fff} />

                                                <Text style={[masterdataStyles.text, masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                                    Cancel
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            }}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
})

export default Machine_group_dialog