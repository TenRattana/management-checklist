import React, { useState } from 'react';
import { Platform, View, Text, ScrollView } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import DateTimePickerWeb from 'react-datetime-picker';
import { useTheme } from '@/app/contexts/useTheme';

interface TimeSlot {
    start: Date | null;
    end: Date | null;
}

const Schedule_dialog = ({ dialogVisible, setDialogVisible }: any) => {
    const { theme } = useTheme();
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ start: null, end: null }]);
    const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);

    const handleTimeChange = (date: Date, type: 'start' | 'end') => {
        if (currentIndex !== null) {
            const updatedSlots = [...timeSlots];
            updatedSlots[currentIndex] = {
                ...updatedSlots[currentIndex],
                [type]: date,
            };
            setTimeSlots(updatedSlots);
        }
        setShowTimePicker(null); // ซ่อน TimePicker หลังจากเลือกเวลา
    };

    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { start: null, end: null }]);
    };

    return (
        <Portal>
            <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ width: '50%', alignSelf: 'center', backgroundColor: theme.colors.background }}>
                <Dialog.Title>Add Schedule</Dialog.Title>
                <ScrollView style={{ padding: 20 }}>
                    <Button onPress={addTimeSlot}>Add Start and End Time</Button>

                    {/* แสดงรายการ Start และ End Time */}
                    {timeSlots.map((timeSlot, index) => (
                        <View key={index} style={{ marginBottom: 20 }}>
                            <Text>{`Schedule ${index + 1}`}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Button
                                    onPress={() => {
                                        setShowTimePicker('start');
                                        setCurrentIndex(index);
                                    }}
                                >
                                    {timeSlot.start ? format(timeSlot.start, 'hh:mm a') : 'Select Start Time'}
                                </Button>
                                <Button
                                    onPress={() => {
                                        setShowTimePicker('end');
                                        setCurrentIndex(index);
                                    }}
                                >
                                    {timeSlot.end ? format(timeSlot.end, 'hh:mm a') : 'Select End Time'}
                                </Button>
                            </View>
                        </View>
                    ))}

                    {/* ใช้ DateTimePicker สำหรับ Mobile */}
                    {showTimePicker && (Platform.OS === 'ios' || Platform.OS === 'android') && (
                        <DateTimePicker
                            value={new Date()}
                            mode="time"
                            display="default"
                            onChange={(event, date) => {
                                if (date) handleTimeChange(date, showTimePicker);
                            }}
                        />
                    )}

                    {/* สำหรับ Web ใช้ react-datetime-picker */}
                    {showTimePicker && Platform.OS === 'web' && (
                        <DateTimePickerWeb
                            onChange={(date?: Date | null) => date && handleTimeChange(date, showTimePicker!)}
                            value={new Date()}
                            format="hh:mm a"
                        />
                    )}
                </ScrollView>

                <Dialog.Actions>
                    <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
                    <Button onPress={() => { /* Save Logic */ }}>Save</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default Schedule_dialog;
