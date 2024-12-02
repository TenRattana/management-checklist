import React, { useEffect, useState } from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
import { Dialog, Button, Portal, Text } from 'react-native-paper';
import Daily_dialog from './Daily_dialog';
import { styles } from './Schedule';
import { FastField, Formik, FormikHelpers } from 'formik';
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

const isValidDateFormatSlots = (value: string) => {
    const dateRegex = /^(\d{2}):(\d{2})$/;
    return dateRegex.test(value);
};

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
    values,
    selectedDay
}: InfoScheduleProps) => {

    const validationSchema = Yup.object().shape({
        timeSlots: Yup.array().of(
            Yup.object().shape({
                start: Yup.string()
                    .required('Start time is required')
                    .test('is-valid-date', 'Invalid date format', isValidDateFormatSlots),
                end: Yup.string()
                    .required('End time is required')
                    .test('is-valid-date', 'Invalid date format', isValidDateFormatSlots)
            })
                .test('start-less-than-end', 'Start time must be less than end time', function (timeSlot) {
                    const { start, end } = timeSlot;
                    return start && end ? start < end : false;
                })
                .test('start-after-prev-end', 'Start time must be after previous end time', function (timeSlots) {
                    const { start } = timeSlots;
                    const { parent } = this;

                    if (parent && parent.length > 1) {
                        const currentIndex = parent.findIndex((item: { start: string | null, end: string | null }) => item.start === start);

                        if (currentIndex > 0) {
                            const prevEnd = parent[currentIndex - 1]?.end;

                            if (prevEnd) {
                                return start >= prevEnd;
                            }
                        }
                    }
                    return true;
                })
        )
    });

    return (
        <Portal>
            <Dialog
                visible={visible}
                onDismiss={() => setVisible(false)}
                style={[
                    styles.dialog,
                    { backgroundColor: theme.colors.background, borderRadius: 8 }
                ]}
            >
                <Dialog.Title style={{ marginLeft: 24 }}>Schedule {selectedDay} Detail</Dialog.Title>

                <Formik
                    initialValues={{ timeSlots: values }}
                    validationSchema={validationSchema}
                    onSubmit={(formValues, { resetForm }: FormikHelpers<{ timeSlots: { start: string | null, end: string | null }[] }>) => {
                        setFieldValue(formValues.timeSlots);
                        setVisible(false);
                        resetForm();
                    }}
                >
                    {({ values, errors, touched, handleSubmit, isValid, dirty }) => {
                        console.log(errors, "errors");

                        return (
                            <>
                                <View
                                    style={{
                                        flexDirection: responsive === "small" ? "column" : "row",
                                        marginHorizontal: spacing.sm
                                    }}
                                >
                                    <View style={{ flex: 2, marginHorizontal: 24 }}>
                                        <ScrollView
                                            style={{ maxHeight: height / 1.7 }}
                                            showsVerticalScrollIndicator={false}
                                        >
                                            <FastField name="timeSlots" key={JSON.stringify({ timeSlots: values.timeSlots })}>
                                                {({ field, form }: any) => (
                                                    <Daily_dialog
                                                        values={values.timeSlots}
                                                        setFieldValue={(value: [{ start: string | null, end: string | null }]) => {
                                                            form.setFieldValue(field.name, value);

                                                            setTimeout(() => {
                                                                form.setFieldTouched(field.name, true);
                                                            }, 0)
                                                        }}
                                                        key={`daily-dialog`}
                                                        responsive={responsive}
                                                        showError={showError}
                                                        showSuccess={showSuccess}
                                                        touched={touched.timeSlots}
                                                        errors={errors.timeSlots}
                                                        spacing={spacing}
                                                        theme={theme}
                                                    />
                                                )}
                                            </FastField>
                                        </ScrollView>
                                    </View>
                                </View>

                                <View style={{ paddingBottom: 10, justifyContent: 'flex-end', flexDirection: 'row', paddingHorizontal: 24 }}>
                                    <Button onPress={() => setVisible(false)}>Cancel</Button>
                                    <Button
                                        disabled={!isValid || !dirty}
                                        onPress={() => handleSubmit()}>Save</Button>
                                </View>
                            </>
                        )
                    }
                    }
                </Formik>
            </Dialog>
        </Portal>
    );
});

export default InfoScheduleDialog;
