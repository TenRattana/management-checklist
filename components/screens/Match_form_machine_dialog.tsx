import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Portal, Switch, Dialog, HelperText } from "react-native-paper";
import { Formik, Field } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { Form, Machine } from '@/typing/type'
import { MatchFormMachineDialogProps, InitialValuesMatchFormMachine } from '@/typing/value'

const validationSchema = Yup.object().shape({
    machineId: Yup.string().required("This machine field is required"),
    formId: Yup.string().required("This form field is required"),
});


const Match_form_machine_dialog = ({ isVisible, setIsVisible, isEditing, initialValues, saveData, dropmachine, machine = [], forms = [], dropform }: MatchFormMachineDialogProps<InitialValuesMatchFormMachine, Machine, Form>) => {
    const masterdataStyles = useMasterdataStyles()
    const { colors } = useTheme()

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog} testID="dialog-mfmd">
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]} testID="dialog-title-mfmd">
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={false}
                            validateOnChange={true}
                            onSubmit={(values: InitialValuesMatchFormMachine) => saveData(values)}
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
                                                        ? machine.filter((v) => v.IsActive) : dropmachine || []}
                                                    selectedValue={field.value}
                                                    onValueChange={(value, icon) => {
                                                        console.log(value);

                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                    testId="machineId-mfmd"
                                                />
                                                {touched.machineId && errors.machineId && (
                                                    <HelperText type="error" visible={Boolean(touched.machineId && errors.machineId)} style={{ left: -10 }} testID="error-machineId-mfmd">
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
                                                        ? forms.filter((v) => v.IsActive) : dropform || []}
                                                    selectedValue={field.value}
                                                    onValueChange={(value, icon) => {
                                                        console.log(value);

                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                    testId="formId-mfmd"
                                                />
                                                {touched.formId && errors.formId && (
                                                    <HelperText type="error" visible={Boolean(touched.formId && errors.formId)} style={{ left: -10 }} testID="error-formId-mfmd">
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
                                            testID="Save-mfmd"
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Save</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-mfmd">
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

export default React.memo(Match_form_machine_dialog)