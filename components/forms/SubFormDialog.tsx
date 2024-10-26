import React from "react";
import { Pressable, View } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import { Inputs } from "@/components/common";
import { Portal, Dialog } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import useMasterdataStyles from "@/styles/common/masterdata";
import { SubFormDialogProps } from "@/typing/value";
import { BaseSubForm } from "@/typing/form";
import Text from "@/components/Text";

const validationSchemaSubForm = Yup.object().shape({
    SFormName: Yup.string().required("The machine group name field is required."),
    Columns: Yup.number().required("The columns field is required."),
});

const SubFormDialog = ({
    isVisible,
    setIsVisible,
    isEditing,
    initialValues,
    saveData,
    onDelete,
}: SubFormDialogProps<BaseSubForm>) => {
    const masterdataStyles = useMasterdataStyles();
    console.log("SubFormDialog");

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog}>
                <Dialog.Title
                    style={[
                        masterdataStyles.text,
                        masterdataStyles.textBold,
                        { paddingLeft: 8 },
                    ]}
                >
                    {isEditing ? "Edit Subform Detail" : "Create Subform Detail"}
                </Dialog.Title>
                <Dialog.Content>
                    <Text
                        style={[
                            masterdataStyles.text,
                            masterdataStyles.textDark,
                            { marginBottom: 10, paddingLeft: 10 },
                        ]}
                    >
                        {isEditing
                            ? "Edit the details of the sub form."
                            : "Enter the details for the new sub form."}
                    </Text>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchemaSubForm}
                            validateOnBlur={false}
                            validateOnChange={true}
                            onSubmit={(values) => {
                                saveData(values, isEditing ? "update" : "add");
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
                                <View id="sfd">
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

                                    <View id="sfd-action" style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                isValid && dirty
                                                    ? masterdataStyles.backMain
                                                    : masterdataStyles.backDis,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    masterdataStyles.text,
                                                    masterdataStyles.textBold,
                                                    masterdataStyles.textLight,
                                                ]}
                                            >
                                                {isEditing ? "Update SubForm" : "Add SubForm"}
                                            </Text>
                                        </Pressable>

                                        {isEditing && (
                                            <Pressable
                                                onPress={() => onDelete(values.SFormID)}
                                                style={[
                                                    masterdataStyles.button,
                                                    masterdataStyles.backMain,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        masterdataStyles.text,
                                                        masterdataStyles.textBold,
                                                        masterdataStyles.textLight,
                                                    ]}
                                                >
                                                    Delete sub form
                                                </Text>
                                            </Pressable>
                                        )}

                                        <Pressable
                                            onPress={() => setIsVisible(false)}
                                            style={[
                                                masterdataStyles.button,
                                                masterdataStyles.backMain,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    masterdataStyles.text,
                                                    masterdataStyles.textBold,
                                                    masterdataStyles.textLight,
                                                ]}
                                            >
                                                Cancel
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
};

export default React.memo(SubFormDialog);
