import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, ScrollView, View, StyleSheet } from "react-native";
import { Inputs, Dropdown } from "@/components/common";
import { Portal, Switch, Dialog, TextInput, HelperText } from "react-native-paper";
import { Formik, FastField, Field } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { MachineDialogProps, InitialValuesMachine } from '@/typing/value'
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import QRCode from "react-native-qrcode-svg";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Platform } from "react-native";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { fetchMachineGroups, fetchSearchMachineGroups } from "@/app/services";

const validationSchema = Yup.object().shape({
    machineGroupId: Yup.string().required("The group machine field is required."),
    machineCode: Yup.string().max(15, 'Machine code must not exceed 15 characters.'),
    machineName: Yup.string().required("The machine name field is required."),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The status field is required."),
});

const Machine_dialog = React.memo(({ isVisible, setIsVisible, isEditing, initialValues, saveData }: MachineDialogProps<InitialValuesMachine>) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()
    const { responsive } = useRes()

    const [open, setOpen] = useState(false);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [items, setItems] = useState<{ label: string; value: string }[]>([]);

    const { data, isFetching, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery(
        ['machineGroups', debouncedSearchQuery],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery
                ? fetchSearchMachineGroups(debouncedSearchQuery)
                : fetchMachineGroups(pageParam, 100);
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 100 ? allPages.length : undefined;
            },
            enabled: true,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat().filter((item) => !isEditing ? item.IsActive : item).map((item) => ({
                    label: item.GMachineName || 'Unknown',
                    value: item.GMachineID || '',
                }));

                setItems((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItems.filter((item) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            },
        }
    );

    const queryClient = useQueryClient();

    useEffect(() => {
        if (isEditing) {
            setDebouncedSearchQuery(initialValues.machineGroupName ?? "")
        } else {
            queryClient.invalidateQueries("machineGroups")
        }
    }, [isEditing, initialValues]);

    const handleScroll = ({ nativeEvent }: any) => {
        if (nativeEvent && nativeEvent?.contentSize) {
            const contentHeight = nativeEvent?.contentSize.height;
            const layoutHeight = nativeEvent?.layoutMeasurement.height;
            const offsetY = nativeEvent?.contentOffset.y;

            if (contentHeight - layoutHeight - offsetY <= 0 && hasNextPage && !isFetching) {
                fetchNextPage();
            }
        }
    };

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={[masterdataStyles.containerDialog, { width: responsive === "large" ? 1000 : "80%" }]} testID="dialog-md">
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { paddingLeft: 8 }]} testID="dialog-title-md">
                    {isEditing ? "Edit" : "Create"}
                </Dialog.Title>
                <Dialog.Content>
                    <Text
                        style={[masterdataStyles.text, { paddingLeft: 10 }]}
                    >
                        {isEditing ? "Edit the details of the machine." : "Enter the details for the new machine."}
                    </Text>
                    {isVisible && (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnBlur={false}
                            onSubmit={(values: InitialValuesMachine) => saveData(values)}
                        >
                            {({ values, handleSubmit, setFieldValue, dirty, isValid, touched, errors, setFieldTouched }) => {

                                const handelChange = (field: string, value: any) => {
                                    setFieldValue(field, value)
                                    setFieldTouched(field, true)
                                }

                                return (
                                    <View id="form-md" style={{ flexDirection: 'row' }}>
                                        <View style={{ flex: values.machineId ? 1 : undefined }}>
                                            <ScrollView
                                                contentContainerStyle={{ marginTop: '15%', paddingBottom: 5, paddingHorizontal: 10 }}
                                                showsVerticalScrollIndicator={false}
                                            >
                                                {values.machineId ? (
                                                    <View style={{ flexGrow: 1, alignItems: 'center' }}>
                                                        <QRCode
                                                            value={values.machineId || "No input"}
                                                            size={180}
                                                            color="black"
                                                            backgroundColor="white"
                                                            logoBorderRadius={5}
                                                            logoMargin={20}
                                                        />
                                                        <Text
                                                            style={[masterdataStyles.textQR, { marginVertical: 10 }]}
                                                        >
                                                            Scan this code for open form.
                                                        </Text>
                                                        <TextInput
                                                            mode="outlined"
                                                            value={values.machineId}
                                                            contentStyle={{ borderRadius: 10 }}
                                                            style={[masterdataStyles.text, { width: '70%', backgroundColor: theme.colors.background }]}
                                                        />
                                                    </View>
                                                ) : false}
                                            </ScrollView>
                                        </View>

                                        <View style={{ flex: 2, flexGrow: 2, maxHeight: hp(Platform.OS === "web" ? '50%' : '70&') }}>
                                            <ScrollView
                                                contentContainerStyle={{ paddingBottom: 5, paddingHorizontal: 10 }}
                                                showsVerticalScrollIndicator={false}
                                            >
                                                <Dropdown
                                                    label='group machine'
                                                    open={open}
                                                    setOpen={(v: boolean) => setOpen(v)}
                                                    selectedValue={values.machineGroupId}
                                                    searchQuery={debouncedSearchQuery}
                                                    setDebouncedSearchQuery={(value) => setDebouncedSearchQuery(value)}
                                                    items={items}
                                                    setSelectedValue={(stringValue: string | null) => {
                                                        setFieldValue("machineGroupId", stringValue);
                                                        setFieldTouched("machineGroupId", true);
                                                    }}
                                                    isFetching={isFetching}
                                                    fetchNextPage={fetchNextPage}
                                                    handleScroll={handleScroll}
                                                />

                                                <HelperText
                                                    type="error"
                                                    visible={Boolean(touched.machineGroupId && Boolean(errors.machineGroupId))}
                                                    style={[{ display: Boolean(touched.machineGroupId && Boolean(errors.machineGroupId)) ? 'flex' : 'none' }, masterdataStyles.errorText]}
                                                >
                                                    {touched.machineGroupId ? errors.machineGroupId : ""}
                                                </HelperText>

                                                <Field name="machineName">
                                                    {({ field, form }: any) => (
                                                        <Inputs
                                                            placeholder="Enter Machine Name"
                                                            label="Machine Name"
                                                            handleChange={(value) => form.setFieldValue(field.name, value)}
                                                            handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                            value={field.value}
                                                            error={form.touched.machineName && Boolean(form.errors.machineName)}
                                                            errorMessage={form.touched.machineName ? form.errors.machineName : ""}
                                                            testId="machineName-md"
                                                        />
                                                    )}
                                                </Field>

                                                <Field name="machineCode">
                                                    {({ field, form }: any) => (
                                                        <Inputs
                                                            placeholder="Enter machine Code"
                                                            label="Machine Code"
                                                            handleChange={(value) => form.setFieldValue(field.name, value)}
                                                            handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                            value={field.value}
                                                            error={form.touched.machineCode && Boolean(form.errors.machineCode)}
                                                            errorMessage={form.touched.machineCode ? form.errors.machineCode : ""}
                                                            testId="machineCode-md"
                                                        />
                                                    )}
                                                </Field>

                                                <Field name="description">
                                                    {({ field, form }: any) => (
                                                        <Inputs
                                                            placeholder="Enter Description"
                                                            label="Description"
                                                            handleChange={(value) => form.setFieldValue(field.name, value)}
                                                            handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                            value={field.value}
                                                            error={form.touched.description && Boolean(form.errors.description)}
                                                            errorMessage={form.touched.description ? form.errors.description : ""}
                                                            testId="description-md"
                                                        />
                                                    )}
                                                </Field>

                                                <Field name="building">
                                                    {({ field, form }: any) => (
                                                        <Inputs
                                                            placeholder="Enter Building"
                                                            label="Building"
                                                            handleChange={(value) => form.setFieldValue(field.name, value)}
                                                            handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                            value={field.value}
                                                            error={form.touched.building && Boolean(form.errors.building)}
                                                            errorMessage={form.touched.building ? form.errors.building : ""}
                                                            testId="building-md"
                                                        />
                                                    )}
                                                </Field>

                                                <Field name="floor">
                                                    {({ field, form }: any) => (
                                                        <Inputs
                                                            placeholder="Enter Floor"
                                                            label="Floor"
                                                            handleChange={(value) => form.setFieldValue(field.name, value)}
                                                            handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                            value={field.value}
                                                            error={form.touched.floor && Boolean(form.errors.floor)}
                                                            errorMessage={form.touched.floor ? form.errors.floor : ""}
                                                            testId="floor-md"
                                                        />
                                                    )}
                                                </Field>

                                                <Field name="area">
                                                    {({ field, form }: any) => (
                                                        <Inputs
                                                            placeholder="Enter Area"
                                                            label="Area"
                                                            handleChange={(value) => form.setFieldValue(field.name, value)}
                                                            handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                            value={field.value}
                                                            error={form.touched.area && Boolean(form.errors.area)}
                                                            errorMessage={form.touched.area ? form.errors.area : ""}
                                                            testId="area-md"
                                                        />
                                                    )}
                                                </Field>


                                                <View id="form-active-md" style={masterdataStyles.containerSwitch}>
                                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                                            Status: {values.isActive ? "Active" : "Inactive"}
                                                        </Text>
                                                        <Switch
                                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                            color={values.disables ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                                            disabled={Boolean(values.disables)}
                                                            value={values.isActive}
                                                            onValueChange={(v: boolean) => {
                                                                setFieldValue("isActive", v);
                                                            }}
                                                            testID="isActive-md"
                                                        />
                                                    </View>
                                                </View>

                                            </ScrollView>
                                            <View id="form-action-md" style={masterdataStyles.containerAction}>
                                                <TouchableOpacity
                                                    onPress={() => handleSubmit()}
                                                    disabled={!isValid || !dirty}
                                                    style={[
                                                        masterdataStyles.button,
                                                        masterdataStyles.backMain,
                                                        { opacity: isValid && dirty ? 1 : 0.5 }
                                                    ]}
                                                    testID="Save-md"
                                                >
                                                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Save</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-md">
                                                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Cancel</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                )
                            }}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
})

export default Machine_dialog