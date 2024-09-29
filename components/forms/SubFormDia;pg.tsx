import React from "react";
import { View, Pressable } from "react-native";
import { Portal, Dialog, Text } from "react-native-paper";
import Inputs from "@/components/common/Inputs";
import { Formik } from "formik";
import * as Yup from "yup";

interface SubFormDialogProps {
    isVisible: boolean;
    setShowDialogs: () => void;
    styles: {
        containerDialog: object;
        textDark: object;
        containerButton: object;
        button: object;
        bwidth: object;
        backMain: object;
        backDis: object;
        textBold: object;
        text: object;
        textLight: object;
    };
    editMode: boolean;
    subForm: {
        subFormName: string;
        columns: number;
        subFormId?: string;
    };
    saveSubForm: (values: any, mode: string) => void;
    responsive: string;
    onDelete: (subFormId: string) => void;
}

const validationSchemaSubForm = Yup.object().shape({
    subFormName: Yup.string().required(
        "The machine group name field is required."
    ),
    columns: Yup.number().required("The columns field is required."),
});

const SubFormDialog: React.FC<SubFormDialogProps> = ({
    isVisible,
    setShowDialogs,
    editMode,
    subForm,
    saveSubForm,
    onDelete,
}) => {
    return (
        <Portal>
            <Dialog
                visible={isVisible}
                onDismiss={() => setShowDialogs()}
            >
                <Dialog.Title style={{ paddingLeft: 8 }}>
                    {editMode ? "Edit Subform Detail" : "Create Subform Detail"}
                </Dialog.Title>
                <Dialog.Content>
                    <Text
                        style={[{ marginBottom: 10, paddingLeft: 10 }]}
                    >
                        {editMode
                            ? "Edit the details of the sub form."
                            : "Enter the details for the new sub form."}
                    </Text>
                    <Formik
                        initialValues={subForm}
                        validationSchema={validationSchemaSubForm}
                        validateOnBlur={false}
                        validateOnChange={true}
                        onSubmit={(values) => {
                            saveSubForm(values, editMode ? "update" : "add");
                        }}
                    >
                        {({
                            handleChange,
                            handleBlur,
                            values,
                            errors,
                            touched,
                            handleSubmit,
                            isValid,
                            dirty,
                        }) => (
                            <View>
                                <Inputs
                                    placeholder="Enter Sub Form Name"
                                    label="Sub Form Name"
                                    handleChange={handleChange("subFormName")}
                                    handleBlur={() => handleBlur("subFormName")}
                                    value={values.subFormName}
                                    error={touched.subFormName && Boolean(errors.subFormName)}
                                    errorMessage={touched.subFormName ? errors.subFormName : ""}
                                />

                                <Inputs
                                    placeholder="Enter Columns"
                                    label="Columns"
                                    handleChange={handleChange("columns")}
                                    handleBlur={() => handleBlur("columns")}
                                    value={String(values.columns)}
                                    error={touched.columns && Boolean(errors.columns)}
                                    errorMessage={touched.columns ? errors.columns : ""}
                                />

                                <View

                                >
                                    <Pressable
                                        onPress={() => handleSubmit}
                                        disabled={!isValid || !dirty}
                                    >
                                        <Text

                                        >
                                            {editMode ? "Update SubForm" : "Add SubForm"}
                                        </Text>
                                    </Pressable>

                                    {editMode && (
                                        <Pressable
                                            onPress={() => onDelete(values.subFormId!)}
                                        >
                                            <Text
                                            >
                                                Delete sub form
                                            </Text>
                                        </Pressable>
                                    )}

                                    <Pressable
                                        onPress={() => setShowDialogs()}
                                    >
                                        <Text
                                        >
                                            Cancel
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </Formik>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
};

export default SubFormDialog;
