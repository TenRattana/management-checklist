import React from "react";
import { Pressable, Text } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import { Inputs } from "@/components/common";
import { Portal, Dialog } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";

interface BaseSubForm {
    SFormID: string;
    SFormName: string;
    FormID: string;
    Columns?: number;
    DisplayOrder?: number;
    MachineID: string;
}

interface SubFormDialogProps {
    isVisible: boolean;
    setShowDialogs: () => void;
    editMode: boolean;
    subForm: BaseSubForm;
    saveSubForm: (values: BaseSubForm, mode: string) => void;
    onDelete: (SFormID: string) => void;
}

const validationSchemaSubForm = Yup.object().shape({
    SFormName: Yup.string().required(
        "The machine group name field is required."
    ),
    Columns: Yup.number().required("The columns field is required."),
});

const SubFormDialog: React.FC<SubFormDialogProps> = ({ isVisible, setShowDialogs, editMode, subForm, saveSubForm, onDelete }) => {

    const masterdataStyles = useMasterdataStyles()

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={setShowDialogs}>
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]}>
                    {editMode ? "Edit Subform Detail" : "Create Subform Detail"}
                </Dialog.Title>
                <Dialog.Content>
                    <Text
                        style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 10 }]}
                    >
                        {editMode
                            ? "Edit the details of the sub form."
                            : "Enter the details for the new sub form."}
                    </Text>
                    {isVisible && (
                        <Formik
                            initialValues={subForm}
                            validationSchema={validationSchemaSubForm}
                            validateOnBlur={false}
                            validateOnChange={true}
                            onSubmit={(values) => {
                                saveSubForm(values, editMode ? "update" : "add");
                            }}
                        >
                            {({ handleChange, handleBlur, values, errors, touched, handleSubmit, isValid, dirty, }) => (
                                <AccessibleView>

                                    <Inputs
                                        placeholder="Enter Sub Form Name"
                                        label="Sub Form Name"
                                        handleChange={handleChange("SFormName")}
                                        handleBlur={handleBlur("SFormName")}
                                        value={values.SFormName}
                                        error={touched.SFormName && Boolean(errors.SFormName)}
                                        errorMessage={touched.SFormName ? errors.SFormName : ""}
                                    />

                                    <Inputs
                                        placeholder="Enter Columns"
                                        label="Columns"
                                        handleChange={handleChange("Columns")}
                                        handleBlur={handleBlur("Columns")}
                                        value={String(values.Columns ?? "")}
                                        error={touched.Columns && Boolean(errors.Columns)}
                                        errorMessage={touched.Columns ? errors.Columns : ""}
                                    />

                                    <AccessibleView style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                isValid && dirty ? masterdataStyles.backMain : masterdataStyles.backDis,
                                            ]}
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>
                                                {editMode ? "Update SubForm" : "Add SubForm"}
                                            </Text>
                                        </Pressable>

                                        {editMode && (
                                            <Pressable
                                                onPress={() => onDelete(values.SFormID!)}
                                                style={[masterdataStyles.button, masterdataStyles.backMain]}
                                            >
                                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>
                                                    Delete sub form
                                                </Text>
                                            </Pressable>
                                        )}

                                        <Pressable
                                            onPress={setShowDialogs}
                                            style={[masterdataStyles.button, masterdataStyles.backMain]}
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>
                                                Cancel
                                            </Text>
                                        </Pressable>
                                    </AccessibleView>
                                </AccessibleView>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
};

export default SubFormDialog;
