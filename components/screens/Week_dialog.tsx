import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Button, Dialog, Portal, Menu, IconButton, HelperText, Switch } from 'react-native-paper';
import { Inputs } from '../common';
import { GroupMachine, Machine, TimeSchedule } from '@/typing/type';
import CustomDropdownMultiple from '../CustomDropdownMultiple';
import { FastField, Formik } from 'formik';
import * as Yup from 'yup'
import CustomDropdownSingle from '../CustomDropdownSingle';
import axiosInstance from '@/config/axios';
import { useQuery } from 'react-query';
import Animated, { Easing, FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight } from 'react-native-reanimated';
import InfoSchedule_dialog from './InfoSchedule_dialog';
import { styles } from './Schedule';

const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0') + ':00'
);

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

interface WeekProps {
    shouldRenderTime: string;
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    setShowThirDialog: (v: boolean) => void;
}

const Week_dialog = React.memo(({ shouldRenderTime, theme, spacing, responsive, showError, showSuccess, setShowThirDialog }: WeekProps) => {

    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ custom: boolean, time: boolean, week: boolean }>({ custom: false, time: false, week: false });
    const masterdataStyles = useMasterdataStyles();
    const [indexThirDialog, setIndexThirDialog] = useState<number | undefined>()
    const [timeInterval, setTimeInterval] = useState<number>(0)
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    FadeOutLeft.duration(300).easing(Easing.ease);
    FadeInLeft.duration(300).easing(Easing.ease);

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
                setTimeInterval(timeInterval);
                showSuccess("Schedule generated successfully!");
            } catch (error) {
                showError("An unexpected error occurred while generating the schedule.");
            }
        }, []);

    const removeDay = React.useCallback((index: number) => {
        setSelectedDays(selectedDays.filter((_, i) => i !== index))
        showSuccess(`Day slot at position ${index + 1} removed successfully`)
    }, [selectedDays])

    const setInfoDay = React.useCallback((index: number) => {
        setShowThirDialog(true)
        setIndexThirDialog(index)
    }, [])

    const toggleDaySelection = React.useCallback((day: string) => {
        console.log(selectedDays.includes(day));

        if (selectedDays.includes(day)) {
            setSelectedDays((prev) => prev.filter((d) => d !== day));
        } else {
            setSelectedDays((prev) => [...prev, day]);
        }
    }, [selectedDays]);

    return shouldRenderTime === "Weekly" && (
        <Animated.View entering={FadeInLeft} exiting={FadeOutLeft}>

            <View style={styles.timeIntervalMenu}>
                <Menu
                    visible={showTimeIntervalMenu.week}
                    onDismiss={() => setShowTimeIntervalMenu((prev) => ({ ...prev, week: false }))}
                    anchor={
                        <Button
                            mode="outlined"
                            style={styles.timeButton}
                            onPress={() => setShowTimeIntervalMenu((prev) => ({ ...prev, week: true }))}
                        >
                            <Text style={masterdataStyles.timeText}>{selectedDays.length > 0 ? `Selected: ${selectedDays.join(", ")}` : "Select Day"}</Text>
                        </Button>
                    }
                >
                    {Week.map((day, index) => (
                        <Menu.Item
                            key={index}
                            onPress={() => toggleDaySelection(day)}
                            title={`${selectedDays.includes(day) ? "✔ " : ""}${day}`}
                            style={styles.menuItem}
                        />
                    ))}
                </Menu>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {selectedDays.map((timeSlot, index) => (
                    <View key={index} style={{ flexDirection: 'row', marginHorizontal: 5, marginVertical: 5 }}>

                        <View style={{ flexBasis: '50%', backgroundColor: theme.colors.blue, borderRadius: 8, justifyContent: 'center' }}>
                            <Text style={[masterdataStyles.textFFF, { textAlign: 'center' }]}>
                                {`${timeSlot}Day` || 'N/A'}
                            </Text>
                        </View>

                        <IconButton
                            icon="information-outline"
                            iconColor={theme.colors.blue}
                            size={spacing.large}
                            style={styles.deleteButton}
                            onPress={() => setInfoDay(index)}
                            animated
                        />

                        <IconButton
                            icon="window-close"
                            iconColor={theme.colors.error}
                            size={spacing.large}
                            style={styles.deleteButton}
                            onPress={() => removeDay(index)}
                            animated
                        />

                    </View>
                ))}
            </ScrollView>
        </Animated.View>
    )
})

export default Week_dialog