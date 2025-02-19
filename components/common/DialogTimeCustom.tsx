import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Button, Platform, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DatePicker from 'react-datepicker';
import { convertToDate, convertToThaiDateTime } from '../screens/Schedule';
import { formatTime, getCurrentTime } from '@/config/timezoneUtils';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useTheme } from '@/app/contexts/useTheme';
import { Icon, Portal } from 'react-native-paper';
import Text from '../Text';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

const DialogTimeCustom = React.memo(({ visible, setVisible, startTime, endTime, handleStartTimeChanges, handleEndTimeChanges, handleCloseDialog, viewWidth }: {
    visible: boolean, setVisible: (v: boolean) => void, startTime: string, endTime: string, handleStartTimeChanges: (v: string) => void, handleEndTimeChanges: (v: string) => void, handleCloseDialog: () => void, viewWidth: number
}) => {
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const { theme, darkMode } = useTheme();
    const masterdataStyles = useMasterdataStyles();

    const showStartTimePickerHandler = () => {
        setShowStartTimePicker(!showStartTimePicker);
    };

    const showEndTimePickerHandler = () => {
        setShowEndTimePicker(!showEndTimePicker);
    };

    const handleStartTimeChange = (selectedDate: any) => {
        const currentDate = selectedDate || startTime;
        setShowStartTimePicker(false);
        handleStartTimeChanges(convertToThaiDateTime(new Date(currentDate).toISOString()));
    };

    const handleEndTimeChange = (selectedDate: any) => {
        const currentDate = selectedDate || endTime;
        setShowEndTimePicker(false);
        handleEndTimeChanges(convertToThaiDateTime(new Date(currentDate).toISOString()));
    };

    const handleApplyFilters = () => {
        handleCloseDialog();
    };

    const translateX = useSharedValue(visible ? 0 : 220);
    const width = useSharedValue(visible ? 0 : 220);

    const toggleSlide = useCallback(() => {
        translateX.value = withTiming(visible ? 0 : 220, { duration: 300 });
        width.value = withTiming(visible ? (!!showStartTimePicker || !!showEndTimePicker ? 400 : 220) : 0, { duration: 300 });
    }, [visible, translateX, width, showEndTimePicker, showStartTimePicker]);

    useEffect(() => {
        toggleSlide();
    }, [visible, toggleSlide]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
            width: width.value,
        };
    });

    const styles = StyleSheet.create({
        modalOverlay: {
            position: 'absolute',
            flexDirection: 'row',
            right: viewWidth - 20,
            paddingRight: 10,
            paddingVertical: 10,
            borderRadius: 8,
            top: Platform.OS === "web" ? -20 : 20,
            backgroundColor: theme.colors.background,
            ...Platform.select({
                ios: {
                    shadowColor: theme.colors.onBackground,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                },
                android: {
                    elevation: 6,
                },
                web: {
                    boxShadow: `0px 5px 20px ${!darkMode ? 'rgba(0, 0, 0, 0.24)' : 'rgba(193, 214, 255, 0.56)'}`,
                },
            }),
            zIndex: 999,
        },
        modalContainer: {
            backgroundColor: 'white',
            borderRadius: 10,
            width: 220,
        },
        buttonContainer: {
            marginTop: 10,
            flexDirection: 'row',
        },
    });

    const { height } = Dimensions.get('window');

    return (
        <View style={styles.modalOverlay}>
            <TouchableOpacity
                onPress={() => setVisible(!visible)}
                style={{ width: 20, justifyContent: 'center', marginHorizontal: 10, alignContent: 'center', alignSelf: 'center' }}>
                <Icon source={visible ? 'chevron-double-right' : 'chevron-double-left'} size={20} color={theme.colors.error} />
            </TouchableOpacity>

            <Animated.View style={[styles.modalContainer, animatedStyle]}>
                {visible && (
                    <ScrollView
                        style={{ maxHeight: height / 1.7 }}
                    >
                        <Text style={[masterdataStyles.text, masterdataStyles.title, { paddingVertical: 10 }]}>Filter Time</Text>

                        <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 5 }}>
                            <Text style={masterdataStyles.text}>
                                Start Time: {startTime ? startTime : convertToThaiDateTime(new Date(getCurrentTime()).toISOString())}
                            </Text>
                        </View>

                        {Platform.OS === 'web' ? (
                            <>
                                <TouchableOpacity style={[masterdataStyles.button, { backgroundColor: theme.colors.green, width: '70%', paddingHorizontal: 0, marginHorizontal: 0 }]} onPress={showStartTimePickerHandler}>
                                    <Text style={[masterdataStyles.textFFF, { flex: 1 }]}>Start Time</Text>
                                </TouchableOpacity>

                                {showStartTimePicker && (
                                    <View style={{ paddingRight: 10 }}>
                                        <DatePicker
                                            selected={startTime ? convertToDate(String(startTime)) : getCurrentTime()}
                                            onChange={(date) => {
                                                if (date) handleStartTimeChange(date);
                                            }}
                                            maxDate={endTime ? convertToDate(String(endTime)) : getCurrentTime()}
                                            timeInputLabel="Start Time:"
                                            dateFormat="dd/MM/yyyy"
                                            wrapperClassName="custom-datepicker-wrapper"
                                            withPortal
                                            todayButton="Today"
                                            fixedHeight
                                            showYearDropdown
                                            yearDropdownItemNumber={15}
                                            scrollableYearDropdown
                                            showMonthDropdown
                                            dropdownMode="select"
                                            inline
                                        />
                                    </View>
                                )}
                            </>

                        ) : (
                            <>
                                <TouchableOpacity style={[masterdataStyles.button, { backgroundColor: theme.colors.green, width: '70%', paddingHorizontal: 0, marginHorizontal: 0 }]} onPress={showStartTimePickerHandler}>
                                    <Text style={[masterdataStyles.textFFF, { flex: 1 }]}>Start Time</Text>
                                </TouchableOpacity>

                                <DateTimePickerModal
                                    isVisible={showStartTimePicker}
                                    mode="date"
                                    date={startTime ? convertToDate(String(startTime)) : getCurrentTime()}
                                    maximumDate={endTime ? convertToDate(String(endTime)) : getCurrentTime()}
                                    onConfirm={handleStartTimeChange}
                                    onCancel={() => setShowStartTimePicker(false)}
                                />
                            </>
                        )}

                        <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 5 }}>
                            <Text style={masterdataStyles.text}>
                                End Time: {endTime ? endTime : convertToThaiDateTime(new Date(getCurrentTime()).toISOString())}
                            </Text>
                        </View>

                        {Platform.OS === 'web' ? (
                            <>
                                <TouchableOpacity style={[masterdataStyles.button, { backgroundColor: theme.colors.green, width: '70%', paddingHorizontal: 0, marginHorizontal: 0 }]} onPress={showEndTimePickerHandler}>
                                    <Text style={[masterdataStyles.textFFF, { flex: 1 }]}>End Time</Text>
                                </TouchableOpacity>

                                {showEndTimePicker && (
                                    <View style={{ paddingRight: 10 }}>
                                        <DatePicker
                                            selected={endTime ? convertToDate(String(endTime)) : getCurrentTime()}
                                            onChange={(date) => {
                                                if (date) handleEndTimeChange(date);
                                            }}
                                            minDate={startTime ? convertToDate(String(startTime)) : undefined}
                                            maxDate={new Date()}
                                            timeInputLabel="End Time:"
                                            dateFormat="dd/MM/yyyy"
                                            wrapperClassName="custom-datepicker-wrapper"
                                            withPortal
                                            todayButton="Today"
                                            fixedHeight
                                            showYearDropdown
                                            yearDropdownItemNumber={15}
                                            scrollableYearDropdown
                                            showMonthDropdown
                                            dropdownMode="select"
                                            inline
                                        />
                                    </View>
                                )}
                            </>

                        ) : (
                            <>
                                <TouchableOpacity style={[masterdataStyles.button, { backgroundColor: theme.colors.green, width: '70%', paddingHorizontal: 0, marginHorizontal: 0 }]} onPress={showEndTimePickerHandler}>
                                    <Text style={[masterdataStyles.textFFF, { flex: 1 }]}>End Time</Text>
                                </TouchableOpacity>

                                <DateTimePickerModal
                                    isVisible={showEndTimePicker}
                                    mode="date"
                                    minimumDate={startTime ? convertToDate(String(startTime)) : undefined}
                                    maximumDate={new Date()}
                                    date={endTime ? convertToDate(String(endTime)) : getCurrentTime()}
                                    onConfirm={handleEndTimeChange}
                                    onCancel={() => setShowEndTimePicker(false)}
                                />
                            </>
                        )}
                    </ScrollView>
                )}

            </Animated.View>
        </View>
    );
});

export default DialogTimeCustom;
