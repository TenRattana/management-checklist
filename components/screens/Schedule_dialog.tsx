import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Button, Dialog, Portal, Menu, IconButton, HelperText } from 'react-native-paper';
import { Inputs } from '../common';
import { Machine, TimeSchedule } from '@/typing/type';
import CustomDropdownMultiple from '../CustomDropdownMultiple';
import { useToast } from '@/app/contexts/useToast';
import { FastField, Formik } from 'formik';
import * as Yup from 'yup'

const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0') + ':00'
);
const { height } = Dimensions.get('window');

interface ScheduleDialogProps {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    timeSchedule: TimeSchedule[];
    saveData: (values: any) => void;
    machine: Machine[];
    initialValues: {
        ScheduleName: string,
        Machine: Machine[],
        timeSlots: [{ start: null, end: null }],
        timeInterval: string | null,
    };
    isEditing: boolean;
}

const ScheduleDialog = React.memo(({ isVisible, setIsVisible, timeSchedule, saveData, initialValues, isEditing, machine }: ScheduleDialogProps) => {
    const { theme } = useTheme();
    const { spacing, responsive } = useRes();
    const { showError, showSuccess } = useToast()
    const [showStartMenu, setShowStartMenu] = useState(-1);
    const [showEndMenu, setShowEndMenu] = useState(-1);
    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState(false);
    const masterdataStyles = useMasterdataStyles();

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

    const handleGenerateSchedule = useCallback(
        (timeInterval: number, setFieldValue: (field: string, value: any) => void) => {
            if (timeInterval <= 0 || timeInterval > 24) {
                showError("Time interval must be between 1 and 24 hours.");
                return;
            }

            const generatedSlots = [];
            try {
                for (let i = 0; i < 24; i += timeInterval) {
                    const endHour = i + timeInterval;
                    if (endHour > 24) break;

                    generatedSlots.push({
                        start: `${i.toString().padStart(2, '0')}:00`,
                        end: `${endHour.toString().padStart(2, '0')}:00`,
                    });
                }

                if (generatedSlots.length === 0) {
                    showError("No time slots could be generated. Adjust the time interval.");
                    return;
                }

                setFieldValue('timeSlots', generatedSlots);
                setFieldValue('timeInterval', timeInterval);
                showSuccess("Schedule generated successfully!");
            } catch (error) {
                showError("An unexpected error occurred while generating the schedule.");
            }
        }, []);


    const styles = StyleSheet.create({
        container: {
            width: responsive === 'large' ? 800 : responsive === 'medium' ? '80%' : '80%',
            alignSelf: 'center',
            backgroundColor: theme.colors.background,
            overflow: 'hidden',
        },
        containerTime: {
            marginVertical: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        timeText: {
            textAlign: 'center',
        },
        addButton: {
            marginVertical: 5,
        },
        slotContainer: {
            marginHorizontal: '4%',
            flexBasis: '38%',
        },
        label: {
            marginHorizontal: 24,
            marginVertical: 10,
            fontSize: spacing.small,
            marginBottom: 10,
        },
        timeButton: {
            marginVertical: 5,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 6,
        },
        deleteButton: {
            flex: 1,
            justifyContent: 'center',
            alignSelf: 'center',
            // top: '20%',
            alignContent: 'center',
            alignItems: 'center',
            // marginTop: 10,
        },
        timeIntervalMenu: {
            marginHorizontal: 24,
            marginBottom: 10,
        },
    });

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)} style={styles.container}>
                <Dialog.Title>{isEditing ? "Edit Schedule" : "Add Schedule"}</Dialog.Title>
                <Text style={[masterdataStyles.text, { marginHorizontal: 24, marginVertical: 10 }]}>{isEditing ? "Update TimeSchedule detail" : "Create TimeSchedule detail"}</Text>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    validateOnBlur={true}
                    validateOnChange={false}
                    onSubmit={(values) => saveData(values)}
                >
                    {({ values, errors, touched, handleSubmit, setFieldValue, dirty, isValid }) => {

                        const handleSelectTime = React.useCallback(
                            (type: 'start' | 'end', index: number, value: string) => {
                                setFieldValue(
                                    'timeSlots',
                                    values.timeSlots.map((slot, i) =>
                                        i === index ? { ...slot, [type]: value } : slot
                                    )
                                );
                            },
                            [setFieldValue, values.timeSlots]
                        );

                        const addTimeSlot = React.useCallback(() => {
                            if (values.timeSlots.some(slot => !slot.start || !slot.end)) {
                                showError("Please complete all time slots before adding a new one.");
                                return;
                            }
                            setFieldValue('timeSlots', [...values.timeSlots, { start: null, end: null }]);
                            showSuccess("New time slot added successfully!");
                        }, [setFieldValue, values.timeSlots]);

                        const removeTimeSlot = React.useCallback((index: number) => {
                            if (values.timeSlots.length <= 1) {
                                showError("You must have at least one time slot.");
                                return;
                            }
                            setFieldValue(
                                'timeSlots',
                                values.timeSlots.filter((_, i) => i !== index)
                            );
                            showSuccess(`Time slot at position ${index + 1} removed successfully!`);
                        }, [setFieldValue, values.timeSlots]);

                        return (
                            <>
                                <View style={{
                                    flexDirection: responsive === "small" ? 'column' : 'row',
                                    maxHeight: height / 1.5,
                                }}>
                                    <View style={{ flexBasis: '46%', marginHorizontal: '2%' }}>
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

                                        <ScrollView showsVerticalScrollIndicator={false}>
                                            <FastField name="Machine">
                                                {({ field, form }: any) => (
                                                    <CustomDropdownMultiple
                                                        title="Machine"
                                                        labels="MachineName"
                                                        values="MachineID"
                                                        data={machine}
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
                                    </View>

                                    <View style={{ flexBasis: '46%', marginHorizontal: '2%' }}>
                                        <View style={styles.timeIntervalMenu}>
                                            <Text style={masterdataStyles.text}>Generate Time Every : {values.timeInterval}</Text>

                                            <Menu
                                                visible={showTimeIntervalMenu}
                                                onDismiss={() => setShowTimeIntervalMenu(false)}
                                                anchor={<Button
                                                    mode="outlined"
                                                    style={styles.timeButton}
                                                    onPress={() => setShowTimeIntervalMenu(true)}
                                                >
                                                    <Text style={styles.timeText}>{values.timeInterval ? `Every ${values.timeInterval} hours` : 'Select Interval'}</Text>
                                                </Button>}
                                            >
                                                {[1, 2, 3, 4, 6, 12].map((interval, index) => (
                                                    <Menu.Item
                                                        style={{ width: 200 }}
                                                        key={index}
                                                        onPress={() => {
                                                            handleGenerateSchedule(interval, setFieldValue);
                                                            setShowTimeIntervalMenu(false)
                                                        }}
                                                        title={`Every ${interval} hours`}
                                                    />
                                                ))}
                                            </Menu>
                                        </View>

                                        <ScrollView showsVerticalScrollIndicator={false}>
                                            {values.timeSlots.map((timeSlot, index) => (
                                                <View key={index} style={styles.containerTime}>

                                                    <View style={styles.slotContainer}>
                                                        <Text style={[masterdataStyles.text]}>Start Time</Text>
                                                        <Menu
                                                            visible={showStartMenu === index}
                                                            onDismiss={() => setShowStartMenu(-1)}
                                                            anchor={
                                                                <Button
                                                                    mode="outlined"
                                                                    style={styles.timeButton}
                                                                    onPress={() => setShowStartMenu(index)}
                                                                >
                                                                    <Text style={styles.timeText}>
                                                                        {timeSlot.start || 'N/A'}
                                                                    </Text>
                                                                </Button>
                                                            }
                                                        >
                                                            {hours.map((hour, i) => (
                                                                <Menu.Item
                                                                    style={{ width: 200 }}
                                                                    key={i}
                                                                    onPress={() => handleSelectTime('start', index, hour)}
                                                                    title={hour}
                                                                />
                                                            ))}
                                                        </Menu>
                                                    </View>

                                                    <View style={styles.slotContainer}>
                                                        <Text style={[masterdataStyles.text]}>End Time</Text>
                                                        <Menu
                                                            visible={showEndMenu === index}
                                                            onDismiss={() => setShowEndMenu(-1)}
                                                            anchor={
                                                                <Button
                                                                    mode="outlined"
                                                                    style={styles.timeButton}
                                                                    onPress={() => setShowEndMenu(index)}
                                                                >
                                                                    <Text style={styles.timeText}>
                                                                        {timeSlot.end || 'N/A'}
                                                                    </Text>
                                                                </Button>
                                                            }
                                                        >
                                                            {hours.map((hour, i) => (
                                                                <Menu.Item
                                                                    style={{ width: 200 }}
                                                                    key={i}
                                                                    onPress={() => handleSelectTime('end', index, hour)}
                                                                    title={hour}
                                                                />
                                                            ))}
                                                        </Menu>
                                                    </View>

                                                    <IconButton
                                                        icon="window-close"
                                                        iconColor={theme.colors.error}
                                                        size={spacing.large}
                                                        style={styles.deleteButton}
                                                        onPress={() => removeTimeSlot(index)}
                                                        animated
                                                    />

                                                    {/* <HelperText
                                                type="error"
                                                visible={Boolean(errors.timeSlots?.[index])}
                                                style={[
                                                    { display: errors.timeSlots?.[index] ? 'flex' : 'none' , width:'100%' },
                                                    masterdataStyles.errorText
                                                ]}
                                            > */}
                                                    {/* {errors.timeSlots?.[index] || ""} */}
                                                    {/* </HelperText> */}

                                                </View>
                                            ))}
                                        </ScrollView>
                                        <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
                                            <Button onPress={() => addTimeSlot()} style={styles.addButton}>
                                                Add Schedule
                                            </Button>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ paddingBottom: 10, justifyContent: 'flex-end', flexDirection: 'row', paddingHorizontal: 24 }}>
                                    <Button onPress={() => setIsVisible(false)}>Cancel</Button>
                                    <Button
                                        disabled={!isValid || !dirty}
                                        onPress={() => handleSubmit()}>Save</Button>
                                </View>
                            </>
                        )
                    }}
                </Formik>
            </Dialog>
        </Portal>
    );
});

export default ScheduleDialog;
