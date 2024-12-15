import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { HelperText, Button, Portal, Dialog, Text } from 'react-native-paper';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import "@/styles/Datapicker.css"
import useMasterdataStyles from '@/styles/common/masterdata';
import { useTheme } from '@/app/contexts/useTheme';

const Time: React.FC<any> = ({ placeholder, label, error, errorMessage, value, handleChange, handleBlur }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(value || new Date());
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const { theme } = useTheme();

    const togglePicker = () => {
        setIsPickerVisible(!isPickerVisible);
    };

    const onDateChange = (event: any, date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            handleChange(date);
            setIsPickerVisible(false);
        }
    };

    const formatDate = (date: Date) => {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    };

    const masterdataStyles = useMasterdataStyles();

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
                    <Button mode="outlined" onPress={togglePicker}>
                        {selectedDate ? formatDate(selectedDate) : placeholder}
                    </Button>
                    {isPickerVisible && (
                        <RNDateTimePicker
                            value={selectedDate || new Date()}
                            mode="datetime"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}
                </View>
            ) : (
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                        setSelectedDate(date);
                        handleChange(date);
                    }}
                    showTimeInput
                    timeInputLabel="Start Time:"
                    dateFormat="dd/MM/yyyy h:mm aa"
                    wrapperClassName="custom-datepicker-wrapper"
                    customInput={<CustomInput />}
                />
            )}

            {error && (
                <HelperText type="error" visible={error}>
                    {errorMessage}
                </HelperText>
            )}
        </View>
    );
};

export default Time;
