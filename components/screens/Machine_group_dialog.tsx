import React from "react";
import { Pressable } from "react-native";
import { useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog } from "react-native-paper";
import { FastField, Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { GroupMachineDialogProps, InitialValuesGroupMachine } from '@/typing/value'
import Text from "@/components/Text";

const validationSchema = Yup.object().shape({
    machineGroupName: Yup.string().required("The machine group name field is required."),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const Machine_group_dialog = ({ isVisible, setIsVisible, isEditing, initialValues, saveData }: GroupMachineDialogProps<InitialValuesGroupMachine>) => {
    const masterdataStyles = useMasterdataStyles()
    // const { colors } = useTheme()
    console.log("Machine_group_dialog");

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
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(values: InitialValuesGroupMachine) => saveData(values)}
                        >
                            {({ handleChange, handleBlur, values, errors, touched, handleSubmit, setFieldValue, isValid, dirty }) => (
                                <AccessibleView name="form-mgd">
                                    <FastField name="machineGroupName">
                                        {({ field, form }: any) => (
                                            <Inputs
                                                placeholder="Enter Machine Group Name"
                                                label="Machine Group Name"
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

                                    <AccessibleView name="form-active-mgd" style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            Status: {values.isActive ? "Active" : "Inactive"}
                                        </Text>
                                        <Switch
                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                            // color={values.isActive ? colors.succeass : colors.disable}
                                            value={values.isActive}
                                            onValueChange={(v: boolean) => {
                                                setFieldValue("isActive", v);
                                            }}
                                            testID="isActive-mgd"
                                        />
                                    </AccessibleView>
                                    <AccessibleView name="form-action-mgd" style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                isValid && dirty ? masterdataStyles.backMain : masterdataStyles.backDis,
                                            ]}
                                            testID="Save-mgd"
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Save</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-mgd">
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Cancel</Text>
                                        </Pressable>
                                    </AccessibleView>
                                </AccessibleView>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}

export default React.memo(Machine_group_dialog)