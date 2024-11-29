import { Platform, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Animated, { Extrapolate, FadeInLeft, FadeOutLeft, interpolate, Easing } from 'react-native-reanimated'
import { Button, Dialog, IconButton, Portal } from 'react-native-paper'
import useMasterdataStyles from '@/styles/common/masterdata';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { convertToDate, convertToThaiDateTime, styles } from './Schedule';
import { SharedValue } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/reanimatedWrapper';
import { getCurrentTime } from '@/config/timezoneUtils';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';

interface Custom_scheduleProps {
    theme: any;
    spacing: any;
    responsive: any;
    shouldCustom: boolean | string;
    shouldRenderTime: string;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
}

const Custom_schedule_dialog = React.memo(({ shouldRenderTime, shouldCustom, showError, showSuccess, spacing, theme }: Custom_scheduleProps) => {
    const masterdataStyles = useMasterdataStyles();
    const [isPickerVisible, setPickerVisible] = useState<{ start: boolean; end: boolean }[]>([{ start: false, end: false }]);
    const [isTimePickerVisible, setTimePickerVisible] = useState<{ start: boolean; end: boolean }[]>([{ start: false, end: false }]);
    const [timeCustom, setTimeCustom] = useState<{ start: string | null; end: string | null }[]>([{ start: null, end: null }])

    FadeInLeft.duration(300).easing(Easing.ease);
    FadeOutLeft.duration(300).easing(Easing.ease);

    const addTimeCustom = React.useCallback(() => {
        if (timeCustom?.some(custom => !custom.start || !custom.end)) {
            showError("Please complete all time custom before adding a new one.");
            return;
        }
        setTimeCustom([...timeCustom, { start: null, end: null }]);


        setPickerVisible((prevVisible) => [...prevVisible, { start: false, end: false }]);
        setTimePickerVisible((prevVisible) => [...prevVisible, { start: false, end: false }]);
        showSuccess("New time custom added successfully!");
    }, [setTimeCustom, timeCustom]);

    const removeTimeCustom = React.useCallback((index: number) => {
        if (timeCustom.length <= 0) {
            showError("You must have at least one time custom.");
            return;
        }
        setTimeCustom(timeCustom.filter((_, i) => i !== index));

        showSuccess(`Time custom at position ${index + 1} removed successfully!`);
    }, [setTimeCustom, timeCustom]);

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
                        onPress={() => removeTimeCustom(index)}
                    />
                </Animated.View>
            </View>
        );
    }

    const togglePicker = useCallback((index: number, type: "start" | "end", visible: boolean) => {
        setPickerVisible(isPickerVisible.map((v, i) => i === index ? { ...v, [type]: visible } : v));
    }, [isPickerVisible]);

    const toggleTimePicker = useCallback((index: number, type: "start" | "end", visible: boolean) => {
        setTimePickerVisible(isTimePickerVisible.map((v, i) => i === index ? { ...v, [type]: visible } : v));
    }, [isTimePickerVisible])


    const handleTimeChange = useCallback((index: number, type: "start" | "end", selectedTime?: Date, isTime?: boolean) => {

        const currentValues = timeCustom?.[index]?.[type] || null;

        let updatedDate;
        let formattedDate = "";

        if (isTime && currentValues) {
            const existingDate = convertToDate(currentValues);

            if (existingDate && selectedTime) {
                updatedDate = new Date(existingDate.setHours(selectedTime.getHours(), selectedTime.getMinutes()));
                formattedDate = convertToThaiDateTime(updatedDate.toISOString(), true);
            }

            if (formattedDate !== timeCustom[index]?.[type]) {
                setTimeCustom(prevState => {
                    const newState = [...prevState];
                    newState[index] = { ...newState[index], [type]: formattedDate };
                    return newState;
                });
            }

            showSuccess('Date and Time selected successfully!');
            toggleTimePicker(index, type, false);
        } else {
            if (selectedTime) {
                updatedDate = new Date(selectedTime.setHours(
                    currentValues ? new Date(currentValues).getHours() : 0,
                    currentValues ? new Date(currentValues).getMinutes() : 0
                ));
                formattedDate = convertToThaiDateTime(updatedDate.toISOString());

                if (formattedDate !== timeCustom[index]?.[type]) {
                    setTimeCustom(prevState => {
                        const newState = [...prevState];
                        newState[index] = { ...newState[index], [type]: formattedDate };
                        return newState;
                    });
                }

                showSuccess('Date and Time selected successfully!');
            }

            togglePicker(index, type, false);
            toggleTimePicker(index, type, true);
        }

    }, [timeCustom]);


    const renderTimePicker = (type: "start" | "end", index: number, timeSlot: { start: string | null; end: string | null; }) => {
        const showDate = timeSlot[type] ? convertToDate(timeSlot[type]) : getCurrentTime()

        return (
            <View style={styles.slotContainer}>
                <Text style={[masterdataStyles.text]}>{type === 'start' ? "Start Day" : "End Day"}</Text>
                {Platform.OS === 'android' || Platform.OS === 'ios' ? (
                    <>
                        {isPickerVisible[index]?.[type] && (
                            <RNDateTimePicker
                                value={showDate}
                                onChange={(event, selectedDate) => event.type === "set" && handleTimeChange(index, type, selectedDate)}
                                is24Hour={true}
                                mode='date'
                                display="default"
                            />
                        )}
                        {isTimePickerVisible[index]?.[type] && (
                            <RNDateTimePicker
                                value={showDate}
                                onChange={(event, selectedDate) => event.type === "set" && handleTimeChange(index, type, selectedDate, true)}
                                mode='time'
                                minuteInterval={10}
                                is24Hour={true}
                                display="default"
                            />
                        )}
                    </>
                ) : Platform.OS === "web" && (
                    <>
                        <Portal>
                            <Dialog
                                visible={isPickerVisible[index]?.[type]}
                                onDismiss={() => togglePicker(index, type, false)}
                                style={[styles.dialog, { backgroundColor: theme.colors.background, borderRadius: 8 }]}
                            >
                                <DatePicker
                                    selected={showDate}
                                    onChange={(newDate) => newDate && handleTimeChange(index, type, newDate)}
                                    showTimeInput
                                    timeInputLabel="Time:"
                                    dateFormat="dd/MM/yyyy h:mm aa"
                                />
                            </Dialog>
                        </Portal>
                    </>
                )}

                <Button
                    mode="outlined"
                    style={styles.timeButton}
                    onPress={() => togglePicker(index, type, true)}
                >
                    <Text style={masterdataStyles.timeText}>
                        {timeSlot[type] ? timeSlot[type] : 'N/A'}
                    </Text>
                </Button>
            </View>
        )
    }

    return (
        <GestureHandlerRootView style={{ display: shouldRenderTime === "Daily" && !shouldCustom ? 'flex' : 'none' }}>
            <Animated.View entering={FadeInLeft} exiting={FadeOutLeft} >
                {timeCustom?.map((custom, index) => {
                    return (
                        <Swipeable
                            key={index}
                            renderRightActions={(dragX: any) =>
                                renderRightActions(dragX, index, true)
                            }
                        >
                            <View key={`container-${index}`} style={styles.containerTime}>
                                {renderTimePicker('start', index, custom)}

                                {renderTimePicker('end', index, custom)}
                            </View>
                        </Swipeable>
                    )
                })}

                <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
                    <Button onPress={() => addTimeCustom()} style={styles.addButton}>
                        <Text style={masterdataStyles.timeText}>Add Day</Text>
                    </Button>
                </View>
            </Animated.View>
        </GestureHandlerRootView>
    )
})

export default Custom_schedule_dialog