import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Button, Dialog, Portal, Menu, Switch, HelperText } from 'react-native-paper';
import { Inputs } from '../common';
import { GroupMachine, TimeSchedule } from '@/typing/type';
import { useToast } from '@/app/contexts/useToast';
import { FastField, Formik } from 'formik';
import * as Yup from 'yup'
import CustomDropdownSingle from '../CustomDropdownSingle';
import axiosInstance from '@/config/axios';
import { useQuery } from 'react-query';
import Daily_dialog from './Daily_dialog';
import Week_dialog from './Week_dialog';
import { convertToDate, styles } from './Schedule';
import Custom_schedule_dialog from './Custom_schedule_dialog';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

const fetchMachineGroups = async (): Promise<GroupMachine[]> => {
    const response = await axiosInstance.post("GroupMachine_service.asmx/GetGroupMachines");
    return response.data.data ?? [];
};

const isValidDateFormatCustom = (value: string) => {
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;
    return dateRegex.test(value);
};
const isValidDateFormatSlots = (value: string) => {
    const dateRegex = /^(\d{2}):(\d{2})$/;
    return dateRegex.test(value);
};
interface ScheduleDialogProps {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    timeSchedule: TimeSchedule[];
    saveData: (values: any) => void;
    initialValues: {
        ScheduleName: string,
        MachineGroup: string;
        Type_schedule: string;
        Custom: boolean;
        TimeSlots: { start: string | null, end: string | null }[];
        TimeCustom: { start: string | null, end: string | null }[];
        TimeWeek: { [key: string]: { start: string | null, end: string | null }[] }
    };
    isEditing: boolean;
}
FadeInLeft.duration(300).easing(Easing.ease);
FadeOutLeft.duration(300).easing(Easing.ease);

FadeInRight.duration(300).easing(Easing.ease);
FadeOutRight.duration(300).easing(Easing.ease);

