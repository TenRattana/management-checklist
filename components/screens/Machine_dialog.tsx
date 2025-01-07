import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, ScrollView, View, StyleSheet } from "react-native";
import { Inputs, Dropdown } from "@/components/common";
import { Portal, Switch, Dialog, TextInput, HelperText, Icon, IconButton } from "react-native-paper";
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
    const { responsive, spacing } = useRes()

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
    })

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={[masterdataStyles.containerDialog, { width: responsive === "large" ? 1000 : "80%" }]} testID="dialog-md">
                <Dialog.Content>
                    <View style={{ justifyContent: "space-between", flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                            <Icon source="information-outline" size={spacing.large} color={theme.colors.green} />
                            <Text style={[masterdataStyles.text, masterdataStyles.title, masterdataStyles.textBold, { paddingLeft: 8 }]}>{isEditing ? "Edit" : "Create"}
                            </Text>
                        </View>
                        <IconButton icon="close" size={20} iconColor={theme.colors.onBackground} onPress={() => setIsVisible(false)} />
                    </View>

                    <Text
                        style={[
                            masterdataStyles.text,
                            masterdataStyles.textDark,
                            { marginBottom: 10, paddingLeft: 10 },
                        ]}
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
                                        {isEditing && (
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
                                        )}

                                        <View style={{ flex: 2, flexGrow: 2, maxHeight: hp(Platform.OS === "web" ? '50%' : '70&') }}>
                                            <ScrollView
                                                contentContainerStyle={{ paddingBottom: 5, paddingHorizontal: 10 }}
                                                showsVerticalScrollIndicator={false}
                                            >
                                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 20, paddingLeft: 10 }]}>
                                                    Group Machine
                                                </Text>

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
                                                        <>
                                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 3, paddingLeft: 10 }]}>
                                                                Machine Name
                                                            </Text>

                                                            <Inputs
                                                                mode="outlined"
                                                                placeholder="Enter Machine Name"
                                                                label="Machine Name"
                                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                                value={field.value}
                                                                error={form.touched.machineName && Boolean(form.errors.machineName)}
                                                                errorMessage={form.touched.machineName ? form.errors.machineName : ""}
                                                                testId="machineName-md"
                                                            />
                                                        </>

                                                    )}
                                                </Field>

                                                <Field name="machineCode">
                                                    {({ field, form }: any) => (
                                                        <>
                                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 3, paddingLeft: 10 }]}>
                                                                Machine Code
                                                            </Text>

                                                            <Inputs
                                                                mode="outlined"
                                                                placeholder="Enter machine Code"
                                                                label="Machine Code"
                                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                                value={field.value}
                                                                error={form.touched.machineCode && Boolean(form.errors.machineCode)}
                                                                errorMessage={form.touched.machineCode ? form.errors.machineCode : ""}
                                                                testId="machineCode-md"
                                                            />
                                                        </>
                                                    )}
                                                </Field>

                                                <Field name="description">
                                                    {({ field, form }: any) => (
                                                        <>
                                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 3, paddingLeft: 10 }]}>
                                                                Machine Description
                                                            </Text>

                                                            <Inputs
                                                                mode="outlined"
                                                                placeholder="Enter Description"
                                                                label="Description"
                                                                handleChange={(value) => form.setFieldValue(field.name, value)}
                                                                handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                                value={field.value}
                                                                error={form.touched.description && Boolean(form.errors.description)}
                                                                errorMessage={form.touched.description ? form.errors.description : ""}
                                                                testId="description-md"
                                                            />
                                                        </>
                                                    )}
                                                </Field>

                                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                                    <View style={{ flexDirection: 'column', flex: 2 }}>
                                                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 3, paddingLeft: 10 }]}>
                                                            Building
                                                        </Text>

                                                        <Field name="building">
                                                            {({ field, form }: any) => (
                                                                <Inputs
                                                                    mode="outlined"
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
                                                    </View>

                                                    <View style={{ flexDirection: 'column', flex: 2 }}>
                                                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 3, paddingLeft: 10 }]}>
                                                            Area
                                                        </Text>

                                                        <Field name="area">
                                                            {({ field, form }: any) => (
                                                                <Inputs
                                                                    mode="outlined"
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
                                                    </View>

                                                    <View style={{ flexDirection: 'column', flex: 1 }}>
                                                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 3, paddingLeft: 10 }]}>
                                                            Floor
                                                        </Text>
                                                        <Field name="floor">
                                                            {({ field, form }: any) => (
                                                                <Inputs
                                                                    mode="outlined"
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
                                                    </View>
                                                </View>

                                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 10, paddingLeft: 10 }]}>
                                                    Machine Status
                                                </Text>

                                                <View id="form-active-md" style={masterdataStyles.containerSwitch}>
                                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginHorizontal: 12 }]}>
                                                            {values.isActive ? "Active" : "Inactive"}
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

                                            <View style={[masterdataStyles.containerAction, { justifyContent: "flex-end", flexDirection: 'row', paddingTop: 10, paddingRight: 20 }]}>
                                                <TouchableOpacity
                                                    onPress={() => handleSubmit()}
                                                    style={[styles.button, { backgroundColor: theme.colors.green, marginRight: 5, flexDirection: "row" }]}
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