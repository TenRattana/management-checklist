import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Menu, Icon } from 'react-native-paper';
import useMasterdataStyles from '@/styles/common/masterdata';
import { styles } from './Schedule';
import InfoSchedule_dialog from './InfoSchedule_dialog';
import { FormikErrors, FormikTouched } from 'formik';

const Week = ["MonDay", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface WeekProps {
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    selectedDays: { [key: string]: { start: string | null, end: string | null }[] };
    setSelectedDays: (value: { [key: string]: { start: string | null, end: string | null }[] }) => void;
    setFieldValue: (value: any) => void;
    touched?: FormikTouched<{
        [key: string]: {
            start: string | null;
            end: string | null;
        }[];
    }> | undefined;
    errors?: FormikErrors<{
        [key: string]: {
            start: string | null;
            end: string | null;
        }[];
    }> | undefined
}

const Week_dialog = React.memo(({ theme, spacing, responsive, showError, showSuccess, selectedDays, setSelectedDays, setFieldValue, touched, errors }: WeekProps) => {
    const [showTimeIntervalMenu, setShowTimeIntervalMenu] = useState<{ custom: boolean, time: boolean, week: boolean }>({ custom: false, time: false, week: false });
    const masterdataStyles = useMasterdataStyles();
    const [showThirDialog, setShowThirDialog] = useState(false)
    const [IndexThirDialo, setIndexThirDialog] = useState("")

    const toggleDaySelection = React.useCallback((day: string) => {
        if (selectedDays[day]) {
            const updatedDays = { ...selectedDays };
            delete updatedDays[day];
            setSelectedDays(updatedDays);
        } else {
            setSelectedDays({
                ...selectedDays,
                [day]: [{ start: null, end: null }]
            });
        }
    }, [selectedDays]);

    const removeDay = React.useCallback((day: string) => {
        const updatedDays = { ...selectedDays };
        delete updatedDays[day];
        setSelectedDays(updatedDays);
        showSuccess(`Day ${day} removed successfully`);
    }, [selectedDays]);

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
                                {Object.keys(selectedDays).length > 0 ? `Selected: ${Object.keys(selectedDays).join(", ")}` : "Select Day"}
                            </Text>
                        </Button>
                    }
                >
                    {Week.map((day, index) => (
                        <Menu.Item
                            key={index}
                            onPress={() => toggleDaySelection(day)}
                            title={`${selectedDays[day] ? "✔ " : ""}${day}`}
                            style={styles.menuItem}
                        />
                    ))}
                </Menu>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {Object.keys(selectedDays).map((day) => (
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
                values={selectedDays[IndexThirDialo]}
                key={`infoshedule`}
                visible={showThirDialog}
                setVisible={(v) => setShowThirDialog(v)}
                setFieldValue={(value) => setFieldValue({ ...selectedDays, [IndexThirDialo]: value })}
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
