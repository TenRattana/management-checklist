import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog } from "react-native-paper";
import { FastField, Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { GroupMachineDialogProps, InitialValuesGroupMachine } from '@/typing/value'
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";

const validationSchema = Yup.object().shape({
    machineGroupName: Yup.string().required("The group machine name field is required."),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The status field is required."),
});

const Machine_group_dialog = React.memo(({ isVisible, setIsVisible, isEditing, initialValues, saveData }: GroupMachineDialogProps<InitialValuesGroupMachine>) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()

    return (
        <Portal>
            <Dialog
                visible={isVisible}
                onDismiss={() => setIsVisible(false)}
                style={masterdataStyles.containerDialog}
                testID="dialog-mgd"
            >
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]} testID="dialog-title-mgd">
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>

                    <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 10 }]}>
                        {isEditing
                            ? "Edit the details of the group machine."
                            : "Enter the details for the new group machine."}
                    </Text>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(values: InitialValuesGroupMachine) => saveData(values)}
                        >
                            {({ handleChange, handleBlur, values, errors, touched, handleSubmit, setFieldValue, isValid, dirty }) => (
                                <View id="form-mgd">
                                    <FastField name="machineGroupName">
                                        {({ field, form }: any) => (
                                            <Inputs
                                                placeholder="Enter Group Machine Name"
                                                label="Group Machine Name"
                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                value={field.value}
                                                error={form.touched.machineGroupName && Boolean(form.errors.machineGroupName)}
                                                errorMessage={form.touched.machineGroupName ? form.errors.machineGroupName : ""}
                                                testId="machineGroupName-mgd"
                                            />
                                        )}
                                    </FastField >

                                    <FastField name="description">
                                        {({ field, form }: any) => (
                                            <Inputs
                                                placeholder="Enter Description"
                                                label="Description"
                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                value={field.value}
                                                error={form.touched.description && Boolean(form.errors.description)}
                                                errorMessage={form.touched.description ? form.errors.description : ""}
                                                testId="description-mgd"
                                            />
                                        )}
                                    </FastField >

                                    <View id="form-active-mgd" style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            Status: {values.isActive ? "Active" : "Inactive"}
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
                                    <View id="form-action-mgd" style={masterdataStyles.containerAction}>
                                        <TouchableOpacity
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                masterdataStyles.backMain,
                                                { opacity: isValid && dirty ? 1 : 0.5 }
                                            ]}
                                            testID="Save-mgd"
                                        >
                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Save</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-mgd">
                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
})

export default Machine_group_dialog