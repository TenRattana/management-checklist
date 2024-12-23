import { View } from 'react-native'
import React, { useState } from 'react'
import { InitialValuesCheckListOption, InitialValuesGroupCheckList } from '@/typing/value'
import { Dialog, Icon, Portal, Switch } from 'react-native-paper'
import { GestureHandlerRootView, ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import useMasterdataStyles from '@/styles/common/masterdata'
import { FastField, Formik } from 'formik'
import * as Yup from 'yup'
import { DropdownMulti, Inputs } from '../common'
import { useTheme } from '@/app/contexts/useTheme'
import { styles } from './Schedule'
import Text from '../Text'
import { useRes } from '@/app/contexts/useRes'
import CheckListOptionCreate_dialog from './CheckListOptionCreate_dialog'
import { AccessibleView } from '..'

const validationSchema = Yup.object().shape({
    groupCheckListOptionName: Yup.string().required(
        "The group check list option name field is required."
    ),
    isActive: Yup.boolean().required("The active field is required."),
});

const GroupCreate_dialog = React.memo(({ setIsVisible, saveData, saveDataCheckListOption, isFetching, fetchNextPage, handleScroll, debouncedSearchQuery, setDebouncedSearchQuery, itemsCLO }:
    {
        setIsVisible: () => void, saveData: any, saveDataCheckListOption: (values: InitialValuesCheckListOption) => Promise<void>, isFetching: boolean, fetchNextPage?: (() => void) | undefined,
        handleScroll: ({ nativeEvent }: any) => void, debouncedSearchQuery: string, setDebouncedSearchQuery: (value: string) => void, itemsCLO: any[]
    }) => {
    const masterdataStyles = useMasterdataStyles()
    const [options, setOptions] = useState<string[]>([])
    const [dialog, setDialog] = useState<boolean>(false)
    const { theme } = useTheme()
    const { spacing, responsive } = useRes()
    const [open, setOpen] = useState<boolean>(false);
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

                        <View id="form-ac-cgd" style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                                <DropdownMulti
                                    label='Check List Type'
                                    open={open}
                                    setOpen={setOpen}
                                    searchQuery={debouncedSearchQuery}
                                    setDebouncedSearchQuery={setDebouncedSearchQuery}
                                    items={itemsCLO}
                                    isFetching={isFetching}
                                    fetchNextPage={fetchNextPage}
                                    handleScroll={handleScroll}
                                    selectedValue={options}
                                    setSelectedValue={(selectedValues) => {
                                        let option: string[]
                                        if (options.includes(selectedValues as string)) {
                                            option = options.filter((id) => id !== selectedValues);
                                        } else {
                                            option = selectedValues as string[];
                                        }
                                        setOptions(option);
                                    }}
                                />
                            </View>

                            <View>
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

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 10 }}>
                                {options.length > 0 && options.map((item, index) => (
                                    <TouchableOpacity onPress={() => {
                                        setOptions(options.filter((id) => id !== item))
                                    }} key={index}>
                                        <AccessibleView name="container-renderSelect" style={masterdataStyles.selectedStyle}>
                                            <Text style={[masterdataStyles.text, masterdataStyles.textDark]}>{itemsCLO.find((v) => v.CLOptionID === item)?.CLOptionName}</Text>
                                        </AccessibleView>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

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

            <Portal>
                <Dialog visible={dialog} style={{ zIndex: 5, width: "50%", alignSelf: 'center', borderRadius: 8, padding: 20 }} onDismiss={() => setDialog(false)}>
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
            </Portal>

        </GestureHandlerRootView>
    )
})

export default GroupCreate_dialog