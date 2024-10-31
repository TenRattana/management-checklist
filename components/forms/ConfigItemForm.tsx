import React from "react";
import { IconButton, Text } from "react-native-paper";
import AccessibleView from "@/components/AccessibleView";
import Inputs from "@/components/common/Inputs";
import { updateFormName, updateFormDescription } from "@/slices";
import { useRes, useTheme } from "@/app/contexts";
import { Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet } from "react-native";
import useMasterdataStyles from "@/styles/common/masterdata";

interface CreateForm {
    label: string;
    value: string;
    editable: boolean;
    onEdit: (v: boolean) => void;
}

const ConfigItemForm: React.FC<CreateForm> = ({ label, value, editable, onEdit }) => {
    const { theme } = useTheme();
    const { spacing } = useRes();
    const masterdataStyles = useMasterdataStyles();

    return (
        <AccessibleView name="" style={styles.container}>
            <Text variant='labelMedium' style={[styles.configPrefixText, masterdataStyles.settingText]} ellipsizeMode="tail" numberOfLines={1}>
                {editable ? <RenderFormik field={label} setEdit={onEdit} /> : `${label}: ${value}`}
            </Text>
            {!editable && (
                <IconButton
                    icon="pencil-box"
                    onPress={() => onEdit(true)}
                    iconColor={theme.colors.blue}
                    size={spacing.large + 5}
                />
            )}
        </AccessibleView>
    );
};

const RenderFormik: React.FC<{ field: string; setEdit: (v: boolean) => void; }> = React.memo(({ field, setEdit }) => {
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.form);
    const { spacing } = useRes();
    const { theme } = useTheme();

    return (
        <Formik
            initialValues={{ [field]: state[field] }}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={(values) => {
                if (field === 'FormName') {
                    dispatch(updateFormName({ form: values[field] }));
                } else if (field === 'Description') {
                    dispatch(updateFormDescription({ form: values[field] }));
                }
                setEdit(false);
            }}
        >
            {({ handleSubmit, errors, touched, setFieldValue, setTouched, values }) => (
                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.formContainer}>
                    <Inputs
                        placeholder={`Enter ${field}`}
                        label={field}
                        handleChange={(value) => setFieldValue(field, value)}
                        handleBlur={() => setTouched({ ...touched, [field]: true })}
                        value={values[field]}
                        error={touched[field] && Boolean(errors[field])}
                        errorMessage={String(errors[field])}
                        testId={`${field}-cf`}
                    />
                    <IconButton
                        icon="check"
                        onPress={() => handleSubmit()}
                        iconColor={theme.colors.green}
                        size={spacing.large + 5}
                    />
                </Animated.View>
            )}
        </Formik>
    );
});

export default React.memo(ConfigItemForm);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    configPrefixText: {
        flex: 1,
        marginRight: 10,
        fontWeight: '600',
        fontSize: 16,
    },
    formContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
});
