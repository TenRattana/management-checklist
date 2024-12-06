import { Platform, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Animated, { Extrapolate, interpolate, runOnJS } from 'react-native-reanimated'
import { Button, Dialog, HelperText, IconButton, Portal } from 'react-native-paper'
import useMasterdataStyles from '@/styles/common/masterdata';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { convertToDate, convertToThaiDateTime, styles } from './Schedule';
import { SharedValue } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/reanimatedWrapper';
import { getCurrentTime } from '@/config/timezoneUtils';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"
import { FormikErrors, FormikTouched } from 'formik';

interface Custom_scheduleProps {
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    setFieldValue: (value: any) => void;
    values: { start: string | null, end: string | null }[];
    touched: boolean | undefined;
    errors?: string | string[] | FormikErrors<{
        start: string | null;
        end: string | null;
    }>[] | undefined;
}

const Custom_schedule_dialog = React.memo(({ showError, showSuccess, spacing, setFieldValue, values, theme, touched, errors }: Custom_scheduleProps) => {
    const masterdataStyles = useMasterdataStyles();
    const [isPickerVisible, setPickerVisible] = useState<{ start: boolean; end: boolean }[]>([]);
    const [isTimePickerVisible, setTimePickerVisible] = useState<{ start: boolean; end: boolean }[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>()

    const ref = useRef<any>(null);

    useEffect(() => {
        if (values?.length > isPickerVisible.length) {
            const newPickers = values.map((_, index) =>
                isPickerVisible[index] || { start: false, end: false }
            );
            setPickerVisible(newPickers);

            const newTimePickers = values.map((_, index) =>
                isTimePickerVisible[index] || { start: false, end: false }
            );
            setTimePickerVisible(newTimePickers);
        }
    }, [values, isPickerVisible, isTimePickerVisible]);

    const addTimeCustom = React.useCallback(() => {
        if (values?.some(custom => !custom.start || !custom.end)) {
            showError("Please complete all time custom before adding a new one.");
            return;
        }

        try {
            const newTimeCustom = [...values, { start: null, end: null }];
            setFieldValue(newTimeCustom);

            showSuccess("New time custom added successfully!");
        } catch (error) {
            showError("An error occurred while adding a new time custom.");
        }
    }, [values, setFieldValue]);

    const removeTimeCustom = useCallback((index: number) => {
        if (values.length <= 0) {
            showError("You must have at least one time custom.");
            return;
        }
        setFieldValue(values.filter((_, i) => i !== index));
        showSuccess(`Time custom at position ${index + 1} removed successfully!`);
    }, [setFieldValue, values]);

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
                        onPress={() => removeTimeCustom(index)}
                    />
                </Animated.View>
            </View>
        );
    }

    const togglePicker = useCallback((index: number, type: "start" | "end", visible: boolean) => {
        setPickerVisible(isPickerVisible.map((v, i) => i === index ? { ...v, [type]: visible } : v))

        Platform.OS === "web" && setTimeout(() => { ref.current && ref.current.setOpen(true, true) }, 0)
    }, [isPickerVisible]);

    const toggleTimePicker = useCallback((index: number, type: "start" | "end", visible: boolean) => {

        setTimePickerVisible(isTimePickerVisible.map((v, i) => i === index ? { ...v, [type]: visible } : v));
    }, [isTimePickerVisible])

    const handleTimeChange = useCallback(async (index: number, type: "start" | "end", selectedTime?: Date, isTime?: boolean) => {

        if (Platform.OS === "web") {
            let formattedDate = "";

            if (selectedTime) {
                formattedDate = `${convertToThaiDateTime(selectedTime.toISOString(), true)}`;
                const newState = [...values];
                newState[index] = { ...newState[index], [type]: formattedDate };

                setFieldValue(newState);
            }
        } else {
            const currentValues = values?.[index]?.[type] || null;

            let updatedDate;
            let formattedDate = "";

            if (isTime && currentValues) {

                const existingDate = convertToDate(currentValues);

                if (existingDate && selectedTime) {
                    updatedDate = new Date(existingDate.setHours(selectedTime.getHours(), selectedTime.getMinutes()));
                    formattedDate = convertToThaiDateTime(updatedDate.toISOString(), true);

                    if (formattedDate !== values[index]?.[type]) {
                        const newState = [...values];
                        newState[index] = { ...newState[index], [type]: formattedDate };

                        runOnJS(setFieldValue)(newState);
                    }

                    showSuccess('Date and Time selected successfully!');
                    toggleTimePicker(index, type, false);
                }
            } else {
                togglePicker(index, type, false);

                if (selectedTime) {
                    updatedDate = new Date(selectedTime.setHours(
                        currentValues ? new Date(currentValues).getHours() : 0,
                        currentValues ? new Date(currentValues).getMinutes() : 0
                    ));
                    formattedDate = convertToThaiDateTime(updatedDate.toISOString());

                    if (formattedDate !== values[index]?.[type]) {
                        const newState = [...values];
                        newState[index] = { ...newState[index], [type]: formattedDate };

                        setFieldValue(newState);
                    }
                    toggleTimePicker(index, type, true);
                    showSuccess('Date and Time selected successfully!');
                }
            }
        }
    }, [values]);

    const CustomInput = React.forwardRef<any, any>(({ onClick, show }, ref) => (
        <Button
            mode="outlined"
            style={{ display: 'none' }}
            onPress={onClick}
        >
            <Text style={masterdataStyles.timeText}>
                {show || 'N/A'}
            </Text>
        </Button>
    ));

    const renderTimePicker = (type: "start" | "end", index: number, timeSlot: { start: string | null; end: string | null; }) => {
        const showDate = timeSlot[type] ? convertToDate(String(timeSlot[type])) : getCurrentTime()

        return (
            <View style={styles.slotContainer}>
                <Text style={[masterdataStyles.text]}>{type === 'start' ? "Start Day" : "End Day"}</Text>
                {Platform.OS === 'android' || Platform.OS === 'ios' ? (
                    <>
                        {isPickerVisible[index]?.[type] && (
                            <RNDateTimePicker
                                value={showDate}
                                onChange={(event, selectedDate) => event.type === "set" ? handleTimeChange(index, type, selectedDate) : togglePicker(index, type, false)}
                                is24Hour={true}
                                mode='date'
                                display="default"
                            />
                        )}
                        {isTimePickerVisible[index]?.[type] && (
                            <RNDateTimePicker
                                value={showDate}
                                onChange={(event, selectedDate) => event.type === "set" ? handleTimeChange(index, type, selectedDate, true) : toggleTimePicker(index, type, false)}
                                mode='time'
                                minuteInterval={10}
                                is24Hour={true}
                                display="default"
                            />
                        )}
                    </>
                ) : Platform.OS === "web" && isPickerVisible[index]?.[type] && (
                    <Portal>
                        <Dialog
                            visible={isPickerVisible[index]?.[type]}
                            onDismiss={() => togglePicker(index, type, false)}
                            style={{ width: 0, justifyContent: 'center', alignSelf: 'center', marginTop: -300 }}
                        >
                            <DatePicker
                                selected={selectedDate ?? showDate}
                                onChange={(date) => {
                                    if (date) {
                                        setSelectedDate(date);
                                    }
                                }}
                                showTimeInput
                                timeInputLabel="Start Time:"
                                dateFormat="dd/MM/yyyy h:mm aa"
                                wrapperClassName="custom-datepicker-wrapper"
                                shouldCloseOnSelect={false}
                                ref={ref}
                                customInput={<CustomInput show={timeSlot[type]} />}
                            >

                                <Button
                                    mode="text"
                                    onPress={() => togglePicker(index, type, false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        if (selectedDate) {
                                            handleTimeChange(index, type, selectedDate);
                                            togglePicker(index, type, false);
                                        }
                                    }}
                                >
                                    Confirm
                                </Button>
                            </DatePicker>
                        </Dialog>
                    </Portal>
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
        )
    }

    return (
        <GestureHandlerRootView>
            {values?.map((custom, index) => {
                return (
                    <Swipeable
                        key={index}
                        renderRightActions={(dragX: any) =>
                            renderRightActions(dragX, index)
                        }
                    >
                        <View key={`container-${index}`} style={styles.containerTime}>
                            {renderTimePicker('start', index, custom)}

                            {renderTimePicker('end', index, custom)}
                        </View>

                        <HelperText
                            type="error"
                            visible={Boolean(touched) && Boolean(errors?.[index])}
                            style={[{ display: touched && !Array.isArray(errors?.[index]) && typeof errors?.[index] === 'string' && errors[index] ? 'flex' : 'none' }, masterdataStyles.errorText]}
                        >
                            {!Array.isArray(errors?.[index]) && typeof errors?.[index] === 'string' && errors[index] && errors?.[index] as string}
                        </HelperText>

                    </Swipeable>
                )
            })}

            <View style={{ marginHorizontal: 24, marginVertical: 10 }}>
                <Button onPress={() => addTimeCustom()} style={styles.addButton}>
                    <Text style={masterdataStyles.timeText}>Custom</Text>
                </Button>
            </View>
        </GestureHandlerRootView>
    )
})

export default Custom_schedule_dialog