import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { ChecklistGroupDialogProps, InitialValuesGroupCheckList } from '@/typing/value'

const validationSchema = Yup.object().shape({
    groupCheckListOptionName: Yup.string().required(
        "The group check list option name field is required."
    ),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const Checklist_group_dialog = ({ isVisible, setIsVisible, isEditing, initialValues, saveData }: ChecklistGroupDialogProps<InitialValuesGroupCheckList>) => {
    const masterdataStyles = useMasterdataStyles()
    const { colors } = useTheme()
    console.log("Checklist_group_dialog");

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
                            validateOnBlur={false}
                            validateOnChange={true}
                            onSubmit={(values: InitialValuesGroupCheckList) => saveData(values)}
                        >
                            {({ handleChange, handleBlur, values, errors, touched, handleSubmit, setFieldValue, isValid, dirty }) => (
                                <AccessibleView name="form-cgd">
                                    <Inputs
                                        placeholder="Enter Group Check List"
                                        label="Group Check List Name"
                                        handleChange={handleChange("groupCheckListOptionName")}
                                        handleBlur={handleBlur("groupCheckListOptionName")}
                                        value={values.groupCheckListOptionName}
                                        error={touched.groupCheckListOptionName && Boolean(errors.groupCheckListOptionName)}
                                        errorMessage={touched.groupCheckListOptionName ? errors.groupCheckListOptionName : ""}
                                        testId="groupCheckListOptionName-cgd"
                                    />

                                    <Inputs
                                        placeholder="Enter Description"
                                        label="Description"
                                        handleChange={handleChange("description")}
                                        handleBlur={handleBlur("description")}
                                        value={values.description}
                                        error={touched.description && Boolean(errors.description)}
                                        errorMessage={touched.description ? errors.description : ""}
                                        testId="description-cgd"
                                    />

                                    <AccessibleView name="form-active-cgd" style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            Status: {values.isActive ? "Active" : "Inactive"}
                                        </Text>
                                        <Switch
                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                            color={values.isActive ? colors.succeass : colors.disable}
                                            value={values.isActive}
                                            onValueChange={(v: boolean) => { setFieldValue("isActive", v); }}
                                            testID="isActive-cgd"
                                        />
                                    </AccessibleView>
                                    <AccessibleView name="form-action-cgd" style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                isValid && dirty ? masterdataStyles.backMain : masterdataStyles.backDis,
                                            ]}
                                            testID="Save-cgd"
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Save</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-cgd">
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

export default React.memo(Checklist_group_dialog)