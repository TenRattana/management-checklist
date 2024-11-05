import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { IconButton } from 'react-native-paper';
import { useRes, useTheme, useToast } from '@/app/contexts';
import { AccessibleView, Inputs, Text } from '@/components';
import useMasterdataStyles from '@/styles/common/masterdata';
import {
    setPrefixGroupMachine,
    setPrefixCheckList,
    setPrefixCheckListOption,
    setPrefixExpectedResult,
    setPrefixForm,
    setPrefixSubForm,
    setPrefixGroupCheckList,
    setPrefixMachine,
    setPrefixMatchCheckListOption,
    setPrefixMatchFormMachine,
    setPrefixUsersPermission,
    setAppName
} from "@/slices";
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axiosInstance from '@/config/axios';
import { AppProps } from '@/typing/type'

interface ConfigItemProps {
    label: string;
    value: string;
    editable: boolean;
    onEdit: (v: boolean) => void;
}

const saveAppconfig = async (data: AppProps): Promise<{ message: string }> => {
    const response = await axiosInstance.post("AppConfig_service.asmx/SaveAppConfig", data);
    return response.data;
};

const RenderFormik: React.FC<{ field: string; setEdit: (v: boolean) => void; }> = React.memo(({ field, setEdit }) => {
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.prefix);
    const { spacing } = useRes();
    const { theme } = useTheme();
    const { handleError } = useToast()
    const queryClient = useQueryClient();

    const mutation = useMutation(saveAppconfig, {
        onSuccess: () => {
            queryClient.invalidateQueries('appConfig');
        },
        onError: handleError,
    });

    const handleSubmit = useCallback((values: { [x: string]: any; }) => {
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
            case 'SubForm':
                dispatch(setPrefixSubForm({ SubForm: values[field] }));
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
        const data = { ...state, [field]: values[field] }
        mutation.mutate(data)

        setEdit(false);
    }, [dispatch, field])

    return (
        <Formik
            initialValues={{ [field]: state[field] }}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={(values) => handleSubmit(values)}
        >
            {({ handleSubmit, errors, touched, setFieldValue, setTouched, values }) => (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <View style={[styles.row]}>
                        <View style={{ flex: 1 }}>
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
                        </View>

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
        <AccessibleView name="" style={[styles.row, { flexBasis: '100%' }]}>
            {editable ? <>
                <View style={{ flexGrow: 1 }}>
                    <Text style={[masterdataStyles.settingText]} ellipsizeMode="tail" numberOfLines={1}>
                        {`${label} : ${!editable ? value : ""}`}
                    </Text>
                </View>
                <View style={{ flexGrow: 10 }}>
                    <RenderFormik field={label === "Program Display" ? "AppName" : label} setEdit={onEdit} />
                </View>
            </> :
                <>
                    <Text style={[styles.configPrefixText, masterdataStyles.settingText, { width: 500 }]} ellipsizeMode="tail" numberOfLines={1}>
                        {`${label} : ${!editable ? value : ""}`}
                    </Text>
                    <IconButton
                        icon="pencil-box"
                        onPress={() => onEdit(true)}
                        iconColor={theme.colors.blue}
                        size={spacing.large + 5}
                        style={[styles.iconButton, { width: 100 }]}
                    />
                </>
            }
        </AccessibleView>
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
        SubForm: false,
        ExpectedResult: false
    });

    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes();

    return (
        <ScrollView id="setting" style={masterdataStyles.container}>
            <Text style={[masterdataStyles.textBold, masterdataStyles.text, { textAlign: 'center', paddingVertical: 30, fontSize: spacing.large }]}>Configuration</Text>

            <View id="config-app" style={masterdataStyles.configPrefix}>
                <Text style={[masterdataStyles.settingText, masterdataStyles.textBold]}>App Name</Text>

                <ConfigItem
                    label="Program Display"
                    value={state.AppName}
                    editable={edit.AppName}
                    onEdit={(v) => setEdit(prev => ({ ...prev, AppName: v }))}
                />
            </View>

            <View id="config-prefix" style={masterdataStyles.configPrefix}>
                <Text style={[masterdataStyles.settingText, masterdataStyles.textBold]}>Fix Prefixes</Text>
                {['GroupMachine', 'Machine', 'CheckList', 'GroupCheckList', 'CheckListOption', 'MatchCheckListOption', 'MatchFormMachine', 'Form', 'SubForm', 'ExpectedResult', 'UsersPermission'].map((item) => (
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
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
