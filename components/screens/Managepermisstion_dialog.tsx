
import React from "react";
import { Pressable, View } from "react-native";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Portal, Dialog, Switch } from "react-native-paper";
import { Formik, FastField } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { Users, GroupUsers } from '@/typing/type'
import { ManagepermissionDialogProps, InitialValuesManagepermission } from '@/typing/value'
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts";

const validationSchema = Yup.object().shape({
    UserName: Yup.string().required("This user field is required"),
    GUserID: Yup.string().required("This role field is required"),
    IsActive: Yup.boolean().required("This isactive field is required")
});


const Managepermisstion_dialog = ({ isVisible, setIsVisible, isEditing, initialValues, saveData, users, groupUser }: ManagepermissionDialogProps<InitialValuesManagepermission, Users, GroupUsers>) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()
    console.log("Managepermisstion_dialog");

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog} testID="dialog-managed">
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]} testID="dialog-title-managed">
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(values: InitialValuesManagepermission) => saveData(values)}
                        >
                            {({ values, handleSubmit, dirty, isValid, setFieldValue }) => (
                                <View id="form-managed">
                                    <FastField name="UserName">
                                        {({ field, form }: any) => (
                                            <CustomDropdownSingle
                                                title="User Name"
                                                labels="UserName"
                                                values="UserName"
                                                data={users}
                                                value={field.value}
                                                handleChange={(value) => {
                                                    const stringValue = (value as { value: string }).value;
                                                    form.setFieldValue(field.name, stringValue);
                                                    setTimeout(() => {
                                                        form.setFieldTouched(field.name, true);
                                                    }, 0);
                                                }}
                                                handleBlur={() => {
                                                    form.setFieldTouched(field.name, true);
                                                }}
                                                testId={`UserName-managed`}
                                                error={form.touched.UserName && Boolean(form.errors.UserName)}
                                                errorMessage={form.touched.UserName ? form.errors.UserName : ""}
                                            />
                                        )}
                                    </FastField>

                                    <FastField name="GUserID">
                                        {({ field, form }: any) => (
                                            <CustomDropdownSingle
                                                title="Group User"
                                                labels="GUserName"
                                                values="GUserID"
                                                data={groupUser}
                                                value={field.value}
                                                handleChange={(value) => {
                                                    const stringValue = (value as { value: string }).value;
                                                    form.setFieldValue(field.name, stringValue);
                                                    setTimeout(() => {
                                                        form.setFieldTouched(field.name, true);
                                                    }, 0);
                                                }}
                                                handleBlur={() => {
                                                    form.setFieldTouched(field.name, true);
                                                }}
                                                testId={`GUserID-managed`}
                                                error={form.touched.GUserID && Boolean(form.errors.GUserID)}
                                                errorMessage={form.touched.GUserID ? form.errors.GUserID : ""}
                                            />
                                        )}
                                    </FastField>

                                    <View id="form-active-md" style={masterdataStyles.containerSwitch}>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                            Status: {values.IsActive ? "Active" : "Inactive"}
                                        </Text>
                                        <Switch
                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                            color={theme.colors.inversePrimary}
                                            value={values.IsActive}
                                            onValueChange={(v: boolean) => {
                                                setFieldValue("IsActive", v);
                                            }}
                                            testID="IsActive-managed"
                                        />
                                    </View>

                                    <View id="form-action-managed" style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                masterdataStyles.backMain,
                                                { opacity: isValid && dirty ? 1 : 0.5 }
                                            ]}
                                            testID="Save-managed"
                                        >
                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Save</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-managed">
                                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Cancel</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal >
    )
}

export default React.memo(Managepermisstion_dialog)
