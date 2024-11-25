import React, { useState, useRef, useCallback } from 'react';
import { Animated, View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { IconButton, Button, Surface } from 'react-native-paper';
import Schedule_dialog from '@/components/screens/Schedule_dialog';
import { format } from 'date-fns';
import { Text } from '@/components';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useToast } from '@/app/contexts/useToast';
import { useTheme } from '@/app/contexts/useTheme'
import { useRes } from '@/app/contexts/useRes'

const TimescheduleScreen = React.memo(() => {
    const { theme } = useTheme();
    const { spacing } = useRes();
    const animationValue = useRef(new Animated.Value(300)).current;
    const masterdataStyles = useMasterdataStyles();
    const { showError } = useToast()
    const [schedules, setSchedules] = useState<Array<{ id: string; startTime: Date; endTime: Date }>>([]);
    const [newStartTime, setNewStartTime] = useState<Date | null>(null);
    const [newEndTime, setNewEndTime] = useState<Date | null>(null);
    const [showTimePicker, setShowTimePicker] = useState<{ type: 'start' | 'end' | null }>({ type: null });
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleTimeChange = (date: Date, type: 'start' | 'end') => {
        if (type === 'start') {
            setNewStartTime(date);
        } else if (type === 'end') {
            if (newStartTime && date <= newStartTime) {
                showError('End Time must be after Start Time!');
                return;
            }
            setNewEndTime(date);
        }
        setShowTimePicker({ type: null });
    };

    const addSchedule = () => {
        if (!newStartTime || !newEndTime) {
            alert('Please set both Start and End Times');
            return;
        }
        const id = `${newStartTime}-${newEndTime}-${Date.now()}`;
        setSchedules([...schedules, { id, startTime: newStartTime, endTime: newEndTime }]);
        setNewStartTime(null);
        setNewEndTime(null);
        setDialogVisible(false);
    };

    const removeSchedule = (id: string) => {
        setSchedules((prevSchedules) => prevSchedules.filter((schedule) => schedule.id !== id));
    };

    const styles = StyleSheet.create({
        toggleButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            marginHorizontal: 10,
            backgroundColor: '#fff',
        },
        addButtonContainer: {
            flexBasis: '30%',
            alignItems: 'center',
            marginVertical: 10,
            marginHorizontal: 10,
        },
        addButton: {
            width: '90%',
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: theme.colors.drag,
            alignContent: 'center',
            alignItems: 'center'
        },
        scheduleItem: {
            padding: 16,
            marginVertical: 5,
            borderRadius: 8,
            backgroundColor: '#f9f9f9',
        },
        scheduleText: {
            fontSize: 16,
            fontWeight: '500',
            color: '#333',
        },
    });

    return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.colors.background }}>
            <View style={{ flex: 1, flexBasis: '70%', }}>
                <Animated.View style={{
                    height: animationValue, overflow: 'hidden', marginHorizontal: 10, borderRadius: 8, marginVertical: 5
                }}>
                </Animated.View>

                <FlatList
                    data={schedules}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Surface style={[styles.scheduleItem, { backgroundColor: theme.colors.surface }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={[styles.scheduleText, { color: theme.colors.onSurface }]}>
                                        {`Start: ${format(item.startTime, 'hh:mm a')}`}
                                    </Text>
                                    <Text style={[styles.scheduleText, { color: theme.colors.onSurface }]}>
                                        {`End: ${format(item.endTime, 'hh:mm a')}`}
                                    </Text>
                                </View>
                                <IconButton
                                    icon="delete"
                                    size={24}
                                    onPress={() => removeSchedule(item.id)}
                                    iconColor={theme.colors.error}
                                />
                            </View>
                        </Surface>
                    )}
                    contentContainerStyle={{ padding: 10 }}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    style={{ flex: 1, width: '100%' }}
                />

            </View>

            <View style={styles.addButtonContainer}>
                <TouchableOpacity
                    onPress={() => setDialogVisible(true)}
                    style={styles.addButton}
                >
                    <Text style={masterdataStyles.textFFF}>Add New Schedule</Text>
                </TouchableOpacity>
            </View>
            <Schedule_dialog
                addSchedule={addSchedule}
                dialogVisible={dialogVisible}
                handleTimeChange={handleTimeChange}
                setDialogVisible={(value: boolean) => setDialogVisible(value)}
                // initialValues={}
                // machine={}
                // saveData={}
                key={"schedule_dialog"}
            />
        </View>
    );
});

export default TimescheduleScreen;
