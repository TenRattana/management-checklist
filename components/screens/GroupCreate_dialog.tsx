import { FlatList, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { CheckListOption } from '@/typing/type'
import { InitialValuesCheckListOption, InitialValuesGroupCheckList } from '@/typing/value'
import { Button, Dialog, Menu, Switch } from 'react-native-paper'
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler'
import useMasterdataStyles from '@/styles/common/masterdata'
import { FastField, Formik } from 'formik'
import * as Yup from 'yup'
import { Inputs } from '../common'
import { useTheme } from '@/app/contexts/useTheme'
import { styles } from './Schedule'
import Text from '../Text'
import CustomDropdownMultiple from '../CustomDropdownMultiple'

const validationSchema = Yup.object().shape({
    groupCheckListOptionName: Yup.string().required(
        "The group check list option name field is required."
    ),
    isActive: Yup.boolean().required("The active field is required."),
});

const GroupCreate_dialog = React.memo(({ setIsVisible, checkListOption, saveData }:
    { setIsVisible: () => void, checkListOption: CheckListOption[], saveData: any }) => {
    const masterdataStyles = useMasterdataStyles()
    const [options, setOptions] = useState<string[]>([])
    const { theme } = useTheme()

    const [initialGroupCheckList] = useState({
        groupCheckListOptionId: "",
        groupCheckListOptionName: "",
        isActive: true,
        disables: false,
    });

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <Text>Create Group Check List Option & Option Detail</Text>

            <Formik
                initialValues={initialGroupCheckList}
                validationSchema={validationSchema}
                validateOnBlur={true}
                validateOnChange={false}
                onSubmit={(values: InitialValuesGroupCheckList) => saveData(values, options)}
            >
                {({ values, handleSubmit, setFieldValue, isValid, dirty }) => (
                    <View id="form-cgd">

                        <FastField name="groupCheckListOptionName">
                            {({ field, form }: any) => (
                                <Inputs
                                    placeholder="Enter Group Check List"
                                    label="Group Check List Name"
                                    handleChange={(value) => form.setFieldValue(field.name, value)}
                                    handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                    value={field.value}
                                    error={form.touched.groupCheckListOptionName && Boolean(form.errors.groupCheckListOptionName)}
                                    errorMessage={form.touched.groupCheckListOptionName ? form.errors.groupCheckListOptionName : ""}
                                    testId="groupCheckListOptionName-cgd"
                                />
                            )}
                        </FastField >

                        <View id="form-active-cgd" style={masterdataStyles.containerSwitch}>
                            <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                Status: {values.isActive ? "Active" : "Inactive"}
                            </Text>
                            <Switch
                                style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                color={values.disables ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                value={values.isActive}
                                disabled={Boolean(values.disables)}
                                onValueChange={(v: boolean) => { setFieldValue("isActive", v); }}
                                testID="isActive-cgd"
                            />
                        </View>

                        <View style={styles.timeIntervalMenu}>
                            <CustomDropdownMultiple
                                data={checkListOption}
                                handleBlur={() => {}}
                                handleChange={(selectedValues) => {
                                    let option
                                    if (options.includes(selectedValues)) {
                                        option = options.filter((id) => id !== selectedValues);
                                    } else {
                                        option = selectedValues;
                                    }
                                    setOptions(option);
                                }}
                                labels='CLOptionName'
                                title='Select Check List Option'
                                value={options}
                                values='CLOptionID'
                            />
                            {/* <Menu
                                visible={showTimeIntervalMenu}
                                onDismiss={() => {
                                    setShowTimeIntervalMenu(false)
                                }}
                                style={{ marginTop: 50 }}
                                anchor={<Button
                                    mode="outlined"
                                    style={styles.timeButton}
                                    onPress={() => setShowTimeIntervalMenu(true)}
                                >
                                    <Text style={masterdataStyles.timeText}>{'Select Reange Schedule'}</Text>
                                </Button>}
                            >
                                {checkListOption.map((interval, index) => (
                                    <Menu.Item
                                        style={styles.menuItem}
                                        key={index}
                                        onPress={() => {
                                            let option
                                            if (options.includes(interval.CLOptionID)) {
                                                option = options.filter((id) => id !== interval.CLOptionID);
                                            } else {
                                                option = [...options, interval.CLOptionID];
                                            }
                                            setOptions(option);
                                        }}
                                        title={`${options.includes(interval.CLOptionID) ? "✔ " : ""}${interval.CLOptionName}`}
                                    />
                                ))}
                            </Menu> */}
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

export default GroupCreate_dialog