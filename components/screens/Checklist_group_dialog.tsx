import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";

interface InitialValues {
    groupCheckListOptionId: string;
    groupCheckListOptionName: string;
    description: string;
    isActive: boolean;
}

interface Checklist_group_dialogProps {
    isVisible: boolean;
    setIsVisible: (v: boolean) => void;
    isEditing: boolean;
    initialValues: InitialValues;
    saveData: (values: InitialValues) => void;
}

const validationSchema = Yup.object().shape({
    groupCheckListOptionName: Yup.string().required(
        "The group check list option name field is required."
    ),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const Checklist_group_dialog: React.FC<Checklist_group_dialogProps> = ({ isVisible, setIsVisible, isEditing, initialValues, saveData }) => {

    const masterdataStyles = useMasterdataStyles()
    const { colors } = useTheme()

    return (
        <Portal>
            <Dialog
                visible={isVisible}
                onDismiss={() => setIsVisible(false)}
                style={masterdataStyles.containerDialog}
            >
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]}>
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
                            onSubmit={saveData}
                        >
                            {({ handleChange, handleBlur, values, errors, touched, handleSubmit, setFieldValue, isValid, dirty }) => (
                                <AccessibleView>
                                    <Inputs
                                        placeholder="Enter Group Check List"
                                        label="Group Check List Name"
                                        handleChange={handleChange("groupCheckListOptionName")}
                                        handleBlur={handleBlur("groupCheckListOptionName")}
                                        value={values.groupCheckListOptionName}
                                        error={touched.groupCheckListOptionName && Boolean(errors.groupCheckListOptionName)}
                                        errorMessage={touched.groupCheckListOptionName ? errors.groupCheckListOptionName : ""}
                                    />

                                    <Inputs
                                        placeholder="Enter Description"
                                        label="Description"
                                        handleChange={handleChange("description")}
                                        handleBlur={handleBlur("description")}
                                        value={values.description}
                                        error={touched.description && Boolean(errors.description)}
                                        errorMessage={touched.description ? errors.description : ""}
                                    />

                                    <AccessibleView style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            Status: {values.isActive ? "Active" : "Inactive"}
                                        </Text>
                                        <Switch
                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                            color={values.isActive ? colors.succeass : colors.disable}
                                            value={values.isActive}
                                            onValueChange={(v: boolean) => { setFieldValue("isActive", v); }}
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
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Save</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]}>
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

export default Checklist_group_dialog