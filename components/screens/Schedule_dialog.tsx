import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Button, Dialog, Portal, Menu, Switch } from 'react-native-paper';
import { Inputs } from '../common';
import { GroupMachine, TimeSchedule } from '@/typing/type';
import { useToast } from '@/app/contexts/useToast';
import { FastField, Formik } from 'formik';
import * as Yup from 'yup'
import CustomDropdownSingle from '../CustomDropdownSingle';
import axiosInstance from '@/config/axios';
import { useQuery } from 'react-query';
import {
    runOnJS,
} from 'react-native-reanimated';
import Daily_dialog from './Daily_dialog';
import Week_dialog from './Week_dialog';
import InfoSchedule_dialog from './InfoSchedule_dialog';
import { styles } from './Schedule';
import Custom_schedule_dialog from './Custom_schedule_dialog';

const { height } = Dimensions.get('window');

const fetchMachineGroups = async (): Promise<GroupMachine[]> => {
    const response = await axiosInstance.post("GroupMachine_service.asmx/GetGroupMachines");
    return response.data.data ?? [];
};

interface ScheduleDialogProps {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    timeSchedule: TimeSchedule[];
    saveData: (values: any) => void;
    initialValues: {
        ScheduleName: string,
        MachineGroup: string;
        timeSlots: { start: string | null, end: string | null }[];
        timeCustom: { start: string | null, end: string | null }[];
        timeWeek: { [key: string]: { start: string | null, end: string | null }[] }
    };
    isEditing: boolean;
}

