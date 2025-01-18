import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog, Icon } from "react-native-paper";
import { Field, Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import HeaderDialog from "./HeaderDialog";
import { useSelector } from "react-redux";
import { GroupMachineDialogProps, InitialValuesGroupMachine } from "@/typing/screens/GroupMachine";

const validationSchema = Yup.object().shape({
    machineGroupName: Yup.string().required("The group machine name field is required."),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The status field is required."),
});

const Machine_group_dialog = React.memo(({ isVisible, setIsVisible, isEditing, initialValues, saveData }: GroupMachineDialogProps<InitialValuesGroupMachine>) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()
    const { spacing } = useRes()
    const state = useSelector((state: any) => state.prefix);

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
        buttonSubmit: {
            backgroundColor: theme.colors.green,
            marginRight: 5,
            flexDirection: "row"
        },
        containerAction: {
            justifyContent: "flex-end",
            flexDirection: 'row',
            paddingTop: 10,
            paddingRight: 20
        }
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
                    <HeaderDialog isEditing setIsVisible={() => setIsVisible(false)} display={state.GroupMachine} />

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
                                                        {`${state.GroupMachine} Name`}
                                                    </Text>

                                                    <Inputs
                                                        mode="outlined"
                                                        placeholder={`Enter ${state.GroupMachine} Name`}
                                                        label={`${state.GroupMachine} Name`}
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
                                                        {`${state.GroupMachine} Description`}
                                                    </Text>

                                                    <Inputs
                                                        mode="outlined"
                                                        placeholder={`Enter ${state.GroupMachine} Description`}
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
                                            {`${state.GroupMachine} Status`}
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

                                        <View style={[masterdataStyles.containerAction, styles.containerAction]}>
                                            <TouchableOpacity
                                                onPress={() => handleSubmit()}
                                                style={[styles.button, styles.buttonSubmit]}
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