import React, { useCallback } from "react";
import { IconButton } from "react-native-paper";
import AccessibleView from "@/components/AccessibleView";
import Inputs from "@/components/common/Inputs";
import { updateFormName, updateFormDescription } from "@/slices";
import { useRes, useTheme } from "@/app/contexts";
import { Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, View } from "react-native";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";

interface CreateForm {
    label: string;
    value: string;
    editable: boolean;
    onEdit: (v: boolean) => void;
}

const MemoizedIconButton = React.memo(IconButton)

const ConfigItemForm: React.FC<CreateForm> = React.memo(({ label, value, editable, onEdit }) => {
    const { theme } = useTheme();
    const { spacing, fontSize } = useRes();
    const masterdataStyles = useMasterdataStyles();

    const handlePress = useCallback(() => {
        onEdit(true);
    }, [onEdit]);

    return (
        <AccessibleView name="" style={styles.container}>
            {editable ? <RenderFormik field={label} setEdit={onEdit} /> :
                <>
                    <Text style={[styles.configPrefixText, masterdataStyles.settingText]} ellipsizeMode="tail" numberOfLines={1}>
                        {`${label} : ${!editable ? value : ""}`}
                    </Text>
                    <MemoizedIconButton
                        icon="pencil-box"
                        onPress={handlePress}
                        iconColor={theme.colors.blue}
                        size={spacing.large + 5}
                        style={styles.iconButton}
                    />
                </>
            }
        </AccessibleView>
    );
});

const RenderFormik: React.FC<{ field: string; setEdit: (v: boolean) => void; }> = React.memo(({ field, setEdit }) => {
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.form);
    const { spacing, fontSize } = useRes();
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
                    <View style={[{ width: fontSize === "large" ? 300 : 250 }]}>
                        <Inputs
                            placeholder={`Enter ${field}`}
                            label={field}
                            handleChange={(value) => setFieldValue(field, value)}
                            handleBlur={() => setTouched({ ...touched, [field]: true })}
                            value={String(values[field] ?? "")}
                            error={touched[field] && Boolean(errors[field])}
                            errorMessage={String(errors[field])}
                            testId={`${field}-cf`}
                        />
                    </View>

                    <MemoizedIconButton
                        icon="check"
                        onPress={() => handleSubmit()}
                        iconColor={theme.colors.green}
                        size={spacing.large}
                        style={styles.iconButton}
                    />
                </Animated.View>
            )}
        </Formik>
    );
});

export default ConfigItemForm;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        flexBasis: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    configPrefixText: {
        marginRight: 10,
        fontWeight: '600',
        fontSize: 16,
        color: '#333',
    },
    formContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 5,
    },
    iconButton: {
        padding: 0,
        margin: 0
    },
});
