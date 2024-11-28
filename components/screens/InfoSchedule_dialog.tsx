import React, { forwardRef, useCallback, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Dialog, Button, Text } from 'react-native-paper';
import DatePicker from 'react-datepicker';
import useMasterdataStyles from '@/styles/common/masterdata';
import { Machine } from '@/typing/type';
import RNDateTimePicker from '@react-native-community/datetimepicker';

interface InfoScheduleProps {
    visible: boolean;
    setVisible: (v: boolean) => void;
    setFieldValue: (field: string, value: any) => void;
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    values: {
        ScheduleName: string;
        MachineGroup: string;
        Machine: Machine[];
        timeSlots: { start: string | null; end: string | null }[];
    };
    shouldCustom: boolean | string;
    shouldRenderTime: string;
}

const InfoScheduleDialog: React.FC<InfoScheduleProps> = React.memo(({
    visible,
    setVisible,
    setFieldValue,
    showError,
    showSuccess,
    values,
    theme
}) => {
    const masterdataStyles = useMasterdataStyles();
    const [timeInterval, setTimeInterval] = useState<number>(0);
    const [date, setDate] = useState<Date | null>(null);
    const [isPickerVisible, setPickerVisible] = useState<boolean>(false);

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setPickerVisible(!isPickerVisible);
        if (selectedTime) {
            setDate(selectedTime);
            setFieldValue('selectedTime', selectedTime.toTimeString().split(' ')[0]);
            showSuccess('Time selected successfully!');
        } else {
            showError('Time selection was cancelled.');
        }
    };

    const handleGenerateSchedule = useCallback(() => {
        if (timeInterval <= 0 || timeInterval > 24) {
            showError('Time interval must be between 1 and 24 hours.');
            return;
        }

        try {
            const generatedSlots = [];
            for (let i = 0; i < 24; i += timeInterval) {
                const endHour = i + timeInterval;
                if (endHour > 24) break;

                generatedSlots.push({
                    start: `${i.toString().padStart(2, '0')}:00`,
                    end: `${endHour.toString().padStart(2, '0')}:00`,
                });
            }

            if (generatedSlots.length === 0) {
                showError('No time slots could be generated. Adjust the time interval.');
                return;
            }

            setFieldValue('timeSlots', generatedSlots);
            setTimeInterval(timeInterval);
            showSuccess('Schedule generated successfully!');
        } catch (error) {
            showError('An unexpected error occurred while generating the schedule.');
        }
    }, [timeInterval, setFieldValue, showError, showSuccess]);

    const CustomInput = forwardRef<View, any>(({ value, onClick }, ref) => (
        <Button
            mode="contained"
            onPress={onClick}
            ref={ref}
            style={styles.addButton}
        >
            {value || 'Select Date'}
        </Button>
    ));

    return (
        <Dialog
            visible={visible}
            onDismiss={() => setVisible(false)}
            style={[styles.dialog, { backgroundColor: theme.colors.background, borderRadius: 8 }]}
        >
            <Dialog.Title>Create Info Schedule</Dialog.Title>

            {Platform.OS === 'android' || Platform.OS === 'ios' ? (
                <>
                    {isPickerVisible && (
                        <RNDateTimePicker
                            value={date ?? new Date()}
                            onChange={handleTimeChange}
                            is24Hour={true}
                        />
                    )}
                </>
            ) : (
                <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
                    <DatePicker
                        selected={date}
                        onChange={(newDate: Date | null) => newDate && setDate(newDate)}
                        withPortal
                        portalId="root-portal"
                        showTimeInput
                        timeInputLabel="Time:"
                        customInput={<CustomInput />}
                    />
                </View>
            )}

            <Dialog.Actions>
                <Button onPress={() => { setVisible(false); setPickerVisible(false) }}>
                    <Text style={masterdataStyles.text}>Close</Text>
                </Button>
            </Dialog.Actions>
        </Dialog>
    );
});

const styles = StyleSheet.create({
    dialog: {
        zIndex: 2,
        width: 500,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    webContainer: {
        marginHorizontal: 24,
        marginBottom: 20,
    },
    addButton: {
        marginVertical: 5,
    },
})

export default InfoScheduleDialog;
