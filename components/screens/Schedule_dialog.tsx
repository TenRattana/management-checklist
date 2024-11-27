import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Button, Dialog, Portal, Menu, IconButton, HelperText, Switch } from 'react-native-paper';
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
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Daily_dialog from './Daily_dialog';
import Week_dialog from './Week_dialog';
import InfoSchedule_dialog from './InfoSchedule_dialog';

const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0') + ':00'
);
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
    };
    isEditing: boolean;
}

const Week = ["Mon", "The", "Wed", "Thu", "Fri", "Sat", "Sun"]

const ScheduleDialog = React.memo(({ isVisible, setIsVisible, timeSchedule, saveData, initialValues, isEditing, machine }: ScheduleDialogProps) => {
    const { theme } = useTheme();
    const { spacing, responsive } = useRes();
    const { showError, showSuccess } = useToast()
    const [showStartMenu, setShowStartMenu] = useState(-1);
    const [showEndMenu, setShowEndMenu] = useState(-1);
    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ custom: boolean, time: boolean, week: boolean }>({ custom: false, time: false, week: false });
    const masterdataStyles = useMasterdataStyles();
    const [shouldRender, setShouldRender] = useState(false)
    const [showThirDialog, setShowThirDialog] = useState(false)
    const [dataThirDialog, setDataThirDialog] = useState<{ [key: number]: { start: string | null, end: string | null }[] }[]>([])
    const [indexThirDialog, setIndexThirDialog] = useState<number | undefined>()
    const [shouldCustom, setShouldCustom] = useState<boolean | "">("")
    const [shouldRenderTime, setShouldRenderTime] = useState<string>("")
    const [fieldMachine, setFieldMachie] = useState<Machine[]>([])
    const [timeInterval, setTimeInterval] = useState<number>(0)
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [dialy_d, setDialy_d] = useState(false)

    useEffect(() => {
        if (!isVisible) {
            setShouldRender(false)
            setShouldCustom("")
            setShouldRenderTime("")
            setFieldMachie([])
            setSelectedDays([])
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
                setTimeInterval(timeInterval);
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
            marginHorizontal: 5,
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
        menuItem: {
            width: 200,
        },
    });

    const duration = 300;

    const scaleTimeValue = withTiming(shouldCustom ? 1 : 1, { duration });
    const scaleMachineValue = withTiming(shouldRender ? 1 : 0.5, { duration });

    const opacityTimeValue = withTiming(shouldCustom ? 1 : 1, { duration });
    const opacityMachineValue = withTiming(shouldRender ? 1 : 0, { duration });

    const animatedMachineStyle = useAnimatedStyle(() => {
        return {
            opacity: opacityMachineValue,
            transform: [{ scale: scaleMachineValue }]
        };
    }, [shouldRender]);

    const animatedTimeStyle = useAnimatedStyle(() => {
        return {
            opacity: opacityTimeValue,
            transform: [{ scale: scaleTimeValue }]
        };
    }, [shouldCustom]);


    console.log(shouldCustom, shouldRenderTime, animatedTimeStyle.transform, "Form");

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
                                            <Animated.View style={[animatedMachineStyle]}>
                                                <ScrollView showsVerticalScrollIndicator={false}>
                                                    <FastField name="Machine" key={fieldMachine}>
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

                                    <View style={{ flexBasis: '46%', marginHorizontal: '2%', marginTop: 12, flex: 1 }}>
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
                                                    <Text style={styles.timeText}>{shouldRenderTime ? `Selected ${shouldRenderTime}` : 'Select Reange Schedule'}</Text>
                                                </Button>}
                                            >
                                                {["Monthly", "Weekly", "Daily"].map((interval, index) => (
                                                    <Menu.Item
                                                        style={{ width: 200, }}
                                                        key={index}
                                                        onPress={() => {
                                                            setShouldRenderTime(interval)
                                                            setSelectedDays([])
                                                            setShowTimeIntervalMenu((prev) => ({ ...prev, custom: false }))
                                                        }}
                                                        title={`${interval}`}
                                                    />
                                                ))}
                                            </Menu>
                                        </View>

                                        <View style={styles.timeIntervalMenu}>
                                            <View id="form-active-md" style={[masterdataStyles.containerSwitch]}>
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
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

                                    </View>
                                </View>
                                <View style={{ paddingBottom: 10, justifyContent: 'flex-end', flexDirection: 'row', paddingHorizontal: 24 }}>
                                    <Button onPress={() => setIsVisible(false)}>Cancel</Button>
                                    <Button
                                        disabled={!isValid || !dirty}
                                        onPress={() => handleSubmit()}>Save</Button>
                                </View>
                                <InfoSchedule_dialog 
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
