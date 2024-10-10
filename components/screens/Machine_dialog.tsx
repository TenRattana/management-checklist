import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog, HelperText } from "react-native-paper";
import { Formik, FastField } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { MachineDialogProps, InitialValuesMachine } from '@/typing/value'
import { MachineGroup } from '@/typing/type'

const validationSchema = Yup.object().shape({
    machineGroupId: Yup.string().required("The machine group field is required."),
    machineName: Yup.string().required("The machine name field is required."),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const Machine_dialog = ({ isVisible, setIsVisible, isEditing, initialValues, saveData, dropmachine, machineGroup = [] }: MachineDialogProps<InitialValuesMachine, MachineGroup>) => {
    const masterdataStyles = useMasterdataStyles()
    const { colors } = useTheme()
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
                            validateOnBlur={false}
                            validateOnChange={true}
                            onSubmit={(values: InitialValuesMachine) => saveData(values)}
                        >
                            {({ handleChange, handleBlur, values, errors, touched, handleSubmit, setFieldValue, dirty, isValid }) => (
                                <AccessibleView>
                                    <FastField name="machineGroupId">
                                        {({ field, form }: any) => (
                                            <AccessibleView style={masterdataStyles.containerInput}>
                                                <CustomDropdownSingle
                                                    title="Machine Group"
                                                    labels="MGroupName"
                                                    values="MGroupID"
                                                    data={!isEditing ? machineGroup?.filter((v) => v.IsActive) : dropmachine || []}
                                                    selectedValue={field.value}
                                                    onValueChange={(value) => {
                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                    testId="machineGroupId-md"
                                                />
                                                {form.touched.machineGroupId && form.errors.machineGroupId ? (
                                                    <HelperText type="error" visible style={{ left: -10 }}>
                                                        {form.errors.machineGroupId}
                                                    </HelperText>
                                                ) : null}
                                            </AccessibleView>
                                        )}
                                    </FastField>

                                    <Inputs
                                        placeholder="Enter Machine Group Name"
                                        label="Machine Group Name"
                                        handleChange={handleChange("machineName")}
                                        handleBlur={handleBlur("machineName")}
                                        value={values.machineName}
                                        error={touched.machineName && Boolean(errors.machineName)}
                                        errorMessage={touched.machineName ? errors.machineName : ""}
                                        testId="machineName-md"
                                    />
                                    <Inputs
                                        placeholder="Enter Description"
                                        label="Description"
                                        handleChange={handleChange("description")}
                                        handleBlur={handleBlur("description")}
                                        value={values.description}
                                        error={touched.description && Boolean(errors.description)}
                                        errorMessage={touched.description ? errors.description : ""}
                                        testId="Description-md"
                                    />
                                    <AccessibleView style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            Status: {values.isActive ? "Active" : "Inactive"}
                                        </Text>
                                        <Switch
                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                            color={values.isActive ? colors.succeass : colors.disable}
                                            value={values.isActive}
                                            onValueChange={(v: boolean) => {
                                                setFieldValue("isActive", v);
                                            }}
                                            testID="isActive-md"
                                        />
                                    </AccessibleView>
                                    <AccessibleView style={masterdataStyles.containerAction}>
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