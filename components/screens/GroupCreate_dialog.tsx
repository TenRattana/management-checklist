import { Platform, View } from 'react-native'
import React, { useState } from 'react'
import { Dialog, Icon, IconButton, Portal, Switch } from 'react-native-paper'
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
import { InitialValuesGroupCheckList } from '@/typing/screens/GroupCheckList'
import { InitialValuesCheckListOption } from '@/typing/screens/CheckListOption'

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
            <View style={{ justifyContent: "space-between", flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                    <Icon source="information-outline" size={spacing.large} color={theme.colors.green} />
                    <Text style={[masterdataStyles.text, masterdataStyles.title, masterdataStyles.textBold, { paddingLeft: 8 }]}>Create Group Check List Option & Option Detail</Text>
                </View>
                <IconButton icon="close" size={20} iconColor={theme.colors.black} onPress={() => setIsVisible()} />
            </View>

            <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginBottom: 10, paddingLeft: 10 }]}>
                Enter the details for the new group check list.
            </Text>

            <Formik
                initialValues={initialGroupCheckList}
                validationSchema={validationSchema}
                validateOnBlur={true}
                validateOnChange={false}
                onSubmit={(values: InitialValuesGroupCheckList) => saveData(values, options)}
            >
                {({ values, handleSubmit, setFieldValue, isValid, dirty }) => (
                    <>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={{ maxHeight: Platform.OS === "web" ? 330 : '58%' }}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled={true}
                        >
                            <FastField name="groupCheckListOptionName">
                                {({ field, form }: any) => (
                                    <>
                                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 20, paddingLeft: 10 }]}>
                                            Group Check List Name
                                        </Text>

                                        <Inputs
                                            mode='outlined'
                                            placeholder="Enter Group Check List"
                                            label="Group Check List Name"
                                            handleChange={(value) => form.setFieldValue(field.name, value)}
                                            handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                            value={field.value}
                                            error={form.touched.groupCheckListOptionName && Boolean(form.errors.groupCheckListOptionName)}
                                            errorMessage={form.touched.groupCheckListOptionName ? form.errors.groupCheckListOptionName : ""}
                                            testId="groupCheckListOptionName-cgd"
                                        />
                                    </>
                                )}
                            </FastField >

                            <View id="form-ac-cgd" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 5, paddingLeft: 10 }]}>
                                        Check List Option
                                    </Text>

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
                            </View>

                            <TouchableOpacity
                                onPress={() => setDialog(true)}
                                style={styles.button}
                            >
                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>
                                    Add Check List Option
                                </Text>
                            </TouchableOpacity>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 10 }}>
                                    {options.length > 0 && options.map((item, index) => (
                                        <TouchableOpacity onPress={() => {
                                            setOptions(options.filter((id) => id !== item))
                                        }} key={index}>
                                            <View style={[masterdataStyles.selectedStyle]}>
                                                <Text style={masterdataStyles.textFFF}>{itemsCLO.find((v) => v.CLOptionID === item)?.CLOptionName}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>

                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 5, paddingLeft: 10 }]}>
                                Field Status
                            </Text>

                            <View id="form-active-cgd" style={masterdataStyles.containerSwitch}>
                                <Text style={[masterdataStyles.text, masterdataStyles.textDark, { margin: 10 }]}>
                                    {values.isActive ? "Active" : "Inactive"}
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
                        </ScrollView>

                        <View style={[masterdataStyles.containerAction, { paddingTop: 10, justifyContent: "flex-end" }]}>
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

            {dialog && (
                <Portal>
                    <Dialog visible={dialog} style={{ zIndex: 5, width: "50%", alignSelf: 'center', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: theme.colors.background }} onDismiss={() => setDialog(false)}>
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
            )}

        </GestureHandlerRootView >
    )
})

export default GroupCreate_dialog