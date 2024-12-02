import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { Button, Menu, IconButton, HelperText } from 'react-native-paper';
import Animated, { Easing, Extrapolate, FadeInRight, FadeOutRight, interpolate, SharedValue } from 'react-native-reanimated';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { styles } from './Schedule';
import { FormikErrors, FormikTouched } from 'formik';

const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0') + ':00'
);

const Hours = [1, 2, 3, 4, 6, 12]

interface DailyProps {
    values: { start: string | null, end: string | null }[];
    setFieldValue: (value: any) => void;
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    touched?: FormikTouched<{
        start: string | null;
        end: string | null;
    }>[] | undefined;
    errors?: string | string[] | FormikErrors<{
        start: string | null;
        end: string | null;
    }>[] | undefined;
}

const Daily_dialog = React.memo(({ values, setFieldValue, spacing, showError, showSuccess, touched, errors }: DailyProps) => {
    const [showStartMenu, setShowStartMenu] = useState(-1);
    const [showEndMenu, setShowEndMenu] = useState(-1);
    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ custom: boolean, time: boolean, week: boolean }>({ custom: false, time: false, week: false });
    const masterdataStyles = useMasterdataStyles();

    FadeInRight.duration(300).easing(Easing.ease);
    FadeOutRight.duration(300).easing(Easing.ease);

    const handleSelectTime = React.useCallback((type: 'start' | 'end', index: number, value: string) => {
        setFieldValue(values.map((slot, i) => i === index ? { ...slot, [type]: value } : slot));
    }, [setFieldValue, values]);

    const addTimeSlot = React.useCallback(() => {
        if (values.some(slot => !slot.start || !slot.end)) {
            showError("Please complete all time slots before adding a new one.");
            return;
        }

        setFieldValue([...values, { start: null, end: null }]);

        showSuccess("New time slot added successfully!");
    }, [setFieldValue, values]);

    const removeTimeSlot = React.useCallback((index: number) => {
        if (values.length <= 0) {
            showError("You must have at least one time slot.");
            return;
        }
        setFieldValue(values.filter((_, i) => i !== index));

        showSuccess(`Time slot at position ${index + 1} removed successfully!`);
    }, [setFieldValue, values]);

    const handleGenerateSchedule = useCallback((timeInterval: number, setFieldValue: (value: any) => void) => {
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

            setFieldValue(generatedSlots);
            showSuccess("Schedule generated successfully!");
        } catch (error) {
            showError("An unexpected error occurred while generating the schedule.");
        }
    }, []);

    const renderTimeSelection = (
        type: 'start' | 'end',
        index: number,
        timeSlot: { start: string | null; end: string | null },
        hours: string[]
    ) => {
        const isStart = type === 'start';
        const menuVisible = isStart ? showStartMenu === index : showEndMenu === index;

        return (
            <View style={styles.slotContainer}>
                <Text style={[masterdataStyles.text]}>
                    {isStart ? 'Start Time' : 'End Time'}
                </Text>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => (isStart ? setShowStartMenu(-1) : setShowEndMenu(-1))}
                    anchor={
                        <Button
                            mode="outlined"
                            style={styles.timeButton}
                            onPress={() => (isStart ? setShowStartMenu(index) : setShowEndMenu(index))}
                        >
                            <Text style={masterdataStyles.timeText}>
                                {timeSlot[type] || 'N/A'}
                            </Text>
                        </Button>
                    }
                >
                    {hours.map((hour, i) => (
                        <Menu.Item
                            style={styles.menuItem}
                            key={i}
                            onPress={() => {
                                handleSelectTime(type, index, hour)
                                isStart ? setShowStartMenu(-1) : setShowEndMenu(-1)
                            }}
                            title={hour}
                        />
                    ))}
                </Menu>
                <HelperText
                    type="error"
                    visible={Boolean(touched) && Boolean(errors?.[index])}
                    style={[{ display: touched && Array.isArray(errors) && typeof errors[index] === 'object' && errors[index] ? 'flex' : 'none' }, masterdataStyles.errorText]}
                >
                    {Array.isArray(errors) && typeof errors[index] === 'object' && errors[index] && (
                        errors?.[index]?.[type]
                    )}
                </HelperText>
            </View>
        );
    };

    const renderRightActions = (dragX: SharedValue<number>, index: number) => {
        const translateX = dragX.value ? interpolate(dragX.value, [0, 200], [0, 200], Extrapolate.CLAMP) : 0;

        return (
            <View style={styles.rightActionsContainer}>
                <Animated.View
                    style={[
                        { transform: [{ translateX }] },
                    ]}
                >
                    <IconButton
                        icon="delete-forever"
                        iconColor="red"
                        size={spacing.large}
                        style={styles.deleteButton}
                        onPress={() => removeTimeSlot(index)}
                    />
                </Animated.View>
            </View>
        );
    }

    return (
        <>
            <View style={styles.timeIntervalMenu}>
                <Menu
                    visible={showTimeIntervalMenu.time}
                    onDismiss={() => setShowTimeIntervalMenu((prev) => ({ ...prev, time: !showTimeIntervalMenu.time }))}
                    anchor={<Button
                        mode="outlined"
                        style={styles.timeButton}
                        onPress={() => setShowTimeIntervalMenu((prev) => ({ ...prev, time: true }))}
                    >
                        <Text style={masterdataStyles.timeText}>Generate Schedule</Text>
                    </Button>}
                >
                    {Hours.map((interval, index) => (
                        <Menu.Item
                            style={styles.menuItem}
                            key={index}
                            onPress={() => {
                                handleGenerateSchedule(interval, setFieldValue);
                                setShowTimeIntervalMenu((prev) => ({ ...prev, time: false }))
                            }}
                            title={`Every ${interval} hours`}
                        />
                    ))}
                </Menu>
            </View>

            {values?.map((timeSlot, index) => {
                return (
                    <Swipeable
                        key={index}
                        renderRightActions={(dragX: any) =>
                            renderRightActions(dragX, index)
                        }
                    >
                        <View key={`container-${index}`} style={styles.containerTime}>
                            {renderTimeSelection('start', index, timeSlot, hours)}

                            {renderTimeSelection('end', index, timeSlot, hours)}
                        </View>

                        <HelperText
                            type="error"
                            visible={Boolean(touched) && Boolean(errors?.[index])}
                            style={[{ display: touched && errors?.[index] ? 'flex' : 'none' }, masterdataStyles.errorText]}
                        >
                            {Array.isArray(errors) && typeof errors[index] === 'object' && errors[index] ? false : errors?.[index] as string}
                        </HelperText>
                    </Swipeable>
                )
            })}

            <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
                <Button onPress={() => addTimeSlot()} style={styles.addButton}>
                    <Text style={masterdataStyles.timeText}>Add Schedule</Text>
                </Button>
            </View>
        </>
    )
})

export default Daily_dialog