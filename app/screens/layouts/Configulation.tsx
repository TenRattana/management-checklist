import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { IconButton, Text } from 'react-native-paper';
import { useRes, useTheme } from '@/app/contexts';
import { Inputs } from '@/components';
import useMasterdataStyles from '@/styles/common/masterdata';
import {
    setPrefixGroupMachine,
    setPrefixCheckList,
    setPrefixCheckListOption,
    setPrefixExpectedResult,
    setPrefixForm,
    setPrefixGroupCheckList,
    setPrefixMachine,
    setPrefixMatchCheckListOption,
    setPrefixMatchFormMachine,
    setPrefixUsersPermission,
    setAppName
} from "@/slices";

interface ConfigItemProps {
    label: string;
    value: string;
    editable: boolean;
    onEdit: (v: boolean) => void;
}

const RenderFormik: React.FC<{ field: string; setEdit: (v: boolean) => void; }> = React.memo(({ field, setEdit }) => {
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.prefix);
    const { spacing } = useRes();
    const { theme } = useTheme();

    return (
        <Formik
            initialValues={{ [field]: state[field] }}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={(values) => {
                switch (field) {
                    case 'AppName':
                        dispatch(setAppName({ AppName: values[field] }));
                        break;
                    case 'GroupMachine':
                        dispatch(setPrefixGroupMachine({ GroupMachine: values[field] }));
                        break;
                    case 'CheckList':
                        dispatch(setPrefixCheckList({ CheckList: values[field] }));
                        break;
                    case 'CheckListOption':
                        dispatch(setPrefixCheckListOption({ CheckListOption: values[field] }));
                        break;
                    case 'ExpectedResult':
                        dispatch(setPrefixExpectedResult({ ExpectedResult: values[field] }));
                        break;
                    case 'Form':
                        dispatch(setPrefixForm({ Form: values[field] }));
                        break;
                    case 'GroupCheckList':
                        dispatch(setPrefixGroupCheckList({ GroupCheckList: values[field] }));
                        break;
                    case 'Machine':
                        dispatch(setPrefixMachine({ Machine: values[field] }));
                        break;
                    case 'MatchCheckListOption':
                        dispatch(setPrefixMatchCheckListOption({ MatchCheckListOption: values[field] }));
                        break;
                    case 'MatchFormMachine':
                        dispatch(setPrefixMatchFormMachine({ MatchFormMachine: values[field] }));
                        break;
                    case 'UsersPermission':
                        dispatch(setPrefixUsersPermission({ UsersPermission: values[field] }));
                        break;
                    default:
                        break;
                }
                setEdit(false);
            }}
        >
            {({ handleSubmit, errors, touched, setFieldValue, setTouched, values }) => (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <View style={styles.row}>
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
                            icon="pencil-box"
                            onPress={() => handleSubmit()}
                            iconColor={theme.colors.blue}
                            size={spacing.large + 5}
                        />
                    </View>
                </Animated.View>
            )}
        </Formik>
    );
});

const ConfigItem: React.FC<ConfigItemProps> = ({ label, value, editable, onEdit }) => {
    const { theme } = useTheme();
    const { spacing } = useRes();
    const masterdataStyles = useMasterdataStyles();

    return (
        <View style={styles.row}>
            <Text variant='labelMedium' style={[styles.configPrefixText, masterdataStyles.settingText,]}>
                {label}: {editable ? <RenderFormik field={label === "Program Display" ? "AppName" : label} setEdit={onEdit} /> : value}
            </Text>
            {!editable && (
                <IconButton
                    icon="pencil-box"
                    onPress={() => onEdit(true)}
                    iconColor={theme.colors.blue}
                    size={spacing.large + 5}
                />
            )}
        </View>
    );
};

const Configuration: React.FC = React.memo(() => {
    const state = useSelector((state: any) => state.prefix);
    const [edit, setEdit] = useState<{ [key: string]: boolean }>({
        AppName: false,
        GroupMachine: false,
        Machine: false,
        CheckList: false,
        GroupCheckList: false,
        CheckListOption: false,
        MatchCheckListOption: false,
        MatchFormMachine: false,
        Form: false,
        ExpectedResult: false
    });

    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes();

    return (
        <ScrollView id="setting" style={masterdataStyles.container}>
            <Text style={[masterdataStyles.textBold, masterdataStyles.text, { textAlign: 'center', paddingVertical: 30, fontSize: spacing.large }]}>Configuration</Text>

            <View id="config-app" style={masterdataStyles.configPrefix}>
                <ConfigItem
                    label="Program Display"
                    value={state.AppName}
                    editable={edit.AppName}
                    onEdit={(v) => setEdit(prev => ({ ...prev, AppName: v }))}
                />
            </View>

            <View id="config-prefix" style={masterdataStyles.configPrefix}>
                <Text style={[masterdataStyles.settingText, masterdataStyles.textBold]}>Fix Prefixes</Text>
                {['GroupMachine', 'Machine', 'CheckList', 'GroupCheckList', 'CheckListOption', 'MatchCheckListOption', 'MatchFormMachine', 'Form', 'ExpectedResult', 'UsersPermission'].map((item) => (
                    <ConfigItem
                        key={item}
                        label={item}
                        value={state[item]}
                        editable={edit[item]}
                        onEdit={(v: boolean) => setEdit(prev => ({ ...prev, [item]: v }))}
                    />
                ))}
            </View>
        </ScrollView>
    );
});

export default Configuration;

const styles = StyleSheet.create({
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    configPrefixText: {
        flex: 1,
        marginRight: 10,
    },
});
