import { View } from 'react-native'
import React, { useState } from 'react'
import { InitialValuesCheckListOption } from '@/typing/value'
import { Switch } from 'react-native-paper'
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler'
import useMasterdataStyles from '@/styles/common/masterdata'
import { FastField, Formik } from 'formik'
import * as Yup from 'yup'
import { Inputs } from '../common'
import { useTheme } from '@/app/contexts/useTheme'
import Text from '../Text'
import { styles } from './Schedule'

const validationSchema = Yup.object().shape({
    checkListOptionName: Yup.string().required(
        "The check list option name field is required."
    ),
    isActive: Yup.boolean().required("The active field is required."),
});

const CheckListOptionCreate_dialog = React.memo(({ setIsVisible, saveData }: { setIsVisible: () => void, saveData: any }) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()

    const [initialValues] = useState<InitialValuesCheckListOption>({
        checkListOptionId: "",
        checkListOptionName: "",
        isActive: true,
        disables: false
    });

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <Text>Create Check List</Text>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnBlur={true}
                validateOnChange={false}
                onSubmit={(values: InitialValuesCheckListOption) => saveData(values)}
            >
                {({ values, handleSubmit, setFieldValue }) => (
                    <View id="form-cd">

                        <FastField name="checkListOptionName">
                            {({ field, form }: any) => (
                                <Inputs
                                    placeholder="Enter Check List Option"
                                    label="Check List Option"
                                    handleChange={(value) => form.setFieldValue(field.name, value)}
                                    handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                    value={field.value}
                                    error={form.touched.checkListOptionName && Boolean(form.errors.checkListOptionName)}
                                    errorMessage={form.touched.checkListOptionName ? form.errors.checkListOptionName : ""}
                                    testId="checkListOptionName-cod"
                                />
                            )}
                        </FastField >

                        <View id="form-active-cd" style={masterdataStyles.containerSwitch}>
                            <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                Status: {values.isActive ? "Active" : "Inactive"}
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
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity onPress={() => handleSubmit()} style={styles.actionButton}>
                                <Text style={masterdataStyles.text}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsVisible()} style={styles.actionButton} testID="Cancel-cgd">
                                <Text style={masterdataStyles.text}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Formik>
        </GestureHandlerRootView>
    )
})

export default CheckListOptionCreate_dialog