import React from "react";
import { Pressable } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Portal, Dialog, HelperText, useTheme } from "react-native-paper";
import { Formik, FastField } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { Form, Machine } from '@/typing/type'
import { MatchFormMachineDialogProps, InitialValuesMatchFormMachine } from '@/typing/value'
import Text from "@/components/Text";

const validationSchema = Yup.object().shape({
    machineId: Yup.string().required("This machine field is required"),
    formId: Yup.string().required("This form field is required"),
});


const Match_form_machine_dialog = ({ isVisible, setIsVisible, isEditing, initialValues, saveData, dropmachine, machine = [], forms = [], dropform }: MatchFormMachineDialogProps<InitialValuesMatchFormMachine, Machine, Form>) => {
    const masterdataStyles = useMasterdataStyles()
    // const { colors } = useTheme()
    console.log("Match_form_machine_dialog");
    console.log(isEditing);

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
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(values: InitialValuesMatchFormMachine) => saveData(values, isEditing)}
                        >
                            {({ handleSubmit, dirty, isValid }) => (
                                <AccessibleView name="form-mfmd">
                                    <FastField name="machineId">
                                        {({ field, form }: any) => (
                                            <CustomDropdownSingle
                                                title="Machine"
                                                labels="MachineName"
                                                values="MachineID"
                                                data={!isEditing
                                                    ? machine.filter((v) => v.IsActive) : dropmachine || []}
                                                value={field.value}
                                                handleChange={(value) => {
                                                    form.setFieldValue(field.name, value.value);
                                                    setTimeout(() => {
                                                        form.setFieldTouched(field.name, true);
                                                    }, 0)
                                                }}
                                                handleBlur={() => {
                                                    form.setFieldTouched(field.name, true);
                                                }}
                                                testId={`machineId-mfmd`}
                                                error={form.touched.machineId && Boolean(form.errors.machineId)}
                                                errorMessage={form.touched.machineId ? form.errors.machineId : ""}
                                            />
                                        )}
                                    </FastField>

                                    <FastField name="formId">
                                        {({ field, form }: any) => (
                                            <CustomDropdownSingle
                                                title="Form"
                                                labels="FormName"
                                                values="FormID"
                                                data={!isEditing
                                                    ? forms.filter((v) => v.IsActive) : dropform || []}
                                                value={field.value}
                                                handleChange={(value) => {
                                                    form.setFieldValue(field.name, value.value);
                                                    setTimeout(() => {
                                                        form.setFieldTouched(field.name, true);
                                                    }, 0)
                                                }}
                                                handleBlur={() => {
                                                    form.setFieldTouched(field.name, true);
                                                }}
                                                testId={`formId-mfmd`}
                                                error={form.touched.formId && Boolean(form.errors.formId)}
                                                errorMessage={form.touched.formId ? form.errors.formId : ""}
                                            />
                                        )}
                                    </FastField>

                                    <AccessibleView name="form-action-mfmd" style={masterdataStyles.containerAction}>
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