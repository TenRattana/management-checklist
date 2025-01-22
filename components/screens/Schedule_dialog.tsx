import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Button, Dialog, Portal, Menu, Switch, HelperText, Icon } from 'react-native-paper';
import { DropdownMulti, Inputs } from '../common';
import { useToast } from '@/app/contexts/useToast';
import { FastField, Field, Formik } from 'formik';
import * as Yup from 'yup'
import Daily_dialog from './Daily_dialog';
import Week_dialog from './Week_dialog';
import { convertToDate, styles } from './Schedule';
import Custom_schedule_dialog from './Custom_schedule_dialog';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight } from 'react-native-reanimated';
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { fetchMachineGroups, fetchSearchMachineGroups, fetchSearchTimeSchedules } from '@/app/services';
import { ScheduleDialogProps } from '@/typing/screens/TimeSchedule';
import HeaderDialog from './HeaderDialog';
import { useSelector } from 'react-redux';

const { height } = Dimensions.get('window');

const isValidDateFormatCustom = (value: string) => {
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;
    return dateRegex.test(value);
};
const isValidDateFormatSlots = (value: string) => {
    const dateRegex = /^(\d{2}):(\d{2})$/;
    return dateRegex.test(value);
};

FadeInLeft.duration(300).easing(Easing.ease);
FadeOutLeft.duration(300).easing(Easing.ease);

FadeInRight.duration(300).easing(Easing.ease);
FadeOutRight.duration(300).easing(Easing.ease);

