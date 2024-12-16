import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { HelperText, Button, Text } from 'react-native-paper';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DatePicker from 'react-datepicker';
import "@/styles/Datapicker.css";
import useMasterdataStyles from '@/styles/common/masterdata';
import { useTheme } from '@/app/contexts/useTheme';
import { convertToDate, convertToThaiDateTime } from '../screens/Schedule';
import { getCurrentTime } from '@/config/timezoneUtils';
import { runOnJS } from 'react-native-reanimated';

const Time: React.FC<any> = ({ placeholder, label, error, errorMessage, value, handleChange, handleBlur, hint }) => {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const { theme } = useTheme();
    const masterdataStyles = useMasterdataStyles();

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date: Date) => {
        runOnJS(handleChange)(convertToThaiDateTime(new Date(date).toISOString(), true));
        hideDatePicker()
    };

    const CustomInput = React.forwardRef<any, any>(({ onClick, value }, ref) => (
        <Button
            mode='outlined'
            style={{ borderRadius: 8, backgroundColor: theme.colors.background }}
            onPress={onClick}
        >
            <Text style={masterdataStyles.timeText}>
                {value || 'N/A'}
            </Text>
        </Button>
    ));

    return (
        <View style={{ margin: 20 }}>
            {Platform.OS === 'android' || Platform.OS === 'ios' ? (
                <View>
                    <Button
                        mode='outlined'
                        style={{ borderRadius: 8, backgroundColor: theme.colors.background }}
                        onPress={showDatePicker}
                    >
                        <Text style={masterdataStyles.timeText}>
                            {value ? value : "N/A"}
                        </Text>
                    </Button>

                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode='datetime'
                        date={value ? convertToDate(String(value && value)) : getCurrentTime()}
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                    />
                </View>
            ) : (
                <DatePicker
                    selected={value ? convertToDate(String(value && value)) : getCurrentTime()}
                    onChange={(date) => {
                        if (date)
                            handleChange(convertToThaiDateTime(new Date(date).toISOString(), true));
                    }}
                    showTimeInput
                    timeInputLabel="Start Time:"
                    dateFormat="dd/MM/yyyy h:mm aa"
                    wrapperClassName="custom-datepicker-wrapper"
                    customInput={<CustomInput />}
                />
            )}
            {hint ? <Text style={masterdataStyles.hint}>{hint}</Text> : false}
        </View>
    );
};

export default Time;
