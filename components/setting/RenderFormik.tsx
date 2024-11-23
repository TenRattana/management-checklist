import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Formik } from 'formik';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { IconButton, TextInput } from 'react-native-paper';
import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import { Inputs } from '../common';
import useMasterdataStyles from '@/styles/common/masterdata';
import Text from '../Text';

interface RennderFormikPorps {
    field: string;
    state: any;
    handleSubmit: (field: string, values: { [x: number]: any }) => void;
    onEdit: (v: boolean) => void;
}

const RenderFormik: React.FC<RennderFormikPorps> = React.memo(({ field, state, handleSubmit, onEdit }) => {
    const { spacing } = useRes();
    const { theme } = useTheme();
    const masterdataStyles = useMasterdataStyles();

    return (
        <Formik
            initialValues={{ [field]: state[field] }}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={(values) => handleSubmit(field, values)}
        >
            {({ handleSubmit, errors, touched, setFieldValue, setTouched, values }) => (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <View style={[styles.row]}>
                        <View style={{ flex: 1 }}>
                            <View
                                id="inputs"
                                style={masterdataStyles.commonContainer}
                            >
                                <TextInput
                                    mode="outlined"
                                    textColor={theme.colors.onBackground}
                                    style={{ fontSize: spacing.small }}
                                    placeholder={`Enter ${field}`}
                                    label={`${field}`}
                                    value={state[field]}
                                    readOnly
                                />
                            </View>

                            <Inputs
                                placeholder={`Enter ${field}`}
                                label={`New : ${field}`}
                                handleChange={(value) => setFieldValue(field, value)}
                                handleBlur={() => setTouched({ ...touched, [field]: true })}
                                value={values[field]}
                                error={touched[field] && Boolean(errors[field])}
                                errorMessage={String(errors[field])}
                                testId={`${field}-cf`}
                            />
                        </View>
                    </View>

                    <View id="form-action-config" style={masterdataStyles.containerAction}>
                        <TouchableOpacity
                            onPress={() => handleSubmit()}
                            style={[
                                masterdataStyles.button,
                                masterdataStyles.backMain,
                            ]}
                            testID="Save-config"
                        >
                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onEdit(false)} style={[masterdataStyles.button, masterdataStyles.backMain]} testID="Cancel-config">
                            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </Formik>
    );
});

export default RenderFormik;

const styles = StyleSheet.create({
    row: {
        flex: 1,
        flexDirection: 'row',
        marginVertical: 5,
    },
    configPrefixText: {
        flex: 1,
        marginRight: 10,
    },
    iconButton: {
        padding: 0,
        margin: 0
    },
});