const ScheduleDialog = React.memo(({ isVisible, setIsVisible, saveData, initialValues, isEditing }: ScheduleDialogProps) => {
    const { theme } = useTheme();
    const { spacing, responsive } = useRes();
    const { showError, showSuccess } = useToast()
    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ Custom: boolean, time: boolean, week: boolean }>({ Custom: false, time: false, week: false });
    const masterdataStyles = useMasterdataStyles();
    const state = useSelector((state: any) => state.prefix);

    const validationSchema = Yup.object().shape({
        ScheduleName: Yup.string().required('Schedule name field is required.'),
        MachineGroup: Yup.array()
            .of(Yup.string())
            .min(1, "The group machine list field requires at least one option to be selected"),
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

    const [open, setOpen] = useState<{ Machine: boolean, Schedule: boolean }>({ Machine: false, Schedule: false })

    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<{ Machine: string, Schedule: string }>({ Machine: '', Schedule: '' });
    const [items, setItems] = useState<{ label: string; value: string }[]>([]);

    const { data, isFetching, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery(
        ['machineGroups', debouncedSearchQuery.Machine],
        ({ pageParam = 0 }) => {
            return debouncedSearchQuery.Machine
                ? fetchSearchMachineGroups(debouncedSearchQuery.Machine)
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

    const { } = useInfiniteQuery(
        ['timeSchedule', debouncedSearchQuery.Schedule],
        () => {
            return debouncedSearchQuery.Schedule && fetchSearchTimeSchedules(debouncedSearchQuery.Schedule) || []
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            onSuccess: (newData) => {
                const newItems = newData.pages.flat();

                const filteredItems = newItems.flatMap((item) => item.MachineGroup);

                const newItemsMG = filteredItems.map((item) => ({
                    label: item?.GMachineName || 'Unknown',
                    value: item?.GMachineID || '',
                })) || [];

                setItems((prevItems) => {
                    const newItemsSet = new Set(prevItems.map((item: any) => item.value));
                    const mergedItems = prevItems.concat(
                        newItemsMG.filter((item) => !newItemsSet.has(item.value))
                    );
                    return mergedItems;
                });
            },
        }
    );
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isEditing) {
            setDebouncedSearchQuery((prev) => ({ ...prev, Schedule: initialValues.ScheduleName ?? "" }));
            queryClient.invalidateQueries('machineGroups');
        } else {
            queryClient.invalidateQueries('machineGroups');
        }

    }, [initialValues, isEditing]);

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
        <GestureHandlerRootView style={{ display: isVisible ? 'flex' : 'none' }}>
            <Portal>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    validateOnBlur={false}
                    onSubmit={(values, formikHelpers) => {
                        saveData(values);
                        formikHelpers.resetForm();
                        setIsVisible(false);
                    }}
                    enableReinitialize={true}
                >
                    {({ values, handleSubmit, setFieldValue, dirty, isValid, errors, touched, setFieldTouched, resetForm }) => {

                        const handelChange = (field: string, value: any) => {
                            setFieldTouched(field, true);
                            setFieldValue(field, value);
                        };

                        return (
                            <Dialog visible={isVisible} style={[masterdataStyles.containerDialog, { width: responsive === "large" ? 1000 : "80%" }]}>
                                <Dialog.Content style={{ paddingHorizontal: 20 }}>
                                    <HeaderDialog isEditing setIsVisible={() => setIsVisible(false)} display={state.TimeSchedule} />

                                    <View style={{
                                        flexDirection: responsive === "small" ? 'column' : 'row',
                                        maxHeight: height / 1.7,
                                    }}>
                                        <View style={{ flexBasis: '46%' }}>
                                            <Field name="ScheduleName">
                                                {({ field, form }: any) => (
                                                    <>
                                                        <View style={{ flexDirection: 'row', paddingTop: 10, paddingLeft: 10 }}>
                                                            <Icon source="calendar-month" size={50} color={theme.colors.onBackground} />
                                                            <View>
                                                                <Text style={[masterdataStyles.title, { marginTop: 5 }]}>{isEditing ? "Edit Schedule" : "Add Schedule"}</Text>
                                                                <Text style={[masterdataStyles.text, { paddingLeft: 5, marginTop: 5 }]}>{isEditing ? "Update TimeSchedule detail" : "Create TimeSchedule detail"}</Text>
                                                            </View>
                                                        </View>


                                                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingTop: 10, paddingLeft: 10 }]}>
                                                            Schedule Name
                                                        </Text>

                                                        <Inputs
                                                            mode='outlined'
                                                            placeholder="Enter Schedule Name"
                                                            label="Schedule Name"
                                                            handleChange={(value) => form.setFieldValue(field.name, value)}
                                                            handleBlur={() => form.setTouched({ ...form.touched, [field.name]: true })}
                                                            value={field.value ??= ""}
                                                            error={form.touched.ScheduleName && Boolean(form.errors.ScheduleName)}
                                                            errorMessage={form.touched.ScheduleName ? form.errors.ScheduleName : ""}
                                                            testId="schedule-s"
                                                        />
                                                    </>
                                                )}
                                            </Field>

                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 3, paddingLeft: 10 }]}>
                                                Group Machine
                                            </Text>

                                            <DropdownMulti
                                                label='machine group'
                                                open={open.Machine}
                                                setOpen={(v: boolean) => setOpen((prev) => ({ ...prev, Machine: v }))}
                                                searchQuery={debouncedSearchQuery.Machine}
                                                setDebouncedSearchQuery={(v: string) => setDebouncedSearchQuery((prev) => ({ ...prev, Machine: v }))}
                                                items={items}
                                                isFetching={isFetching}
                                                fetchNextPage={fetchNextPage}
                                                handleScroll={handleScroll}
                                                selectedValue={values.MachineGroup}
                                                setSelectedValue={(value: string | string[] | null) => handelChange("MachineGroup", value)}
                                            />

                                            <HelperText
                                                type="error"
                                                visible={Boolean(touched.MachineGroup && errors.MachineGroup)}
                                                style={[{ display: Boolean(touched.MachineGroup && errors.MachineGroup) ? 'flex' : 'none' }, masterdataStyles.errorText]}
                                            >
                                                {errors.MachineGroup || ""}
                                            </HelperText>

                                            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: Platform.OS === "web" ? 0 : 1, marginVertical: 5 }}>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 10 }}>
                                                    {values.MachineGroup && Array.isArray(values.MachineGroup) && values.MachineGroup.length > 0 && values.MachineGroup?.map((item, index) => (
                                                        <TouchableOpacity onPress={() => {
                                                            setFieldValue("MachineGroup", values.MachineGroup && Array.isArray(values.MachineGroup) && values.MachineGroup.filter((id) => id !== item))
                                                        }} key={index}>
                                                            <View id="container-renderSelect" style={masterdataStyles.selectedStyle}>
                                                                <Text style={masterdataStyles.textFFF}>{items.find((v) => v.value === String(item))?.label}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </ScrollView>

                                            <View style={[styles.timeIntervalMenu, { marginBottom: 0 }]}>
                                                <View id="form-active-point-md" style={[masterdataStyles.containerSwitch]}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginRight: 12 }]}>
                                                            Point time schedule when stop : {values.Tracking ? "Tracking time" : "Not tracking"}
                                                        </Text>
                                                        <Switch
                                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                            color={values.Tracking ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                                            value={values.Tracking}
                                                            onValueChange={(v: boolean) => { setFieldValue('Tracking', v) }}
                                                            testID="point-md"
                                                        />
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={[styles.timeIntervalMenu, { marginBottom: 0 }]}>
                                                <View id="form-active-active-md" style={[masterdataStyles.containerSwitch]}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={[masterdataStyles.text, masterdataStyles.textDark, { marginRight: 12 }]}>
                                                            Status : {values.IsActive ? "Active" : "In active"}
                                                        </Text>
                                                        <Switch
                                                            style={{ transform: [{ scale: 1.1 }], top: 2 }}
                                                            color={values.IsActive ? theme.colors.inversePrimary : theme.colors.onPrimaryContainer}
                                                            value={values.IsActive}
                                                            onValueChange={(v: boolean) => { setFieldValue('IsActive', v) }}
                                                            testID="active-md"
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ flexBasis: '46%', marginHorizontal: '2%', flex: 1, marginTop: responsive === "small" ? 100 : 0 }}>
                                            <Text style={[masterdataStyles.text, masterdataStyles.textBold, { paddingVertical: 3, paddingLeft: 10 }]}>
                                                Type Schedule
                                            </Text>

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
                                                    {["Weekly", "Daily", "Custom"].map((interval, index) => (
                                                        <Menu.Item
                                                            style={styles.menuItem}
                                                            key={index}
                                                            onPress={() => {
                                                                setFieldValue('Type_schedule', interval)
                                                                setShowTimeIntervalMenu((prev) => ({ ...prev, Custom: false }))
                                                            }}
                                                            title={`${interval}`}
                                                        />
                                                    ))}
                                                </Menu>
                                            </View>

                                            <HelperText type="error" visible={touched.Type_schedule && Boolean(errors.Type_schedule)} style={[{ display: touched.Type_schedule && Boolean(errors.Type_schedule) ? 'flex' : 'none' }, masterdataStyles.errorText]}>
                                                {errors.Type_schedule}
                                            </HelperText>

                                            <ScrollView showsVerticalScrollIndicator={false} style={{ display: values.Type_schedule ? 'flex' : 'none' }}>
                                                <Animated.View entering={FadeInRight} exiting={FadeOutRight} style={{ display: values.Type_schedule === "Daily" ? 'flex' : 'none' }} >
                                                    <FastField name="TimeSlots" key={JSON.stringify({ Type_schedule: values.Type_schedule, TimeSlots: values.TimeSlots })}>
                                                        {({ field, form }: any) => (
                                                            <Daily_dialog
                                                                values={values?.TimeSlots || []}
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
                                                                touched={touched?.TimeSlots}
                                                                errors={errors.TimeSlots}
                                                                spacing={spacing}
                                                                theme={theme}
                                                            />
                                                        )}
                                                    </FastField>
                                                </Animated.View>

                                                <Animated.View entering={FadeInLeft} exiting={FadeOutLeft} style={{ display: values.Type_schedule === "Custom" ? 'flex' : 'none' }}>
                                                    <FastField name="TimeCustom" key={JSON.stringify({ Type_schedule: values.Type_schedule, Custom: values.Custom, TimeCustom: values.TimeCustom })}>
                                                        {({ field, form }: any) => (
                                                            <Custom_schedule_dialog
                                                                responsive={responsive}
                                                                values={values.TimeCustom || []}
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
                                                    <FastField name="TimeWeek" key={JSON.stringify({ Type_schedule: values.Type_schedule, Custom: values.Custom, timeWeek: true })}>
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
                                                                values={values.TimeWeek || {}}
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
                                            onPress={() => {
                                                handleSubmit();

                                            }}>Save</Button>
                                    </View>

                                </Dialog.Content>
                            </Dialog>
                        )
                    }}
                </Formik>
            </Portal >
        </GestureHandlerRootView >
    );
});

export default ScheduleDialog;