const ScheduleDialog = React.memo(({ isVisible, setIsVisible, timeSchedule, saveData, initialValues, isEditing }: ScheduleDialogProps) => {
    const { theme } = useTheme();
    const { spacing, responsive } = useRes();
    const { showError, showSuccess } = useToast()
    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ custom: boolean, time: boolean, week: boolean }>({ custom: false, time: false, week: false });
    const masterdataStyles = useMasterdataStyles();
    const [point, setPoint] = useState(false)
    const [showThirDialog, setShowThirDialog] = useState(false)
    const [shouldCustom, setShouldCustom] = useState<boolean | "">("")
    const [shouldRenderTime, setShouldRenderTime] = useState<string>("")
    const [IndexThirDialo, setIndexThirDialog] = useState("")

    useEffect(() => {
        if (!isVisible) {
            setPoint(false)
            setShouldCustom("")
            setShouldRenderTime("")
        }
    }, [isVisible])

    const validationSchema = Yup.object().shape({
        ScheduleName: Yup.string().required('Schedule name is required'),
    });

    const { data: machineGroups = [] } = useQuery<GroupMachine[], Error>(
        'machineGroups',
        fetchMachineGroups,
        {
            refetchOnWindowFocus: true,
        }
    );

    return (
        <Portal>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnBlur={true}
                validateOnChange={false}
                onSubmit={(values) => saveData(values)}
            >
                {({ values, handleSubmit, setFieldValue, dirty, isValid }) => {
                    return (
                        <>
                            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={styles.container}>
                                <Dialog.Title style={{ marginLeft: 30 }}>{isEditing ? "Edit Schedule" : "Add Schedule"}</Dialog.Title>

                                <View style={{
                                    flexDirection: responsive === "small" ? 'column' : 'row',
                                    maxHeight: height / 1.5,
                                }}>
                                    <View style={{ flexBasis: '46%', marginHorizontal: '2%' }}>
                                        <Text style={[masterdataStyles.text, { marginHorizontal: 24, marginVertical: 10 }]}>{isEditing ? "Update TimeSchedule detail" : "Create TimeSchedule detail"}</Text>

                                        <FastField name="ScheduleName">
                                            {({ field, form }: any) => (
                                                <Inputs
                                                    placeholder="Enter Schedule Name"
                                                    label="Schedule Name"
                                                    handleChange={(value) => form.setFieldValue(field.name, value)}
                                                    handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                    value={field.value ??= ""}
                                                    error={form.touched.ScheduleName && Boolean(form.errors.ScheduleName)}
                                                    errorMessage={form.touched.ScheduleName ? form.errors.ScheduleName : ""}
                                                    testId="schedule-s"
                                                />
                                            )}
                                        </FastField>

                                        <FastField name="MachineGroup">
                                            {({ field, form }: any) => (
                                                <CustomDropdownSingle
                                                    title="Machine Group"
                                                    labels="GMachineName"
                                                    values="GMachineID"
                                                    data={machineGroups?.filter((v) => v.IsActive)}
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
                                                    testId="MachineGroup-md"
                                                    error={form.touched.MachineGroup && Boolean(form.errors.MachineGroup)}
                                                    errorMessage={form.touched.MachineGroup ? form.errors.MachineGroup : ""}
                                                />
                                            )}
                                        </FastField>

                                        <View style={[styles.timeIntervalMenu, { marginBottom: 0 }]}>
                                            <View id="form-active-point-md" style={[masterdataStyles.containerSwitch]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginRight: 12 }]}>
                                                        Point time schedule when stop : {point ? "Custom Day" : "Every Day"}
                                                    </Text>
                                                    <Switch
                                                        style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                        color={point ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                                        value={point}
                                                        onValueChange={(v: boolean) => setPoint(v)}
                                                        testID="point-md"
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ flexBasis: '46%', marginHorizontal: '2%', flex: 1 }}>
                                        <View style={styles.timeIntervalMenu}>
                                            <Menu
                                                visible={showTimeIntervalMenu.custom}
                                                onDismiss={() => setShowTimeIntervalMenu((prev) => ({ ...prev, custom: !showTimeIntervalMenu.custom }))}
                                                style={{ marginTop: 50 }}
                                                anchor={<Button
                                                    mode="outlined"
                                                    style={styles.timeButton}
                                                    onPress={() => setShowTimeIntervalMenu((prev) => ({ ...prev, custom: true }))}
                                                >
                                                    <Text style={masterdataStyles.timeText}>{shouldRenderTime ? `Selected ${shouldRenderTime}` : 'Select Reange Schedule'}</Text>
                                                </Button>}
                                            >
                                                {["Weekly", "Daily"].map((interval, index) => (
                                                    <Menu.Item
                                                        style={styles.menuItem}
                                                        key={index}
                                                        onPress={() => {
                                                            setShouldRenderTime(interval)
                                                            setShowTimeIntervalMenu((prev) => ({ ...prev, custom: false }))
                                                        }}
                                                        title={`${interval}`}
                                                    />
                                                ))}
                                            </Menu>
                                        </View>

                                        {shouldRenderTime === "Daily" && (
                                            <View style={styles.timeIntervalMenu}>
                                                <View id="form-active-md" style={[masterdataStyles.containerSwitch]}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginRight: 12 }]}>
                                                            Type Schedule : {shouldCustom ? "Every Day" : "Custom Day"}
                                                        </Text>
                                                        <Switch
                                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                            color={shouldCustom ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                                            value={shouldCustom !== "" ? shouldCustom : false}
                                                            onValueChange={(v: boolean) => {
                                                                if (v !== shouldCustom) {
                                                                    setFieldValue('timeSlots', [])
                                                                    setFieldValue('timeInterval', "")
                                                                    runOnJS(setShouldCustom)(v);
                                                                }
                                                            }}
                                                            testID="schedule-md"
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        <ScrollView showsVerticalScrollIndicator={false} style={{ display: shouldRenderTime === "Daily" || shouldRenderTime === "Weekly" ? 'flex' : 'none' }}>
                                            <Daily_dialog
                                                setFieldValue={(value: [{ start: string | null, end: string | null }]) => setFieldValue('timeSlots', value)}
                                                shouldCustom={shouldCustom}
                                                shouldRenderTime={shouldRenderTime}
                                                values={values.timeSlots}
                                                key={`daily-dialog`}
                                                responsive={responsive}
                                                showError={showError}
                                                showSuccess={showSuccess}
                                                spacing={spacing}
                                                theme={theme}
                                            />

                                            <Custom_schedule_dialog
                                                responsive={responsive}
                                                shouldCustom={shouldCustom}
                                                shouldRenderTime={shouldRenderTime}
                                                showError={showError}
                                                showSuccess={showSuccess}
                                                spacing={spacing}
                                                theme={theme}
                                                key={"custom_schedule"}
                                            />

                                            <Week_dialog
                                                shouldRenderTime={shouldRenderTime}
                                                setShowThirDialog={(v: boolean) => setShowThirDialog(v)}
                                                setIndexThirDialog={(value) => setIndexThirDialog(value)}
                                                responsive={responsive}
                                                showError={showError}
                                                showSuccess={showSuccess}
                                                selectedDays={values.timeWeek}
                                                setSelectedDays={(value) => setFieldValue('timeWeek', value)}
                                                spacing={spacing}
                                                theme={theme}
                                                key={`week-dialog`}
                                            />
                                        </ScrollView>

                                    </View>
                                </View>
                                <View style={{ paddingBottom: 10, justifyContent: 'flex-end', flexDirection: 'row', paddingHorizontal: 24 }}>
                                    <Button onPress={() => setIsVisible(false)}>Cancel</Button>
                                    <Button
                                        disabled={!isValid || !dirty}
                                        onPress={() => handleSubmit()}>Save</Button>
                                </View>

                            </Dialog>

                            <InfoSchedule_dialog
                                selectedDay={IndexThirDialo}
                                values={values.timeWeek[IndexThirDialo]}
                                key={`infoshedule`}
                                visible={showThirDialog}
                                setVisible={(v) => setShowThirDialog(v)}
                                setFieldValue={(value) => setFieldValue("timeWeek", { ...values.timeWeek, [IndexThirDialo]: value })}
                                responsive={responsive}
                                showError={showError}
                                showSuccess={showSuccess}
                                spacing={spacing}
                                theme={theme}
                                dirty={dirty}
                                isValid={isValid}
                            />
                        </>
                    )
                }}
            </Formik>
        </Portal>
    );
});

export default ScheduleDialog;
