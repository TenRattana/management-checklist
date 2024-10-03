import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Portal, Switch, Dialog, HelperText } from "react-native-paper";
import { Formik, Field } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";

const validationSchema = Yup.object().shape({
    machineId: Yup.string().required("This machine field is required"),
    formId: Yup.string().required("This form field is required"),
});

interface InitialValues {
    machineId: string;
    formId: string;
}

interface Machine {
    MachineID: string;
    MachineName: string;
    IsActive: boolean;
}

interface Form {
    FormID: string;
    FormName: string;
    IsActive: boolean;
}

interface Match_form_machine_dialogProps {
    isVisible: boolean;
    setIsVisible: (v: boolean) => void;
    isEditing: boolean;
    initialValues: InitialValues;
    saveData: (values: InitialValues) => void;
    machine: Machine[];
    dropmachine: Machine[];
    forms: Form[];
    dropform: Form[];
}

const Match_form_machine_dialog: React.FC<Match_form_machine_dialogProps> = ({ isVisible, setIsVisible, isEditing, initialValues, saveData, dropmachine, machine, forms, dropform }) => {

    const masterdataStyles = useMasterdataStyles()
    const { colors } = useTheme()

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog}>
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]}>
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={false}
                            validateOnChange={true}
                            onSubmit={saveData}
                        >
                            {({ handleChange, handleBlur, values, errors, touched, handleSubmit, setFieldValue, dirty, isValid }) => (
                                <AccessibleView>
                                    <Field
                                        name="machineId"
                                        component={({ field, form }: any) => (
                                            <AccessibleView style={masterdataStyles.containerInput}>
                                                <CustomDropdownSingle
                                                    title="Machine"
                                                    labels="MachineName"
                                                    values="MachineID"
                                                    data={!isEditing
                                                        ? machine.filter((v) => v.IsActive) : dropmachine}
                                                    selectedValue={field.value}
                                                    onValueChange={(value, icon) => {
                                                        console.log(value);

                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                />
                                                {touched.machineId && errors.machineId && (
                                                    <HelperText type="error" visible={Boolean(touched.machineId && errors.machineId)} style={{ left: -10 }}>
                                                        {errors.machineId}
                                                    </HelperText>
                                                )}
                                            </AccessibleView>
                                        )}
                                    />

                                    <Field
                                        name="formId"
                                        component={({ field, form }: any) => (
                                            <AccessibleView style={masterdataStyles.containerInput}>
                                                <CustomDropdownSingle
                                                    title="Form"
                                                    labels="FormName"
                                                    values="FormID"
                                                    data={!isEditing
                                                        ? forms.filter((v) => v.IsActive) : dropform}
                                                    selectedValue={field.value}
                                                    onValueChange={(value, icon) => {
                                                        console.log(value);

                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                />
                                                {touched.formId && errors.formId && (
                                                    <HelperText type="error" visible={Boolean(touched.formId && errors.formId)} style={{ left: -10 }}>
                                                        {errors.formId}
                                                    </HelperText>
                                                )}
                                            </AccessibleView>
                                        )}
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

export default Match_form_machine_dialog