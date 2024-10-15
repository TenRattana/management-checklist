
import React from "react";
import { Pressable, Text } from "react-native";
import AccessibleView from "@/components/AccessibleView";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Portal, Dialog, HelperText } from "react-native-paper";
import { Formik, FastField } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { Users, GroupUsers } from '@/typing/type'
import { ManagepermissionDialogProps, InitialValuesManagepermission } from '@/typing/value'

const validationSchema = Yup.object().shape({
    UserName: Yup.string().required("This username field is required"),
    RoleID: Yup.string().required("This role field is required"),
    IsActive: Yup.boolean().required("This isactive field is required")
});


const Managepermisstion_dialog = ({ isVisible, setIsVisible, isEditing, initialValues, saveData, users, groupUser }: ManagepermissionDialogProps<InitialValuesManagepermission, Users, GroupUsers>) => {
    const masterdataStyles = useMasterdataStyles()
    // const { colors } = useTheme()
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
                            {({ handleSubmit, dirty, isValid }) => (
                                <AccessibleView name="form-managed">
                                    <FastField name="UserName">
                                        {({ field, form }: any) => (
                                            <CustomDropdownSingle
                                                title="User Name"
                                                labels="UserName"
                                                values="UserID"
                                                data={users}
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
                                                    form.setFieldValue(field.name, value.value);
                                                    setTimeout(() => {
                                                        form.setFieldTouched(field.name, true);
                                                    }, 0)
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

                                    <AccessibleView name="form-action-managed" style={masterdataStyles.containerAction}>
                                        <Pressable
                                            onPress={() => handleSubmit()}
                                            disabled={!isValid || !dirty}
                                            style={[
                                                masterdataStyles.button,
                                                isValid && dirty ? masterdataStyles.backMain : masterdataStyles.backDis,
                                            ]}
                                            testID="Save-managed"
                                        >
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>Save</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-managed">
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

export default React.memo(Managepermisstion_dialog)
