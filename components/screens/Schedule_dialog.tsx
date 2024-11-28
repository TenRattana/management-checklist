import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Button, Dialog, Portal, Menu, Switch } from 'react-native-paper';
import { Inputs } from '../common';
import { GroupMachine, Machine, TimeSchedule } from '@/typing/type';
import CustomDropdownMultiple from '../CustomDropdownMultiple';
import { useToast } from '@/app/contexts/useToast';
import { FastField, Formik } from 'formik';
import * as Yup from 'yup'
import CustomDropdownSingle from '../CustomDropdownSingle';
import axiosInstance from '@/config/axios';
import { useQuery } from 'react-query';
import Animated, {
    FadeInUp,
    FadeOutDown,
} from 'react-native-reanimated';
import Daily_dialog from './Daily_dialog';
import Week_dialog from './Week_dialog';
import InfoSchedule_dialog from './InfoSchedule_dialog';
import { styles } from './Schedule';

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
    machine: Machine[];
    initialValues: {
        ScheduleName: string,
        MachineGroup: string;
        Machine: Machine[],
        timeSlots: [{ start: string | null, end: string | null }],
        timeCustom: [{ start: Date | null, end: Date | null }]
    };
    isEditing: boolean;
}

const ScheduleDialog = React.memo(({ isVisible, setIsVisible, timeSchedule, saveData, initialValues, isEditing, machine }: ScheduleDialogProps) => {
    const { theme } = useTheme();
    const { spacing, responsive } = useRes();
    const { showError, showSuccess } = useToast()
    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ custom: boolean, time: boolean, week: boolean }>({ custom: false, time: false, week: false });
    const masterdataStyles = useMasterdataStyles();
    const [shouldRender, setShouldRender] = useState(false)
    const [showThirDialog, setShowThirDialog] = useState(false)
    const [shouldCustom, setShouldCustom] = useState<boolean | "">("")
    const [shouldRenderTime, setShouldRenderTime] = useState<string>("")
    const [fieldMachine, setFieldMachie] = useState<Machine[]>([])

    useEffect(() => {
        if (!isVisible) {
            setShouldRender(false)
            setShouldCustom("")
            setShouldRenderTime("")
            setFieldMachie([])
            console.log(shouldRenderTime, shouldCustom, shouldRender);
        }
    }, [isVisible])

    const validationSchema = Yup.object().shape({
        ScheduleName: Yup.string().required('Schedule name is required'),
        Machine: Yup.array().min(1, 'Select at least one machine'),
        timeSlots: Yup.array()
            .of(
                Yup.object().shape({
                    start: Yup.string().required('Start time is required'),
                    end: Yup.string().required('End time is required'),
                })
            )
            .min(1, 'At least one time slot is required'),
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
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={styles.container}>
                <Dialog.Title style={{ marginLeft: 30 }}>{isEditing ? "Edit Schedule" : "Add Schedule"}</Dialog.Title>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    validateOnBlur={true}
                    validateOnChange={false}
                    onSubmit={(values) => saveData(values)}
                >
                    {({ values, handleSubmit, setFieldValue, dirty, isValid }) => {

                        useEffect(() => {
                            let file: Machine[]
                            
                            if (values.MachineGroup) {
                                file = machine.filter(v => v.GMachineID === values.MachineGroup)
                                setShouldRender(true)
                            } else {
                                file = machine
                                setShouldRender(false)
                            }

                            setFieldMachie(prevOptions => {
                                const isEqual = JSON.stringify(prevOptions) === JSON.stringify(file);
                                return isEqual ? prevOptions : file;
                            });
                            setFieldValue('Machine', [])
                        }, [values.MachineGroup, fieldMachine])

                        return (
                            <>
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

                                        {shouldRender && (
                                            <Animated.View entering={FadeInUp} exiting={FadeOutDown}>
                                                <ScrollView showsVerticalScrollIndicator={false}>
                                                    <FastField name="Machine" key={JSON.stringify(fieldMachine)}>
                                                        {({ field, form }: any) => (
                                                            <CustomDropdownMultiple
                                                                title="Machine"
                                                                labels="MachineName"
                                                                values="MachineID"
                                                                data={fieldMachine}
                                                                value={field.value}
                                                                handleChange={(value) => {
                                                                    form.setFieldValue(field.name, value);
                                                                    setTimeout(() => {
                                                                        form.setFieldTouched(field.name, true);
                                                                    }, 0)
                                                                }}
                                                                handleBlur={() => {
                                                                    form.setFieldTouched(field.name, true);
                                                                }}
                                                                error={form.touched.checkListOptionId && Boolean(form.errors.checkListOptionId)}
                                                                errorMessage={form.touched.checkListOptionId ? form.errors.checkListOptionId : ""}
                                                                testId="machine-s"
                                                            />
                                                        )
                                                        }
                                                    </FastField>
                                                </ScrollView>
                                            </Animated.View>
                                        )}
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
                                                            Type Schedule : {shouldCustom ? "Run Schedule" : "Only Schedule"}
                                                        </Text>
                                                        <Switch
                                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                            color={shouldCustom ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                                            value={shouldCustom !== "" ? shouldCustom : false}
                                                            onValueChange={(v: boolean) => {
                                                                if (v !== shouldCustom) {
                                                                    setFieldValue('timeSlots', [])
                                                                    setFieldValue('timeInterval', "")
                                                                    setShouldCustom(v);
                                                                }
                                                            }}
                                                            testID="schedule-md"
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        <ScrollView showsVerticalScrollIndicator={false}>
                                            <Daily_dialog
                                                setFieldValue={setFieldValue}
                                                shouldCustom={shouldCustom}
                                                shouldRenderTime={shouldRenderTime}
                                                values={values}
                                                key={`daily-dialog`}
                                                responsive={responsive}
                                                showError={showError}
                                                showSuccess={showSuccess}
                                                spacing={spacing}
                                                theme={theme}
                                            />

                                            <Week_dialog
                                                shouldRenderTime={shouldRenderTime}
                                                setShowThirDialog={(v: boolean) => setShowThirDialog(v)}
                                                responsive={responsive}
                                                showError={showError}
                                                showSuccess={showSuccess}
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
                                <InfoSchedule_dialog
                                    shouldCustom={shouldCustom}
                                    shouldRenderTime={shouldRenderTime}
                                    values={values}
                                    key={`infoshedule`}
                                    visible={showThirDialog}
                                    setVisible={(v) => setShowThirDialog(v)}
                                    setFieldValue={setFieldValue}
                                    responsive={responsive}
                                    showError={showError}
                                    showSuccess={showSuccess}
                                    spacing={spacing}
                                    theme={theme}
                                />
                            </>
                        )
                    }}
                </Formik>
            </Dialog>

        </Portal>
    );
});

export default ScheduleDialog;
