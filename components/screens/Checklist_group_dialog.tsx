import React from "react";
import { Pressable, View } from "react-native";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog } from "react-native-paper";
import { FastField, Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { ChecklistGroupDialogProps, InitialValuesGroupCheckList } from '@/typing/value'
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts";

const validationSchema = Yup.object().shape({
    groupCheckListOptionName: Yup.string().required(
        "The group check list option name field is required."
    ),
    isActive: Yup.boolean().required("The active field is required."),
});

const Checklist_group_dialog = ({ isVisible, setIsVisible, isEditing, initialValues, saveData }: ChecklistGroupDialogProps<InitialValuesGroupCheckList>) => {
    const masterdataStyles = useMasterdataStyles()
    console.log("Checklist_group_dialog");
    const { theme } = useTheme()

    return (
        <Portal>
            <Dialog
                visible={isVisible}
                onDismiss={() => setIsVisible(false)}
                style={masterdataStyles.containerDialog}
                testID="dialog-cgd"
            >
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]} testID="dialog-title-cgd">
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>

                    <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 10 }]}>
                        {isEditing
                            ? "Edit the details of the group check list."
                            : "Enter the details for the new group check list."}
                    </Text>

                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(values: InitialValuesGroupCheckList) => saveData(values)}
                        >
                            {({ values, handleSubmit, setFieldValue, isValid, dirty }) => (
                                <View id="form-cgd">

                                    <FastField name="groupCheckListOptionName">
                                        {({ field, form }: any) => (
                                            <Inputs
                                                placeholder="Enter Group Check List"
                                                label="Group Check List Name"
                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                value={field.value}
                                                error={form.touched.groupCheckListOptionName && Boolean(form.errors.groupCheckListOptionName)}
                                                errorMessage={form.touched.groupCheckListOptionName ? form.errors.groupCheckListOptionName : ""}
                                                testId="groupCheckListOptionName-cgd"
                                            />
                                        )}
                                    </FastField >

                                    <View id="form-active-cgd" style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            Status: {values.isActive ? "Active" : "Inactive"}
                                        </Text>
                                        <Switch
                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                            color={values.disables ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                            value={values.isActive}
                                            disabled={Boolean(values.disables)}
                                            onValueChange={(v: boolean) => { setFieldValue("isActive", v); }}
                                            testID="isActive-cgd"
                                        />
                                    </View>
                                    <View id="form-action-cgd" style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                masterdataStyles.backMain,
                                                { opacity: isValid && dirty ? 1 : 0.5 }
                                            ]}
                                            testID="Save-cgd"
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Save</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-cgd">
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Cancel</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}

export default React.memo(Checklist_group_dialog)