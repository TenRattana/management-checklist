import React, { useEffect, useState } from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
import { Dialog, Button, Text, Portal } from 'react-native-paper';
import Daily_dialog from './Daily_dialog';
import { styles } from './Schedule';
import { Formik } from 'formik';
import * as Yup from 'yup';
interface InfoScheduleProps {
    visible: boolean;
    setVisible: (v: boolean) => void;
    setFieldValue: (value: any) => void;
    theme: any;
    spacing: any;
    responsive: any;
    showError: (message: string | string[]) => void;
    showSuccess: (message: string | string[]) => void;
    values: { start: string | null, end: string | null }[];
    selectedDay: string;
}

const { height } = Dimensions.get('window');

const createDaySchema = () => (
    Yup.object().shape({
        start: Yup.string().required('Start time is required'),
        end: Yup.string().required('End time is required')
    }).test('start-less-than-end', 'Start time must be less than end time', function (value) {
        const { start, end } = value;
        if (start && end) {
            const startTime = new Date(`1970-01-01T${start}:00Z`);
            const endTime = new Date(`1970-01-01T${end}:00Z`);
            return startTime < endTime;
        }
        return false;
    })
);

const InfoScheduleDialog = React.memo(({
    visible,
    setVisible,
    setFieldValue,
    theme,
    spacing,
    responsive,
    showError,
    showSuccess,
    values,
    selectedDay
}: InfoScheduleProps) => {
    const [value, setValue] = useState<{ start: string | null, end: string | null }[]>(values || []);

    const timeWeekSchema = Yup.array().of(
        Yup.object().shape({
            // เพิ่มวันในสัปดาห์
            MonDay: Yup.array().of(createDaySchema()),
            TueDay: Yup.array().of(createDaySchema()),
            WedDay: Yup.array().of(createDaySchema()),
            ThuDay: Yup.array().of(createDaySchema()),
            FriDay: Yup.array().of(createDaySchema()),
            SatDay: Yup.array().of(createDaySchema()),
            SunDay: Yup.array().of(createDaySchema())
        })
    );

    useEffect(() => { setValue(values) }, [visible])

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={() => setVisible(false)} style={[styles.dialog, { backgroundColor: theme.colors.background, borderRadius: 8, display: visible ? 'flex' : 'none' }]}>
                <Dialog.Title style={{ marginLeft: 24 }}>Schedule {selectedDay} Detail</Dialog.Title>

                <Formik
                    initialValues={value}
                    validationSchema={timeWeekSchema}
                    validateOnBlur={true}
                    validateOnChange={false}
                    onSubmit={(values) => console.log(values)}
                >
                    {({ values, handleSubmit, setFieldValue, dirty, isValid, errors, touched, setFieldTouched, resetForm }) => {

                        return (
                            <>
                                <View style={{ flexDirection: responsive === "small" ? "column" : "row", marginHorizontal: spacing.sm }}>
                                    <View style={{ flex: 2 }}>
                                        <ScrollView style={{ maxHeight: height / 1.7 }} showsVerticalScrollIndicator={false}>
                                            <View style={{ marginHorizontal: 24 }}>
                                                <Daily_dialog
                                                    errors={errors}
                                                    touched={touched}
                                                    setFieldValue={(value: [{ start: string | null, end: string | null }]) => setValue(value)}
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

                                <View style={{ paddingBottom: 5, justifyContent: 'flex-end', flexDirection: 'row', paddingHorizontal: 24 }}>
                                    <Button onPress={() => {
                                        setVisible(false)
                                        setValue([])
                                    }}>Cancel</Button>
                                    <Button
                                        onPress={() => {
                                            setFieldValue(value);
                                            setVisible(false);
                                            setValue([])
                                        }}>Save</Button>
                                </View>
                            </>
                        )
                    }}
                </Formik>
            </Dialog>
        </Portal>

    );
});

export default InfoScheduleDialog;
