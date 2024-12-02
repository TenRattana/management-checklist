import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { View, Text, StyleSheet } from 'react-native';
import { Portal, Dialog, Button } from 'react-native-paper';
import { useTheme } from '../contexts/useTheme';
import '../../styles/Datapicker.css';

const TestComponent = () => {
    const { theme } = useTheme();

    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const togglePicker = () => setIsPickerVisible((prev) => !prev);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
            backgroundColor: theme.colors.background,
        },
        dialog: {
            padding: 16,
            borderRadius: 10,
            backgroundColor: theme.colors.surface,
        },
        dialogTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.primary,
            textAlign: 'center',
            marginBottom: 16,
        },
        datePickerWrapper: {
            marginVertical: 16,
            alignItems: 'center',
        },
        button: {
            backgroundColor: theme.colors.primary,
            padding: 10,
            borderRadius: 5,
            marginTop: 10,
        },
        buttonText: {
            color: theme.colors.background,
            fontWeight: 'bold',
            textAlign: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <Text>Selected Date: {startDate ? startDate.toLocaleString() : 'None'}</Text>

            <Button mode="contained" style={styles.button} onPress={togglePicker}>
                <Text style={styles.buttonText}>Select Date</Text>
            </Button>

            <Portal>
                <Dialog visible={isPickerVisible} onDismiss={togglePicker} style={styles.dialog}>
                    <Dialog.Title style={styles.dialogTitle}>Select Date and Time</Dialog.Title>
                    <View style={styles.datePickerWrapper}>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                                setStartDate(date);
                                togglePicker();
                            }}
                            showTimeSelect
                            dateFormat="dd/MM/yyyy h:mm aa"
                            timeFormat="HH:mm"
                            className="custom-datepicker"
                        />
                    </View>
                    <Dialog.Actions>
                        <Button onPress={togglePicker}>Close</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

export default TestComponent;
