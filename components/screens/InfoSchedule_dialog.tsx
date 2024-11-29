import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Dialog, Button, Text } from 'react-native-paper';
import useMasterdataStyles from '@/styles/common/masterdata';
import Daily_dialog from './Daily_dialog';

interface InfoScheduleProps {
    visible: boolean;
    setVisible: (v: boolean) => void;
    setFieldValue: (field: string, value: any) => void;
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    values: {
        ScheduleName: string,
        MachineGroup: string;
        timeSlots: { start: string | null, end: string | null }[];
        timeCustom: { start: string | null, end: string | null }[];
    };
    shouldCustom: boolean | string;
    shouldRenderTime: string;
    isValid: boolean;
    dirty: boolean;
    handleSubmit: () => void;
}

const { height } = Dimensions.get('window')
const InfoScheduleDialog: React.FC<InfoScheduleProps> = React.memo(({
    visible,
    setVisible,
    setFieldValue,
    showError,
    showSuccess,
    values,
    theme,
    responsive,
    spacing,
    isValid,
    dirty,
    handleSubmit
}) => {

    return (
        <Dialog
            visible={visible}
            onDismiss={() => setVisible(false)}
            style={[styles.dialog, { backgroundColor: theme.colors.background, borderRadius: 8, display: visible ? 'flex' : 'none' }]}
        >
            <Dialog.Title>Create Info Schedule</Dialog.Title>

            <ScrollView style={{ maxHeight: height / 1.7 }} showsVerticalScrollIndicator={false}>
                <View style={{ marginHorizontal: 24 }}>
                    <Daily_dialog
                        responsive={responsive}
                        setFieldValue={setFieldValue}
                        shouldCustom={true}
                        shouldRenderTime={"Daily"}
                        showError={showError}
                        showSuccess={showSuccess}
                        spacing={spacing}
                        theme={theme}
                        values={values}
                        key={"daily"}
                    />
                </View>
            </ScrollView>

            <View style={{ paddingBottom: 10, justifyContent: 'flex-end', flexDirection: 'row', paddingHorizontal: 24 }}>
                <Button onPress={() => setVisible(false)}>Cancel</Button>
                <Button
                    disabled={!isValid || !dirty}
                    onPress={() => handleSubmit()}>Save</Button>
            </View>
        </Dialog>
    );
});

const styles = StyleSheet.create({
    dialog: {
        zIndex: 2,
        width: 500,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    webContainer: {
        marginHorizontal: 24,
        marginBottom: 20,
    },
    addButton: {
        marginVertical: 5,
    },
})

export default InfoScheduleDialog;
