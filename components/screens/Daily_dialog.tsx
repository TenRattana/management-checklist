import useMasterdataStyles from '@/styles/common/masterdata';
import React, { forwardRef, useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Button, Menu, IconButton, Dialog, ButtonProps } from 'react-native-paper';
import { Machine } from '@/typing/type';
import Animated, { Easing, Extrapolate, FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight, interpolate, SharedValue } from 'react-native-reanimated';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0') + ':00'
);

const Hours = [1, 2, 3, 4, 6, 12]

interface DailyProps {
    values: {
        ScheduleName: string,
        MachineGroup: string;
        Machine: Machine[],
        timeSlots: [{ start: string | null, end: string | null }],
        timeCustom: [{ start: Date | null, end: Date | null }]
    };
    setFieldValue: (field: string, value: any) => void;
    shouldCustom: boolean | string;
    shouldRenderTime: string;
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
}

const Daily_dialog = React.memo(({ values, setFieldValue, shouldCustom, shouldRenderTime, theme, spacing, responsive, showError, showSuccess }: DailyProps) => {
    const [showStartMenu, setShowStartMenu] = useState(-1);
    const [showEndMenu, setShowEndMenu] = useState(-1);
    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ custom: boolean, time: boolean, week: boolean }>({ custom: false, time: false, week: false });
    const masterdataStyles = useMasterdataStyles();
    const [timeInterval, setTimeInterval] = useState<number>(0)
    const [isPickerVisible, setPickerVisible] = useState<{ start: boolean, end: boolean }>({ start: false, end: false });
    const [isTimePickerVisible, setTimePickerVisible] = useState<{ start: boolean, end: boolean }>({ start: false, end: false });

    FadeOutLeft.duration(300).easing(Easing.ease);
    FadeInLeft.duration(300).easing(Easing.ease);
    FadeInRight.duration(300).easing(Easing.ease);
    FadeOutRight.duration(300).easing(Easing.ease);

    const handleSelectTime = React.useCallback(
        (type: 'start' | 'end', index: number, value: string) => {

            setFieldValue(
                'timeSlots',
                values.timeSlots.map((slot, i) =>
                    i === index ? { ...slot, [type]: value } : slot
                )
            );
            setShowStartMenu(-1)
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

    const addTimeCustom = React.useCallback(() => {
        if (values.timeCustom?.some(custom => !custom.start || !custom.end)) {
            showError("Please complete all time custom before adding a new one.");
            return;
        }

        setFieldValue('timeCustom', [...values.timeCustom, { start: null, end: null }]);
        showSuccess("New time custom added successfully!");
    }, [setFieldValue, values.timeCustom]);

    const removeTimeSlot = React.useCallback((index: number) => {
        if (values.timeSlots.length <= 0) {
            showError("You must have at least one time slot.");
            return;
        }
        setFieldValue(
            'timeSlots',
            values.timeSlots.filter((_, i) => i !== index)
        );
        showSuccess(`Time slot at position ${index + 1} removed successfully!`);
    }, [setFieldValue, values.timeSlots]);

    const removeTimeCustom = React.useCallback((index: number) => {
        if (values.timeCustom.length <= 0) {
            showError("You must have at least one time custom.");
            return;
        }
        setFieldValue(
            'timeCustom',
            values.timeCustom.filter((_, i) => i !== index)
        );
        showSuccess(`Time custom at position ${index + 1} removed successfully!`);
    }, [setFieldValue, values.timeCustom]);

    const handleGenerateSchedule = useCallback((timeInterval: number, setFieldValue: (field: string, value: any) => void) => {
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
            backgroundColor: theme.colors.fff,
            marginVertical: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        addButton: {
            marginVertical: 5,
        },
        slotContainer: {
            marginHorizontal: '2%',
            flexBasis: '46%',
        },
        timeButton: {
            marginVertical: 5,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 6,
        },
        deleteButton: {
            justifyContent: 'center',
            alignSelf: 'center',
            alignContent: 'center',
            alignItems: 'center',
        },
        timeIntervalMenu: {
            marginHorizontal: 5,
            marginBottom: 10,
        },
        menuItem: {
            width: 200,
        },
        rightActionsContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 10,
            borderRadius: 8,
        },
    });

    const renderTimePicker = (type: "start" | "end", index: number, timeSlot: { start: Date | null; end: Date | null; }) => {
        const isStart = type === 'start';

        const date = timeSlot[type]

        return (
            <View style={styles.slotContainer}>
                <Text style={[masterdataStyles.text]}>{isStart ? "Start Day" : "End Day"}</Text>
                {Platform.OS === 'android' || Platform.OS === 'ios' ? (
                    <>
                        {isPickerVisible?.[type] && (
                            <RNDateTimePicker
                                value={date || new Date()}
                                onChange={(event, selectedDate) => handleTimeChange(index, isStart, type, selectedDate)}
                                is24Hour={true}
                                display="default"
                            />
                        )}
                        {isTimePickerVisible?.[type] && (
                            <RNDateTimePicker
                                value={date || new Date()}
                                onChange={(event, selectedDate) => handleTimeChange(index, isStart, type, selectedDate, true)}
                                mode='time'
                                minuteInterval={10}
                                is24Hour={true}
                                display="default"
                            />
                        )}

                        <Button
                            mode="outlined"
                            style={styles.timeButton}
                            onPress={() => setPickerVisible((prev) => ({ ...prev, [type]: true }))}
                        >
                            <Text style={masterdataStyles.timeText}>
                                {date ? date.toLocaleString() : 'N/A'}
                            </Text>
                        </Button>
                    </>
                ) : Platform.OS === "web" && (
                    <DatePicker
                        selected={date}
                        onChange={(newDate) => {
                            if (newDate) {
                                // setSDate(newDate);
                                handleSelectTime(type, index, newDate.toTimeString().slice(0, 5));
                            }
                        }}
                        showTimeInput
                        timeInputLabel="Time:"
                        dateFormat="dd/MM/yyyy h:mm aa"
                        withPortal
                        portalId="root-portal"
                        customInput={<CustomInput />}
                    />
                )}
            </View>
        )
    }

    const handleTimeChange = useCallback((index: number, isStart: boolean, event: any, selectedTime?: Date, isTime?: boolean) => {
        const option = isStart ? "start" : "end";
        let newDate = selectedTime;

        setPickerVisible((prev) => ({ ...prev, [option]: false }));
        setTimePickerVisible((prev) => ({ ...prev, [option]: !isTime }));

        if (isTime && selectedTime) {
            const existingDate = values.timeCustom[index]
            console.log(existingDate, "existingDate");

            // if (existingDate) {
            //     newDate = new Date(existingDate.toDateString() + " " + selectedTime.toTimeString());
            // }
            // setTimePickerVisible((prev) => ({ ...prev, [option]: false }));
        }

        if (newDate) {
            console.log(newDate.toLocaleString(), "newDate");
            console.log(values.timeCustom.map((custom, i) => i === index ? { ...custom, [option]: newDate } : custom), "values");

            setFieldValue('timeCustom', values.timeCustom.map((custom, i) => i === index ? { ...custom, [option]: newDate } : custom));
            showSuccess('Date and Time selected successfully!');
        } else {
            showError('Selection was cancelled.');
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
                            onPress={() => handleSelectTime(type, index, hour)}
                            title={hour}
                        />
                    ))}
                </Menu>
            </View>
        );
    };

    const CustomInput = forwardRef<any, any>((props: any, ref) => {
        return (
            <Button
                mode="outlined"
                style={styles.timeButton}
                onLongPress={props.onClick}
                ref={ref}
            >
                <Text style={masterdataStyles.timeText}>
                    {props.value || 'N/A'}
                </Text>
            </Button>
        )
    });

    const renderRightActions = (dragX: SharedValue<number>, index: number, custom?: boolean) => {
        const translateX = dragX.value ? interpolate(dragX.value, {
            inputRange: [0, 200],
            outputRange: [0, 200],
            extrapolate: Extrapolate.CLAMP,
        }) : 0;

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
                        onPress={() => custom ? removeTimeCustom(index) : removeTimeSlot(index)}
                    />
                </Animated.View>
            </View>
        );
    };

    return (
        <GestureHandlerRootView>
            {shouldRenderTime === "Daily" && shouldCustom ? (
                <Animated.View entering={FadeInRight} exiting={FadeOutRight} >
                    <View style={styles.timeIntervalMenu}>
                        <Text style={masterdataStyles.text}>Generate Time Every : {timeInterval}</Text>
                        <Menu
                            visible={showTimeIntervalMenu.time}
                            onDismiss={() => setShowTimeIntervalMenu((prev) => ({ ...prev, time: !showTimeIntervalMenu.time }))}
                            anchor={<Button
                                mode="outlined"
                                style={styles.timeButton}
                                onPress={() => setShowTimeIntervalMenu((prev) => ({ ...prev, time: true }))}
                            >
                                <Text style={masterdataStyles.timeText}>{timeInterval > 0 ? `Every ${timeInterval} hours` : 'Select Interval'}</Text>
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

                    {values.timeSlots.map((timeSlot, index) => (
                        <Swipeable
                            key={index}
                            renderRightActions={(dragX: any) =>
                                renderRightActions(dragX, index)
                            }
                        >
                            <View key={index} style={styles.containerTime}>
                                {renderTimeSelection('start', index, timeSlot, hours)}

                                {renderTimeSelection('end', index, timeSlot, hours)}
                            </View>
                        </Swipeable>
                    ))}

                    <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
                        <Button onPress={() => addTimeSlot()} style={styles.addButton}>
                            <Text style={masterdataStyles.timeText}>Add Schedule</Text>
                        </Button>
                    </View>
                </Animated.View>
            ) : shouldRenderTime === "Daily" && !shouldCustom && (
                <Animated.View entering={FadeInLeft} exiting={FadeOutLeft} >
                    {values.timeCustom?.map((timeSlot, index) => (
                        <Swipeable
                            key={index}
                            renderRightActions={(dragX: any) =>
                                renderRightActions(dragX, index, true)
                            }
                        >
                            <View style={styles.containerTime}>
                                {renderTimePicker('start', index, timeSlot)}

                                {renderTimePicker('end', index, timeSlot)}
                            </View>
                        </Swipeable>
                    ))}

                    <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
                        <Button onPress={() => addTimeCustom()} style={styles.addButton}>
                            <Text style={masterdataStyles.timeText}>Add Day</Text>
                        </Button>
                    </View>
                </Animated.View>
            )}

        </GestureHandlerRootView>
    )
})

export default Daily_dialog