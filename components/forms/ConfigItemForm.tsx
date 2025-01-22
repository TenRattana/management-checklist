import React, { useCallback } from "react";
import { IconButton } from "react-native-paper";
import AccessibleView from "@/components/AccessibleView";
import Inputs from "@/components/common/Inputs";
import { updateFormName, updateFormDescription, updateFormNumber } from "@/slices";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import { FastField, Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import useMasterdataStyles from "@/styles/common/masterdata";
import Text from "@/components/Text";
import { CreateForm } from "@/typing/screens/CreateForm";

const MemoizedIconButton = React.memo(IconButton);

const ConfigItemForm = React.memo(({ label, value, editable, onEdit }: CreateForm) => {
    const { theme } = useTheme();
    const { spacing } = useRes();
    const masterdataStyles = useMasterdataStyles();

    const handlePress = useCallback(() => {
        onEdit(true);
    }, [onEdit]);

    return (
        <AccessibleView name="" style={styles.container}>
            {editable ? (
                <RenderFormik field={label} setEdit={onEdit} />
            ) : (
                <View style={styles.textRow}>
                    <Text
                        style={[
                            masterdataStyles.text,
                            masterdataStyles.settingText,
                            { flex: 1 }
                        ]}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                    >
                        {`${label} : ${value}`}
                    </Text>
                    <MemoizedIconButton
                        icon="pencil"
                        onPress={handlePress}
                        iconColor={theme.colors.primary}
                        size={spacing.large}
                        style={styles.iconButton}
                    />
                </View>
            )}
        </AccessibleView>
    );
});

const RenderFormik: React.FC<{ field: string; setEdit: (v: boolean) => void }> = React.memo(
    ({ field, setEdit }) => {
        const dispatch = useDispatch();
        const state = useSelector((state: any) => state.form);
        const { responsive } = useRes();
        const masterdataStyles = useMasterdataStyles()

        return (
            <Formik
                initialValues={{ [field]: state[field] || "" }}
                validateOnBlur={true}
                validateOnChange={false}
                onSubmit={(values) => {
                    switch (field) {
                        case "FormName":
                            dispatch(updateFormName({ form: values[field] }));
                            break;
                        case "Description":
                            dispatch(updateFormDescription({ form: values[field] }));
                            break;
                        case "FormNumber":
                            dispatch(updateFormNumber({ form: values[field] }));
                            break;
                        default:
                            break;
                    }
                    setEdit(false);
                }}
            >
                {({ handleSubmit }) => (
                    <View style={styles.formContainer}>
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <FastField name={field}>
                                {({ field, form }: any) => (
                                    <Inputs
                                        placeholder={`Enter ${field.name}`}
                                        label={field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                                        handleChange={(value) => form.setFieldValue(field.name, value)}
                                        handleBlur={() =>
                                            form.setTouched({ ...form.touched, [field.name]: true })
                                        }
                                        value={field.value || ""}
                                        error={Boolean(
                                            form.touched?.[field.name] && form.errors?.[field.name]
                                        )}
                                        errorMessage={
                                            form.touched?.[field.name] ? form.errors?.[field.name] : ""
                                        }
                                        testId={`${field.name}-cf`}
                                    />
                                )}
                            </FastField>

                            <View id="form-action-config">
                                <TouchableOpacity
                                    onPress={() => handleSubmit()}
                                    style={[
                                        masterdataStyles.button,
                                        masterdataStyles.backMain,
                                        { alignSelf: responsive === "small" ? 'center' : 'flex-end' }
                                    ]}
                                    testID="Save-config"
                                >
                                    <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                )}
            </Formik>
        );
    }
);

export default ConfigItemForm;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 8,
        marginHorizontal: 5,
        paddingHorizontal: 12,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
    },
    textRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    formContainer: {
        flexBasis: '100%',
        flex: 1,
    },
    iconButton: {
        marginLeft: 10,
    },
    submitButton: {
        flexBasis: '10%',
        alignSelf: "center",
    },
});
