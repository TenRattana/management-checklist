import React, { useEffect, useState } from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
import { Dialog, Button, Text } from 'react-native-paper';
import Daily_dialog from './Daily_dialog';
import { styles } from './Schedule';

interface InfoScheduleProps {
    visible: boolean;
    setVisible: (v: boolean) => void;
    setFieldValue: (value: any) => void;
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    isValid: boolean;
    dirty: boolean;
    values: { start: string | null, end: string | null }[];
    selectedDay: string;
}

const { height } = Dimensions.get('window');

const InfoScheduleDialog = React.memo(({
    visible,
    setVisible,
    setFieldValue,
    theme,
    spacing,
    responsive,
    showError,
    showSuccess,
    isValid,
    dirty,
    values,
    selectedDay
}: InfoScheduleProps) => {
    const [value, setValue] = useState<{ start: string | null, end: string | null }[]>(values || []);

    useEffect(() => { setValue(values) }, [visible])

    return (
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={[styles.dialog, { backgroundColor: theme.colors.background, borderRadius: 8, display: visible ? 'flex' : 'none' }]}>
            <Dialog.Title style={{ marginLeft: 24 }}>Schedule {selectedDay} Detail</Dialog.Title>

            <View style={{ flexDirection: responsive === "small" ? "column" : "row", marginHorizontal: spacing.sm }}>
                <View style={{ flex: 2 }}>
                    <ScrollView style={{ maxHeight: height / 1.7 }} showsVerticalScrollIndicator={false}>
                        <View style={{ marginHorizontal: 24 }}>
                            <Daily_dialog
                                setFieldValue={(value: [{ start: string | null, end: string | null }]) => setValue(value)}
                                shouldCustom={true}
                                shouldRenderTime={"Daily"}
                                values={value}
                                key={`daily-dialog`}
                                responsive={responsive}
                                showError={showError}
                                showSuccess={showSuccess}
                                spacing={spacing}
                                theme={theme}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>

            <View style={{ paddingBottom: 10, justifyContent: 'flex-end', flexDirection: 'row', paddingHorizontal: 24 }}>
                <Button onPress={() => {
                    setVisible(false)
                    setValue([])
                }}>Cancel</Button>
                <Button
                    disabled={!isValid || !dirty}
                    onPress={() => {
                        setFieldValue(value);
                        setVisible(false);
                        setValue([])
                    }}>Save</Button>
            </View>
        </Dialog>
    );
});

export default InfoScheduleDialog;
