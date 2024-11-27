import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Dialog, Portal, Divider, IconButton, Menu, Button, Paragraph, Text } from 'react-native-paper';
import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useCallback, useState } from 'react'

interface InfoScheduleProps {
    visible: boolean;
    setVisible: (v: boolean) => void;
    setFieldValue: (field: string, value: any) => void;
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
}

const Hours = [1, 2, 3, 4, 6, 12]


const InfoSchedule_dialog = React.memo(({ visible, setVisible, setFieldValue, theme, responsive, spacing, showError, showSuccess }: InfoScheduleProps) => {

    const masterdataStyles = useMasterdataStyles();
    const [timeInterval, setTimeInterval] = useState<number>(0)
    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ custom: boolean, time: boolean, week: boolean }>({ custom: false, time: false, week: false });

    const styles = StyleSheet.create({
        container: {
            width: responsive === 'large' ? 800 : responsive === 'medium' ? '80%' : '80%',
            alignSelf: 'center',
            backgroundColor: theme.colors.background,
            overflow: 'hidden',
        },
        containerTime: {
            marginVertical: 10,
            marginHorizontal: 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        timeText: {
            textAlign: 'center',
        },
        addButton: {
            marginVertical: 5,
        },
        slotContainer: {
            marginHorizontal: '4%',
            flexBasis: '38%',
        },
        label: {
            marginHorizontal: 24,
            marginVertical: 10,
            fontSize: spacing.small,
            marginBottom: 10,
        },
        timeButton: {
            marginVertical: 5,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 6,
        },
        deleteButton: {
            flex: 1,
            justifyContent: 'center',
            alignSelf: 'center',
            // top: '20%',
            alignContent: 'center',
            alignItems: 'center',
            // marginTop: 10,
        },
        timeIntervalMenu: {
            marginHorizontal: 24,
            marginBottom: 10,
        },
        menuItem: {
            width: 200,
        },
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

    return (
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={{ zIndex: 2, width: 500, justifyContent: 'center', alignSelf: 'center' }}>
            <Dialog.Title>Week Dialog</Dialog.Title>
            <Dialog.Content>
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
                            <Text style={styles.timeText}>{timeInterval > 0 ? `Every ${timeInterval} hours` : 'Select Interval'}</Text>
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
                <Paragraph>This is the second dialog inside the first dialog.</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => setVisible(false)} >
                    <Text style={masterdataStyles.text}>Close</Text>
                </Button>
            </Dialog.Actions>
        </Dialog>
    )
})

export default InfoSchedule_dialog
