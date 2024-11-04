import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import CustomDropdownSingle from "@/components/CustomDropdownSingle";
import { Inputs } from "@/components/common";
import { Portal, Switch, Dialog, TextInput } from "react-native-paper";
import { Formik, FastField } from "formik";
import * as Yup from 'yup'
import useMasterdataStyles from "@/styles/common/masterdata";
import { MachineDialogProps, InitialValuesMachine } from '@/typing/value'
import { GroupMachine } from '@/typing/type'
import Text from "@/components/Text";
import { useTheme } from "@/app/contexts";
import QRCode from "react-native-qrcode-svg";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Platform } from "react-native";

const validationSchema = Yup.object().shape({
    machineGroupId: Yup.string().required("The machine group field is required."),
    machineName: Yup.string().required("The machine name field is required."),
    description: Yup.string().required("The description field is required."),
    isActive: Yup.boolean().required("The active field is required."),
});

const Machine_dialog = ({ isVisible, setIsVisible, isEditing, initialValues, saveData, dropmachine, machineGroup = [] }: MachineDialogProps<InitialValuesMachine, GroupMachine>) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()
    console.log("Machine_dialog");

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={masterdataStyles.containerDialog} testID="dialog-md">
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
                            validateOnBlur={true}
                            validateOnChange={false}
                            onSubmit={(values: InitialValuesMachine) => saveData(values)}
                        >
                            {({ values, handleSubmit, setFieldValue, dirty, isValid }) => (
                                <View id="form-md" style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: values.machineId ? 1 : undefined }}>
                                        <ScrollView
                                            contentContainerStyle={{ marginTop: '10%', paddingBottom: 5, paddingHorizontal: 10 }}
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
                                            <FastField name="machineGroupId">
                                                {({ field, form }: any) => (
                                                    <CustomDropdownSingle
                                                        title="Machine Group"
                                                        labels="GMachineName"
                                                        values="GMachineID"
                                                        data={!isEditing ? machineGroup?.filter((v) => v.IsActive) : dropmachine || []}
                                                        value={field.value}
                                                        handleChange={(value) => {
                                                            const stringValue = (value as { value: string }).value;
                                                            form.setFieldValue(field.name, stringValue);
                                                            setTimeout(() => {
                                                                form.setFieldTouched(field.name, true);
                                                            }, 0);
                                                        }}
                                                        handleBlur={() => {
                                                            form.setFieldTouched(field.name, true);
                                                        }}
                                                        testId="machineGroupId-md"
                                                        error={form.touched.machineGroupId && Boolean(form.errors.machineGroupId)}
                                                        errorMessage={form.touched.machineGroupId ? form.errors.machineGroupId : ""}
                                                    />
                                                )}
                                            </FastField>

                                            <FastField name="machineName">
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
                                            </FastField >

                                            <FastField name="machineCode">
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
                                            </FastField>

                                            <FastField name="description">
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
                                            </FastField>

                                            <FastField name="building">
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
                                            </FastField>

                                            <FastField name="floor">
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
                                            </FastField>

                                            <FastField name="area">
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
                                            </FastField>


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
                                            <Pressable
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
                                            </Pressable>
                                            <Pressable onPress={() => setIsVisible(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-md">
                                                <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Cancel</Text>
                                            </Pressable>
                                        </View>
                                    </View>

                                </View>
                            )}
                        </Formik>
                    )}
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}

export default React.memo(Machine_dialog)