const ScheduleDialog = React.memo(({ isVisible, setIsVisible, timeSchedule, saveData, initialValues, isEditing }: ScheduleDialogProps) => {
    const { theme } = useTheme();
    const { spacing, responsive } = useRes();
    const { showError, showSuccess } = useToast()
    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ Custom: boolean, time: boolean, week: boolean }>({ Custom: false, time: false, week: false });
    const masterdataStyles = useMasterdataStyles();
    const [point, setPoint] = useState(false)

    useEffect(() => {
        if (!isVisible) {
            setPoint(false)
        }
    }, [isVisible])

    const validationSchema = Yup.object().shape({
        ScheduleName: Yup.string().required('Schedule name field is required.'),
        MachineGroup: Yup.string().nullable(),
        Type_schedule: Yup.string().required('Type schedule field is required.'),
        Custom: Yup.boolean().typeError('Custom schedule field is type true or false').required('Custom schedule field is required.'),
        TimeSlots: Yup.array().of(
            Yup.object().shape({
                start: Yup.string()
                    .required('Start time is required')
                    .test('is-valid-date', 'Invalid date format', value => isValidDateFormatSlots(value)),
                end: Yup.string()
                    .required('End time is required')
                    .test('is-valid-date', 'Invalid date format', value => isValidDateFormatSlots(value)),
            })
                .test('start-less-than-end', 'Start time must be less than end time', function (TimeSlots) {
                    const { start, end } = TimeSlots;

                    if (start && end) {
                        return start <= end;
                    }
                    return false;
                })
                .test('start-after-prev-end', 'Start time must be after previous end time', function (TimeSlots) {
                    const { start } = TimeSlots;
                    const { parent } = this;

                    if (parent && parent.length > 1) {
                        const currentIndex = parent.findIndex((item: { start: string | null, end: string | null }) => item.start === start);

                        if (currentIndex > 0) {
                            const prevEnd = parent[currentIndex - 1]?.end;

                            if (prevEnd) {
                                return start >= prevEnd;
                            }
                        }
                    }
                    return true;
                })
        ),
        TimeCustom: Yup.array().of(
            Yup.object().shape({
                start: Yup.string()
                    .required('Start time is required')
                    .test('is-valid-date', 'Invalid date format', value => isValidDateFormatCustom(value)),
                end: Yup.string()
                    .required('End time is required')
                    .test('is-valid-date', 'Invalid date format', value => isValidDateFormatCustom(value)),
            })
                .test('start-less-than-end', 'Start time must be less than end time', function (TimeCustom) {
                    const { start, end } = TimeCustom;

                    if (start && end) {
                        const startDate = convertToDate(String(start));
                        const endDate = convertToDate(String(end));

                        return startDate < endDate;
                    }
                    return false;
                })
        ),
    });

    const { data: machineGroups = [] } = useQuery<GroupMachine[], Error>(
        'machineGroups',
        fetchMachineGroups,
        {
            refetchOnWindowFocus: true,
        }
    );

    return (
        <GestureHandlerRootView>
            <Portal>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    validateOnBlur={true}
                    validateOnChange={false}
                    onSubmit={(values) => saveData(values)}
                >
                    {({ values, handleSubmit, setFieldValue, dirty, isValid, errors, touched, setFieldTouched, resetForm }) => {
                        useEffect(() => {
                            values.Type_schedule &&
                                setFieldTouched('Type_schedule', true)
                        }, [values.Type_schedule])

                        useEffect(() => {
                            values.Custom ? setFieldValue("TimeSlots", []) : setFieldValue("TimeCustom", []);
                        }, [values.Custom])

                        return (
                            <Dialog visible={isVisible} style={styles.container}>
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
                                                    title="Group Machine"
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
                                                visible={showTimeIntervalMenu.Custom}
                                                onDismiss={() => {
                                                    setShowTimeIntervalMenu((prev) => ({ ...prev, Custom: !showTimeIntervalMenu.Custom }))
                                                    setFieldTouched('Type_schedule', true)
                                                }}
                                                style={{ marginTop: 50 }}
                                                anchor={<Button
                                                    mode="outlined"
                                                    style={styles.timeButton}
                                                    onPress={() => setShowTimeIntervalMenu((prev) => ({ ...prev, Custom: true }))}
                                                >
                                                    <Text style={masterdataStyles.timeText}>{values.Type_schedule ? `Selected ${values.Type_schedule}` : 'Select Reange Schedule'}</Text>
                                                </Button>}
                                            >
                                                {["Weekly", "Daily"].map((interval, index) => (
                                                    <Menu.Item
                                                        style={styles.menuItem}
                                                        key={index}
                                                        onPress={() => {
                                                            setFieldValue('Type_schedule', interval)
                                                            setShowTimeIntervalMenu((prev) => ({ ...prev, Custom: false }))
                                                        }}
                                                        title={`${interval}`}
                                                    />
                                                )
                                                )}
                                            </Menu>
                                        </View>

                                        <HelperText type="error" visible={touched.Type_schedule && Boolean(errors.Type_schedule)} style={[{ display: touched.Type_schedule && Boolean(errors.Type_schedule) ? 'flex' : 'none' }, masterdataStyles.errorText]}>
                                            {errors.Type_schedule}
                                        </HelperText>

                                        {values.Type_schedule === "Daily" && (
                                            <View style={[styles.timeIntervalMenu, { marginBottom: 0 }]}>
                                                <View id="form-active-md" style={[masterdataStyles.containerSwitch]}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginRight: 12 }]}>
                                                            Type Schedule : {values.Custom ? "Every Day" : "Custom Day"}
                                                        </Text>
                                                        <Switch
                                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                            color={values.Custom ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                                            value={values.Custom}
                                                            onValueChange={(v: boolean) => {
                                                                setFieldValue("Custom", v);
                                                            }}
                                                            testID="Custom-md"
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        <ScrollView showsVerticalScrollIndicator={false} style={{ display: values.Type_schedule === "Daily" || values.Type_schedule === "Weekly" ? 'flex' : 'none' }}>
                                            <Animated.View entering={FadeInRight} exiting={FadeOutRight} style={{ display: values.Type_schedule === "Daily" && values.Custom ? 'flex' : 'none' }} >
                                                <FastField name="TimeSlots" key={JSON.stringify({ Type_schedule: values.Type_schedule, Custom: values.Custom, TimeSlots: values.TimeSlots })}>
                                                    {({ field, form }: any) => (
                                                        <Daily_dialog
                                                            values={values.TimeSlots}
                                                            setFieldValue={(value: [{ start: string | null, end: string | null }]) => {
                                                                form.setFieldValue(field.name, value);

                                                                setTimeout(() => {
                                                                    form.setFieldTouched(field.name, true);
                                                                }, 0)
                                                            }}
                                                            key={`daily-dialog`}
                                                            responsive={responsive}
                                                            showError={showError}
                                                            showSuccess={showSuccess}
                                                            touched={touched.TimeSlots}
                                                            errors={errors.TimeSlots}
                                                            spacing={spacing}
                                                            theme={theme}
                                                        />
                                                    )}
                                                </FastField>
                                            </Animated.View>

                                            <Animated.View entering={FadeInLeft} exiting={FadeOutLeft} style={{ display: values.Type_schedule === "Daily" && !values.Custom ? 'flex' : 'none' }}>
                                                <FastField name="TimeCustom" key={JSON.stringify({ Type_schedule: values.Type_schedule, Custom: values.Custom, TimeCustom: values.TimeCustom })}>
                                                    {({ field, form }: any) => (
                                                        <Custom_schedule_dialog
                                                            responsive={responsive}
                                                            values={values.TimeCustom}
                                                            setFieldValue={(value: [{ start: string | null, end: string | null }]) => {
                                                                form.setFieldValue(field.name, value);

                                                                setTimeout(() => {
                                                                    form.setFieldTouched(field.name, true);
                                                                }, 0)
                                                            }}
                                                            showError={showError}
                                                            showSuccess={showSuccess}
                                                            spacing={spacing}
                                                            theme={theme}
                                                            touched={touched.TimeCustom}
                                                            errors={errors.TimeCustom}
                                                            key={"Custom_schedule"}
                                                        />
                                                    )}
                                                </FastField>
                                            </Animated.View>

                                            <Animated.View entering={FadeInLeft} exiting={FadeOutLeft} style={{ display: values.Type_schedule === "Weekly" ? 'flex' : 'none' }}>
                                                <FastField name="TimeWeek" key={JSON.stringify({ Type_schedule: values.Type_schedule, Custom: values.Custom, TimeWeek: values.TimeWeek })}>
                                                    {({ field, form }: any) => (
                                                        <Week_dialog
                                                            setFieldValue={(value: [{ start: string | null, end: string | null }]) => {
                                                                form.setFieldValue(field.name, value);

                                                                setTimeout(() => {
                                                                    form.setFieldTouched(field.name, true);
                                                                }, 0)
                                                            }}
                                                            responsive={responsive}
                                                            showError={showError}
                                                            showSuccess={showSuccess}
                                                            selectedDays={values.TimeWeek}
                                                            setSelectedDays={(value) => setFieldValue('TimeWeek', value)}
                                                            spacing={spacing}
                                                            theme={theme}
                                                            key={`week-dialog`}
                                                        />
                                                    )}
                                                </FastField>
                                            </Animated.View>

                                        </ScrollView>

                                    </View>
                                </View>
                                <View style={{ paddingBottom: 10, justifyContent: 'flex-end', flexDirection: 'row', paddingHorizontal: 24 }}>
                                    <Button onPress={() => {
                                        setIsVisible(false);
                                        resetForm()
                                    }}>Cancel</Button>
                                    <Button
                                        disabled={!isValid || !dirty}
                                        onPress={() => handleSubmit()}>Save</Button>
                                </View>

                            </Dialog>
                        )
                    }}
                </Formik>
            </Portal >
        </GestureHandlerRootView>
    );
});

export default ScheduleDialog;
