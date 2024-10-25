import React from "react";
import { Pressable } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog, useTheme } from "react-native-paper";
import { FastField, Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { CheckListDialogProps, InitialValuesChecklist } from '@/typing/value'
import Text from "@/components/Text";

const validationSchema = Yup.object().shape({
    checkListName: Yup.string().required("Check list name is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const Checklist_dialog = ({ isVisible, setIsVisible, isEditing, initialValues, saveData }: CheckListDialogProps<InitialValuesChecklist>) => {
    const masterdataStyles = useMasterdataStyles()
    // const { colors } = useTheme()
    console.log("Checklist_dialog");

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
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(values: InitialValuesChecklist) => saveData(values)}
                        >
                            {({ values, handleSubmit, setFieldValue, dirty, isValid }) => (
                                <AccessibleView name="form-cd">

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

                                    <AccessibleView name="form-active-cd" style={masterdataStyles.containerSwitch}>
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
                                            testID="isActive-cd"
                                        />
                                    </AccessibleView>
                                    <AccessibleView name="form-action-cd" style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                isValid && dirty ? masterdataStyles.backMain : masterdataStyles.backDis,
                                            ]}
                                            testID="Save-cd"
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>
                                                Save
                                            </Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-cd">
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

export default React.memo(Checklist_dialog)