import useMasterdataStyles from '@/styles/common/masterdata';
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Menu, Icon } from 'react-native-paper';
import * as Yup from 'yup'
import Animated, { Easing, FadeInLeft, FadeOutLeft } from 'react-native-reanimated';
import { styles } from './Schedule';

const Week = ["Mon", "The", "Wed", "Thu", "Fri", "Sat", "Sun"]
interface WeekProps {
    shouldRenderTime: string;
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    setShowThirDialog: (v: boolean) => void;
}

const Week_dialog = React.memo(({ shouldRenderTime, theme, spacing, responsive, showError, showSuccess, setShowThirDialog }: WeekProps) => {

    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ custom: boolean, time: boolean, week: boolean }>({ custom: false, time: false, week: false });
    const masterdataStyles = useMasterdataStyles();
    const [indexThirDialog, setIndexThirDialog] = useState<number | undefined>()
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    FadeOutLeft.duration(300).easing(Easing.ease);
    FadeInLeft.duration(300).easing(Easing.ease);

    const validationSchema = Yup.object().shape({
        ScheduleName: Yup.string().required('Schedule name is required'),
        Machine: Yup.array().min(1, 'Select at least one machine'),
        timeSlots: Yup.array()
            .of(
                Yup.object().shape({
                    start: Yup.string().required('Start time is required'),
                    end: Yup.string().required('End time is required'),
                })
            )
            .min(1, 'At least one time slot is required'),
    });

    const removeDay = React.useCallback((index: number) => {
        setSelectedDays(selectedDays.filter((_, i) => i !== index))
        showSuccess(`Day slot at position ${index + 1} removed successfully`)
    }, [selectedDays])

    const setInfoDay = React.useCallback((index: number) => {
        setShowThirDialog(true)
        setIndexThirDialog(index)
    }, [])

    const toggleDaySelection = React.useCallback((day: string) => {
        console.log(selectedDays.includes(day));

        if (selectedDays.includes(day)) {
            setSelectedDays((prev) => prev.filter((d) => d !== day));
        } else {
            setSelectedDays((prev) => [...prev, day]);
        }
    }, [selectedDays]);

    return shouldRenderTime === "Weekly" && (
        <Animated.View entering={FadeInLeft} exiting={FadeOutLeft}>

            <View style={styles.timeIntervalMenu}>
                <Menu
                    visible={showTimeIntervalMenu.week}
                    onDismiss={() => setShowTimeIntervalMenu((prev) => ({ ...prev, week: false }))}
                    anchor={
                        <Button
                            mode="outlined"
                            style={styles.timeButton}
                            onPress={() => setShowTimeIntervalMenu((prev) => ({ ...prev, week: true }))}
                        >
                            <Text style={masterdataStyles.timeText}>{selectedDays.length > 0 ? `Selected: ${selectedDays.join(", ")}` : "Select Day"}</Text>
                        </Button>
                    }
                >
                    {Week.map((day, index) => (
                        <Menu.Item
                            key={index}
                            onPress={() => toggleDaySelection(day)}
                            title={`${selectedDays.includes(day) ? "✔ " : ""}${day}`}
                            style={styles.menuItem}
                        />
                    ))}
                </Menu>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {selectedDays.map((timeSlot, index) => (
                    <View key={index} style={styles.containerWeek}>

                        <View style={styles.containerBoxWeek}>
                            <Text style={[masterdataStyles.textFFF, { textAlign: 'center', padding: 10 }]}>
                                {`${timeSlot}Day` || 'N/A'}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                masterdataStyles.button,
                                styles.containerIconWeek
                            ]}
                            onPress={() => setInfoDay(index)}>
                            <Icon
                                source="information-outline"
                                color={theme.colors.blue}
                                size={spacing.large}
                            />
                            <Text style={[masterdataStyles.text, { paddingLeft: 10 }]}>Info</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                removeDay(index)}
                            style={[
                                masterdataStyles.button,
                                styles.containerIconWeek
                            ]}>
                            <Icon
                                source="window-close"
                                color={theme.colors.error}
                                size={spacing.large}
                            />
                            <Text style={[masterdataStyles.text, { paddingLeft: 10 }]}>Delete</Text>
                        </TouchableOpacity>

                    </View>
                ))}
            </ScrollView>
        </Animated.View>
    )
})

export default Week_dialog