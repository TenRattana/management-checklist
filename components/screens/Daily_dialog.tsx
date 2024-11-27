import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, Menu, IconButton, Dialog } from 'react-native-paper';
import { Machine } from '@/typing/type';
import Animated, {
} from 'react-native-reanimated';

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

    return shouldRenderTime === "Daily" && shouldCustom ? (
        <Animated.View style={[{ flex: 1 }]}>

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

            <ScrollView showsVerticalScrollIndicator={false}>
                {values.timeSlots.map((timeSlot, index) => (
                    <View key={index} style={styles.containerTime}>

                        <View style={styles.slotContainer}>
                            <Text style={[masterdataStyles.text]}>Start Time</Text>
                            <Menu
                                visible={showStartMenu === index}
                                onDismiss={() => setShowStartMenu(-1)}
                                anchor={
                                    <Button
                                        mode="outlined"
                                        style={styles.timeButton}
                                        onPress={() => setShowStartMenu(index)}
                                    >
                                        <Text style={styles.timeText}>
                                            {timeSlot.start || 'N/A'}
                                        </Text>
                                    </Button>
                                }
                            >
                                {hours.map((hour, i) => (
                                    <Menu.Item
                                        style={styles.menuItem}
                                        key={i}
                                        onPress={() => handleSelectTime('start', index, hour)}
                                        title={hour}
                                    />
                                ))}
                            </Menu>
                        </View>

                        <View style={styles.slotContainer}>
                            <Text style={[masterdataStyles.text]}>End Time</Text>
                            <Menu
                                visible={showEndMenu === index}
                                onDismiss={() => setShowEndMenu(-1)}
                                anchor={
                                    <Button
                                        mode="outlined"
                                        style={styles.timeButton}
                                        onPress={() => setShowEndMenu(index)}
                                    >
                                        <Text style={styles.timeText}>
                                            {timeSlot.end || 'N/A'}
                                        </Text>
                                    </Button>
                                }
                            >
                                {hours.map((hour, i) => (
                                    <Menu.Item
                                        style={styles.menuItem}
                                        key={i}
                                        onPress={() => handleSelectTime('end', index, hour)}
                                        title={hour}
                                    />
                                ))}
                            </Menu>
                        </View>

                        <IconButton
                            icon="window-close"
                            iconColor={theme.colors.error}
                            size={spacing.large}
                            style={styles.deleteButton}
                            onPress={() => removeTimeSlot(index)}
                            animated
                        />

                    </View>
                ))}
            </ScrollView>

            <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
                <Button onPress={() => addTimeSlot()} style={styles.addButton}>
                    Add Schedule
                </Button>
            </View>
        </Animated.View>
    ) : shouldRenderTime === "Daily" && !shouldCustom && (
        <Animated.View style={[{ flex: 1 }]}>

            <ScrollView showsVerticalScrollIndicator={false}>
                {values.timeSlots.map((timeSlot, index) => (
                    <View key={index} style={styles.containerTime}>

                        <View style={styles.slotContainer}>
                            <Text style={[masterdataStyles.text]}>Start Time</Text>
                            <Menu
                                visible={showStartMenu === index}
                                onDismiss={() => setShowStartMenu(-1)}
                                anchor={
                                    <Button
                                        mode="outlined"
                                        style={styles.timeButton}
                                        onPress={() => setShowStartMenu(index)}
                                    >
                                        <Text style={styles.timeText}>
                                            {timeSlot.start || 'N/A'}
                                        </Text>
                                    </Button>
                                }
                            >
                                {hours.map((hour, i) => (
                                    <Menu.Item
                                        style={styles.menuItem}
                                        key={i}
                                        onPress={() => handleSelectTime('start', index, hour)}
                                        title={hour}
                                    />
                                ))}
                            </Menu>
                        </View>

                        <View style={styles.slotContainer}>
                            <Text style={[masterdataStyles.text]}>End Time</Text>
                            <Menu
                                visible={showEndMenu === index}
                                onDismiss={() => setShowEndMenu(-1)}
                                anchor={
                                    <Button
                                        mode="outlined"
                                        style={styles.timeButton}
                                        onPress={() => setShowEndMenu(index)}
                                    >
                                        <Text style={styles.timeText}>
                                            {timeSlot.end || 'N/A'}
                                        </Text>
                                    </Button>
                                }
                            >
                                {hours.map((hour, i) => (
                                    <Menu.Item
                                        style={styles.menuItem}
                                        key={i}
                                        onPress={() => handleSelectTime('end', index, hour)}
                                        title={hour}
                                    />
                                ))}
                            </Menu>
                        </View>

                        <IconButton
                            icon="window-close"
                            iconColor={theme.colors.error}
                            size={spacing.large}
                            style={styles.deleteButton}
                            onPress={() => removeTimeSlot(index)}
                            animated
                        />

                    </View>
                ))}
            </ScrollView>

            <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
                <Button onPress={() => addTimeSlot()} style={styles.addButton}>
                    Add Schedule
                </Button>
            </View>
        </Animated.View>

    )
})

export default Daily_dialog