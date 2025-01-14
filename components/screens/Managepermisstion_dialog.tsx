
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Portal, Dialog, Switch, Icon } from "react-native-paper";
import { Formik, FastField } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { Users, GroupUsers } from '@/typing/type'
import { ManagepermissionDialogProps, InitialValuesManagepermission } from '@/typing/value'
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";
import { useSelector } from "react-redux";
import HeaderDialog from "./HeaderDialog";
import { useRes } from "@/app/contexts/useRes";

const validationSchema = Yup.object().shape({
    UserName: Yup.string().required("This user field is required"),
    GUserID: Yup.string().required("This role field is required"),
    IsActive: Yup.boolean().required("This isactive field is required")
});

const Managepermisstion_dialog = React.memo(({ isVisible, setIsVisible, isEditing, initialValues, saveData, users, groupUser }: ManagepermissionDialogProps<InitialValuesManagepermission, Users, GroupUsers>) => {
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
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog} testID="dialog-managed">
                <Dialog.Content>
                    <HeaderDialog isEditing setIsVisible={() => setIsVisible(false)} display={state.UsersPermission} />

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
        </Portal >
    )
})

export default Managepermisstion_dialog
