import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "@/app/contexts";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Portal, Dialog, HelperText } from "react-native-paper";
import { Formik, FastField } from "formik";
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
    console.log("Match_form_machine_dialog");

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
                            {({ handleSubmit, dirty, isValid }) => (
                                <AccessibleView name="form-mfmd">
                                    <FastField name="machineId">
                                        {({ field, form }: any) => (
                                            <AccessibleView name="form-machineId" style={masterdataStyles.containerInput}>
                                                <CustomDropdownSingle
                                                    title="Machine"
                                                    labels="MachineName"
                                                    values="MachineID"
                                                    data={!isEditing
                                                        ? machine.filter((v) => v.IsActive) : dropmachine || []}
                                                    selectedValue={field.value}
                                                    onValueChange={(value) => {
                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                    testId={`machineId-mfmd`}
                                                />
                                                {form.touched.machineId && form.errors.machineId ? (
                                                    <HelperText type="error" visible style={{ left: -10 }}>
                                                        {form.errors.machineId}
                                                    </HelperText>
                                                ) : null}
                                            </AccessibleView>
                                        )}
                                    </FastField>

                                    <FastField name="formId">
                                        {({ field, form }: any) => (
                                            <AccessibleView name="form-formId" style={masterdataStyles.containerInput}>
                                                <CustomDropdownSingle
                                                    title="Form"
                                                    labels="FormName"
                                                    values="FormID"
                                                    data={!isEditing
                                                        ? forms.filter((v) => v.IsActive) : dropform || []}
                                                    selectedValue={field.value}
                                                    onValueChange={(value) => {
                                                        form.setFieldValue(field.name, value);
                                                        form.setTouched({ ...form.touched, [field.name]: true });
                                                    }}
                                                    testId={`formId-mfmd`}
                                                />
                                                {form.touched.formId && form.errors.formId ? (
                                                    <HelperText type="error" visible style={{ left: -10 }}>
                                                        {form.errors.formId}
                                                    </HelperText>
                                                ) : null}
                                            </AccessibleView>
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