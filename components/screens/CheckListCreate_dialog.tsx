import { View } from 'react-native'
import React from 'react'
import { InitialValuesChecklist } from '@/typing/value'
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
    checkListName: Yup.string().required("Check list name is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const CheckListCreate_dialog = React.memo(({ setIsVisible, initialValues, saveData }: { setIsVisible: () => void, initialValues: InitialValuesChecklist, saveData: any }) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <Text>Create Check List</Text>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnBlur={true}
                validateOnChange={false}
                onSubmit={(values: InitialValuesChecklist) => saveData(values)}
            >
                {({ values, handleSubmit, setFieldValue }) => (
                    <View id="form-cd">

                        <FastField name="checkListName">
                            {({ field, form }: any) => (
                                <Inputs
                                    placeholder="Enter Check List Name"
                                    label="Check List Name"
                                    handleChange={(value) => form.setFieldValue(field.name, value)}
                                    handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                    value={field.value}
                                    error={form.touched.checkListName && Boolean(form.errors.checkListName)}
                                    errorMessage={form.touched.checkListName ? form.errors.checkListName : ""}
                                    testId="checkListName-cd"
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

export default CheckListCreate_dialog