import { View } from 'react-native'
import React, { useState } from 'react'
import { InitialValuesCheckListOption } from '@/typing/value'
import { Icon, IconButton, Switch } from 'react-native-paper'
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler'
import useMasterdataStyles from '@/styles/common/masterdata'
import { FastField, Field, Formik } from 'formik'
import * as Yup from 'yup'
import { Inputs } from '../common'
import { useTheme } from '@/app/contexts/useTheme'
import Text from '../Text'
import { styles } from './Schedule'
import { useRes } from '@/app/contexts/useRes'

const validationSchema = Yup.object().shape({
    checkListOptionName: Yup.string().required(
        "The check list option name field is required."
    ),
    isActive: Yup.boolean().required("The active field is required."),
});

const CheckListOptionCreate_dialog = React.memo(({ setIsVisible, saveData }: { setIsVisible: () => void, saveData: any }) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()
    const { spacing } = useRes()

    const [initialValues] = useState<InitialValuesCheckListOption>({
        checkListOptionId: "",
        checkListOptionName: "",
        isActive: true,
        disables: false
    });

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <View style={{ justifyContent: "space-between", flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                    <Icon source="information-outline" size={spacing.large} color={theme.colors.green} />
                    <Text style={[masterdataStyles.text, masterdataStyles.title, masterdataStyles.textBold, { paddingLeft: 8 }]}>Create Check List</Text>
                </View>
                <IconButton icon="close" size={20} iconColor={theme.colors.black} onPress={() => setIsVisible()} />
            </View>

            <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 10 }]}>
                Enter the details for the new check list option.
            </Text>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnBlur={false}
                onSubmit={(values: InitialValuesCheckListOption) => saveData(values)}
            >
                {({ values, handleSubmit, setFieldValue }) => (
                    <>
                        <View id="form-cd">
                            <Field name="checkListOptionName">
                                {({ field, form }: any) => (
                                    <>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 20, paddingLeft: 10 }]}>
                                            Check List Option Name
                                        </Text>

                                        <Inputs
                                            mode='outlined'
                                            placeholder="Enter Check List Option"
                                            label="Check List Option"
                                            handleChange={(value) => form.setFieldValue(field.name, value)}
                                            handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                            value={field.value}
                                            error={form.touched.checkListOptionName && Boolean(form.errors.checkListOptionName)}
                                            errorMessage={form.touched.checkListOptionName ? form.errors.checkListOptionName : ""}
                                            testId="checkListOptionName-cod"
                                        />
                                    </>
                                )}
                            </Field>

                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 5, paddingLeft: 10 }]}>
                                Field Status
                            </Text>

                            <View id="form-active-cd" style={masterdataStyles.containerSwitch}>
                                <Text style={[masterdataStyles.text, masterdataStyles.textDark, { margin: 12 }]}>
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
                                    testID="isActive-cd"
                                />
                            </View>
                        </View>

                        <View style={[masterdataStyles.containerAction, { paddingVertical: 10, justifyContent: "flex-end" }]}>
                            <TouchableOpacity
                                onPress={() => handleSubmit()}
                                style={[styles.button, { backgroundColor: theme.colors.green, flexDirection: 'row' }]}
                            >
                                <Icon source="check" size={spacing.large} color={theme.colors.fff} />

                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                    Save
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setIsVisible()}
                                style={[masterdataStyles.backMain, styles.button, { marginLeft: 10, flexDirection: 'row' }]}
                            >
                                <Icon source="close" size={spacing.large} color={theme.colors.fff} />

                                <Text style={[masterdataStyles.text, masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </Formik>
        </GestureHandlerRootView>
    )
})

export default CheckListOptionCreate_dialog