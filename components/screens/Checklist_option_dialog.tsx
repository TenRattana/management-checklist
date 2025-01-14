import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog, Icon } from "react-native-paper";
import { Field, Formik } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { InitialValuesCheckListOption, CheckListOptionProps } from '@/typing/value'
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import HeaderDialog from "./HeaderDialog";
import { useSelector } from "react-redux";

const validationSchema = Yup.object().shape({
    checkListOptionName: Yup.string().required(
        "The check list option name field is required."
    ),
    isActive: Yup.boolean().required("The active field is required."),
});

const Checklist_option_dialog = React.memo(({ isVisible, setIsVisible, isEditing, initialValues, saveData }: CheckListOptionProps<InitialValuesCheckListOption>) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()
    const { spacing } = useRes()
    const state = useSelector((state: any) => state.prefix);

    const styles = StyleSheet.create({
        button: {
            alignSelf: 'flex-end',
            paddingHorizontal: 20,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.drag,
            borderRadius: 4,
        },
        buttonSubmit: {
            backgroundColor: theme.colors.green,
            marginRight: 5,
            flexDirection: "row"
        },
        containerAction: {
            justifyContent: "flex-end",
            flexDirection: 'row',
            paddingTop: 10,
            paddingRight: 20
        }
    })

    return (
        <Portal>
            <Dialog
                visible={isVisible}
                onDismiss={() => setIsVisible(false)}
                style={masterdataStyles.containerDialog}
                testID="dialog-cod"
            >
                <Dialog.Content>
                    <HeaderDialog isEditing setIsVisible={() => setIsVisible(false)} display={state.CheckListOption} />

                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={false}
                            onSubmit={(values: InitialValuesCheckListOption) => saveData(values)}
                        >
                            {({ values, handleSubmit, setFieldValue, dirty, isValid }) => (
                                <View id="form-cod">

                                    <Field name="checkListOptionName">
                                        {({ field, form }: any) => (
                                            <>
                                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 20, paddingLeft: 10 }]}>
                                                    {`${state.CheckListOption} Name`}
                                                </Text>

                                                <Inputs
                                                    mode="outlined"
                                                    placeholder={`Enter ${state.CheckListOption} Option`}
                                                    label={state.CheckListOption}
                                                    handleChange={(value) => form.setFieldValue(field.name, value)}
                                                    handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                    value={field.value}
                                                    error={form.touched.checkListOptionName && Boolean(form.errors.checkListOptionName)}
                                                    errorMessage={form.touched.checkListOptionName ? form.errors.checkListOptionName : ""}
                                                    testId="checkListOptionName-cod"
                                                />
                                            </>
                                        )}
                                    </Field >

                                    <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 10, paddingLeft: 10 }]}>
                                        {`${state.CheckListOption} Status`}
                                    </Text>

                                    <View id="form-active-cod" style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            {values.isActive ? "Active" : "Inactive"}
                                        </Text>
                                        <Switch
                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                            color={values.disables ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                            value={values.isActive}
                                            disabled={Boolean(values.disables)}
                                            onValueChange={(v: boolean) => {
                                                setFieldValue("isActive", v);
                                            }}
                                            testID="isActive-cod"
                                        />
                                    </View>

                                    <View style={[masterdataStyles.containerAction, styles.containerAction]}>
                                        <TouchableOpacity
                                            onPress={() => handleSubmit()}
                                            style={[styles.button, styles.buttonSubmit]}
                                        >
                                            <Icon source="check" size={spacing.large} color={theme.colors.fff} />

                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                                {isEditing ? "Update" : "Add"}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => setIsVisible(false)}
                                            style={[styles.button, masterdataStyles.backMain, { marginLeft: 10, flexDirection: "row" }]}
                                        >
                                            <Icon source="close" size={spacing.large} color={theme.colors.fff} />

                                            <Text style={[masterdataStyles.text, masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
})

export default Checklist_option_dialog