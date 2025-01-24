import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Icon, IconButton, Switch } from 'react-native-paper'
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler'
import useMasterdataStyles from '@/styles/common/masterdata'
import { FastField, Formik } from 'formik'
import * as Yup from 'yup'
import { Inputs } from '../common'
import { useTheme } from '@/app/contexts/useTheme'
import Text from '../Text'
import { useRes } from '@/app/contexts/useRes'

const validationSchema = Yup.object().shape({
    GUserName: Yup.string().required("Group user name is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const GroupUserCreate_dialog = React.memo(({ deleteF, setIsVisible, saveData, initialValues }: { setIsVisible: () => void, saveData: any, deleteF: (v: string) => void, initialValues: { GUserID?: string; GUserName: string; isActive: boolean; } }) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()
    const { spacing } = useRes()

    const styles = StyleSheet.create({
        containerAction: {
            flexDirection: 'row'
        },
        button: {
            marginRight: 5,
            flexDirection: "row",
            paddingVertical: 10,
            paddingHorizontal: 30,
            borderRadius: 4
        }
    })

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <View style={{ justifyContent: "space-between", flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                    <Icon source="information-outline" size={spacing.large} color={theme.colors.green} />
                    <Text style={[masterdataStyles.text, masterdataStyles.title, masterdataStyles.textBold, { paddingLeft: 8 }]}>Create Group User</Text>
                </View>
                <IconButton icon="close" size={20} iconColor={theme.colors.black} onPress={() => setIsVisible()} />
            </View>

            <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 10 }]}>
                Enter the details for the new group user.
            </Text>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnBlur={false}
                onSubmit={(values) => saveData(values)}
            >
                {({ values, handleSubmit, setFieldValue }) => (
                    <>
                        <View id="form-cd">
                            <FastField name="GUserName">
                                {({ field, form }: any) => (
                                    <>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 20, paddingLeft: 10 }]}>
                                            Group User Name
                                        </Text>

                                        <Inputs
                                            mode="outlined"
                                            placeholder="Enter Group User Name"
                                            label="Group User Name"
                                            handleChange={(value) => form.setFieldValue(field.name, value)}
                                            handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                            value={field.value}
                                            error={form.touched.GUserName && Boolean(form.errors.GUserName)}
                                            errorMessage={form.touched.GUserName ? form.errors.GUserName : ""}
                                            testId="GUserName-cd"
                                        />
                                    </>
                                )}
                            </FastField >

                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 5, paddingLeft: 10 }]}>
                                Field Status
                            </Text>

                            <View id="form-active-cd" style={masterdataStyles.containerSwitch}>
                                <Text style={[masterdataStyles.text, masterdataStyles.textDark, { margin: 10 }]}>
                                    {values.isActive ? "Active" : "Inactive"}
                                </Text>

                                <Switch
                                    style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                    color={theme.colors.inversePrimary}
                                    value={values.isActive}
                                    onValueChange={(v: boolean) => {
                                        setFieldValue("isActive", v);
                                    }}
                                    testID="isActive-cd"
                                />
                            </View>
                        </View>

                        <View style={[masterdataStyles.containerAction, { paddingVertical: 10, justifyContent: "space-between" }]}>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsVisible()
                                    deleteF(String(values.GUserID))
                                }}
                                style={[styles.button, { backgroundColor: theme.colors.error }]}
                            >
                                <Icon source="check" size={spacing.large} color={theme.colors.fff} />

                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                    Delete
                                </Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    onPress={() => handleSubmit()}
                                    style={[styles.button, { backgroundColor: theme.colors.green }]}
                                >
                                    <Icon source="check" size={spacing.large} color={theme.colors.fff} />

                                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                        Save
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setIsVisible()}
                                    style={[masterdataStyles.backMain, styles.button, { marginLeft: 10 }]}
                                >
                                    <Icon source="close" size={spacing.large} color={theme.colors.fff} />

                                    <Text style={[masterdataStyles.text, masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
            </Formik>
        </GestureHandlerRootView>
    )
})

export default GroupUserCreate_dialog