import { View } from 'react-native'
import React, { useState } from 'react'
import { CheckListOption } from '@/typing/type'
import { InitialValuesGroupCheckList } from '@/typing/value'
import { Dialog, Icon, Switch } from 'react-native-paper'
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler'
import useMasterdataStyles from '@/styles/common/masterdata'
import { FastField, Formik } from 'formik'
import * as Yup from 'yup'
import { Inputs } from '../common'
import { useTheme } from '@/app/contexts/useTheme'
import { styles } from './Schedule'
import Text from '../Text'
import CustomDropdownMultiple from '../CustomDropdownMultiple'
import { useRes } from '@/app/contexts/useRes'
import CheckListOptionCreate_dialog from './CheckListOptionCreate_dialog'

const validationSchema = Yup.object().shape({
    groupCheckListOptionName: Yup.string().required(
        "The group check list option name field is required."
    ),
    isActive: Yup.boolean().required("The active field is required."),
});

const GroupCreate_dialog = React.memo(({ setIsVisible, checkListOption, saveData, saveDataCheckListOption }:
    { setIsVisible: () => void, checkListOption: CheckListOption[], saveData: any, saveDataCheckListOption: any }) => {
    const masterdataStyles = useMasterdataStyles()
    const [options, setOptions] = useState<string[]>([])
    const [dialog, setDialog] = useState<boolean>(false)
    const { theme } = useTheme()
    const { spacing, responsive } = useRes()

    const [initialGroupCheckList] = useState({
        groupCheckListOptionId: "",
        groupCheckListOptionName: "",
        isActive: true,
        disables: false,
    });

    const MemoCheckListOptionCreate_dialog = React.memo(CheckListOptionCreate_dialog)

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
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View>
                                    <CustomDropdownMultiple
                                        data={checkListOption}
                                        handleBlur={() => { }}
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
                                </View>

                                <TouchableOpacity
                                    onPress={() => setDialog(true)}
                                    style={{
                                        alignItems: 'center',
                                        paddingRight: 5
                                    }}
                                >
                                    <Icon source={"plus-box"} size={spacing.large + 3} color={theme.colors.drag} />
                                </TouchableOpacity>
                            </View>

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

            <Dialog visible={dialog} style={{ zIndex: 3, width: responsive === "large" ? 500 : "60%", alignSelf: 'center', borderRadius: 8, padding: 20 }} onDismiss={() => setDialog(false)}>
                <MemoCheckListOptionCreate_dialog
                    setIsVisible={() => {
                        setDialog(false);
                    }}
                    saveData={(value: any) => {
                        saveDataCheckListOption(value);
                        setDialog(false);
                    }}
                />
            </Dialog>
        </GestureHandlerRootView>
    )
})

export default GroupCreate_dialog