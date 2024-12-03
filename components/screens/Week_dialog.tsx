import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Menu, Icon } from 'react-native-paper';
import useMasterdataStyles from '@/styles/common/masterdata';
import { styles } from './Schedule';
import InfoSchedule_dialog from './InfoSchedule_dialog';
import { Day } from '@/app/screens/layouts/schedule/TimescheduleScreen';

const Week = ["MonDay", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface WeekProps {
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    values: { [key: string]: Day[] };
    setFieldValue: (value: any) => void;
}

const Week_dialog = React.memo(({ theme, spacing, responsive, showError, showSuccess, values, setFieldValue }: WeekProps) => {
    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ custom: boolean, time: boolean, week: boolean }>({ custom: false, time: false, week: false });
    const masterdataStyles = useMasterdataStyles();
    const [showThirDialog, setShowThirDialog] = useState(false)
    const [IndexThirDialo, setIndexThirDialog] = useState("")

    const toggleDaySelection = React.useCallback((day: string) => {
        if (values[day]) {
            const updatedDays = { ...values };
            delete updatedDays[day];
            setFieldValue(updatedDays);
        } else {
            setFieldValue({
                ...values,
                [day]: [{ start: null, end: null }]
            });
        }
    }, [values]);

    const removeDay = React.useCallback((day: string) => {
        const updatedDays = { ...values };
        delete updatedDays[day];
        setFieldValue(updatedDays);
        showSuccess(`Day ${day} removed successfully`);
    }, [values]);

    const setInfoDay = React.useCallback((day: string, index: number) => {
        setShowThirDialog(true);
        setIndexThirDialog(day);
    }, []);

    return (
        <>
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
                            <Text style={masterdataStyles.timeText}>
                                {Object.keys(values).length > 0 ? `Selected: ${Object.keys(values).join(", ")}` : "Select Day"}
                            </Text>
                        </Button>
                    }
                >
                    {Week.map((day, index) => (
                        <Menu.Item
                            key={index}
                            onPress={() => toggleDaySelection(day)}
                            title={`${values[day] ? "✔ " : ""}${day}`}
                            style={styles.menuItem}
                        />
                    ))}
                </Menu>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {Object.keys(values).map((day) => (
                    <View key={day} style={styles.containerWeek}>
                        <View style={styles.containerBoxWeek}>
                            <Text style={[masterdataStyles.textFFF, { textAlign: 'center', padding: 10 }]}>
                                {day}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[masterdataStyles.button, styles.containerIconWeek]}
                            onPress={() => setInfoDay(day, 0)}
                        >
                            <Icon
                                source="information-outline"
                                color={theme.colors.blue}
                                size={spacing.large}
                            />
                            <Text style={[masterdataStyles.text, { paddingLeft: 10 }]}>Info</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => removeDay(day)}
                            style={[masterdataStyles.button, styles.containerIconWeek]}
                        >
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

            <InfoSchedule_dialog
                selectedDay={IndexThirDialo}
                values={values[IndexThirDialo]}
                key={`infoshedule`}
                visible={showThirDialog}
                setVisible={(v) => setShowThirDialog(v)}
                setFieldValue={(value) => setFieldValue({ ...values, [IndexThirDialo]: value })}
                responsive={responsive}
                showError={showError}
                showSuccess={showSuccess}
                spacing={spacing}
                theme={theme}
            />
        </>
    )

});

export default Week_dialog;
