import React from "react";
import { Pressable, View } from "react-native";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog } from "react-native-paper";
import { FastField, Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { CheckListDialogProps, InitialValuesChecklist } from '@/typing/value'
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";

const validationSchema = Yup.object().shape({
    checkListName: Yup.string().required("Check list name is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const Checklist_dialog = React.memo(({ isVisible, setIsVisible, isEditing, initialValues, saveData }: CheckListDialogProps<InitialValuesChecklist>) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()

    return (
        <Portal>
            <Dialog
                visible={isVisible}
                onDismiss={() => setIsVisible(false)}
                style={masterdataStyles.containerDialog}
                testID="dialog-cd"
            >
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]} testID="dialog-title-cd">
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>
                    <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 10 }]}>
                        {isEditing
                            ? "Edit the details of the check list."
                            : "Enter the details for the new check list."}
                    </Text>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(values: InitialValuesChecklist) => saveData(values)}
                        >
                            {({ values, handleSubmit, setFieldValue, dirty, isValid }) => (
                                <View id="form-cd">

                                    <FastField name="checkListName">
                                        {({ field, form }: any) => (
                                            <Inputs
                                                placeholder="Enter Check List Name"
                                                label="Check List Name"
                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                value={field.value}
                                                error={form.touched.checkListName && Boolean(form.errors.checkListName)}
                                                errorMessage={form.touched.checkListName ? form.errors.checkListName : ""}
                                                testId="checkListName-cd"
                                            />
                                        )}
                                    </FastField >

                                    <View id="form-active-cd" style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            Status: {values.isActive ? "Active" : "Inactive"}
                                        </Text>
                                        <Switch
                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                            color={values.disables ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                            value={values.isActive}
                                            disabled={Boolean(values.disables)}
                                            onValueChange={(v: boolean) => {
                                                setFieldValue("isActive", v);
                                            }}
                                            testID="isActive-cd"
                                        />
                                    </View>
                                    <View id="form-action-cd" style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                masterdataStyles.backMain,
                                                { opacity: isValid && dirty ? 1 : 0.5 }
                                            ]}
                                            testID="Save-cd"
                                        >
                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>
                                                Save
                                            </Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-cd">
                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Cancel</Text>
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
})

export default Checklist_dialog