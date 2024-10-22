import React from "react";
import { Pressable } from "react-native";
import { useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog, HelperText } from "react-native-paper";
import { Formik, FastField, Field } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { MachineDialogProps, InitialValuesMachine } from '@/typing/value'
import { GroupMachine } from '@/typing/type'
import Text from "@/components/Text";

const validationSchema = Yup.object().shape({
    machineGroupId: Yup.string().required("The machine group field is required."),
    machineName: Yup.string().required("The machine name field is required."),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const Machine_dialog = ({ isVisible, setIsVisible, isEditing, initialValues, saveData, dropmachine, machineGroup = [] }: MachineDialogProps<InitialValuesMachine, GroupMachine>) => {
    const masterdataStyles = useMasterdataStyles()
    // const { colors } = useTheme()
    console.log("Machine_dialog");

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog} testID="dialog-md">
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]} testID="dialog-title-md">
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(values: InitialValuesMachine) => saveData(values)}
                        >
                            {({ values, handleSubmit, setFieldValue, dirty, isValid }) => (
                                <AccessibleView name="form-md">
                                    <FastField name="machineGroupId">
                                        {({ field, form }: any) => (
                                            <CustomDropdownSingle
                                                title="Machine Group"
                                                labels="GMachineName"
                                                values="GMachineID"
                                                data={!isEditing ? machineGroup?.filter((v) => v.IsActive) : dropmachine || []}
                                                value={field.value}
                                                handleChange={(value) => {
                                                    form.setFieldValue(field.name, value.value);
                                                    setTimeout(() => {
                                                        form.setFieldTouched(field.name, true);
                                                    }, 0)
                                                }}
                                                handleBlur={() => {
                                                    form.setFieldTouched(field.name, true);
                                                }}
                                                testId="machineGroupId-md"
                                                error={form.touched.machineGroupId && Boolean(form.errors.machineGroupId)}
                                                errorMessage={form.touched.machineGroupId ? form.errors.machineGroupId : ""}
                                            />
                                        )}
                                    </FastField>

                                    <FastField name="machineName">
                                        {({ field, form }: any) => (
                                            <Inputs
                                                placeholder="Enter Machine Name"
                                                label="Machine Name"
                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                value={field.value}
                                                error={form.touched.machineName && Boolean(form.errors.machineName)}
                                                errorMessage={form.touched.machineName ? form.errors.machineName : ""}
                                                testId="machineName-md"
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
                                                testId="description-md"
                                            />
                                        )}
                                    </FastField>

                                    <AccessibleView name="form-active-md" style={masterdataStyles.containerSwitch}>
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
                                            testID="isActive-md"
                                        />
                                    </AccessibleView>

                                    <AccessibleView name="form-action-md" style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                isValid && dirty ? masterdataStyles.backMain : masterdataStyles.backDis,
                                            ]}
                                            testID="Save-md"
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Save</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-md">
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

export default React.memo(Machine_dialog)