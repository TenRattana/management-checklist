import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { Formik } from 'formik';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { IconButton } from 'react-native-paper';
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
import { useMutation, useQueryClient } from 'react-query';
import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import { useToast } from '@/app/contexts/useToast';
import { AppProps } from '@/typing/type';
import axiosInstance from '@/config/axios';
import { Inputs } from '../common';
import { AppDispatch } from '@/stores';

const saveAppconfig = async (data: AppProps): Promise<{ message: string }> => {
    const response = await axiosInstance.post("AppConfig_service.asmx/SaveAppConfig", data);
    return response.data;
};

const RenderFormik: React.FC<{ field: string; setEdit: (v: boolean) => void; state: any }> = React.memo(({ field, setEdit, state }) => {
    const dispatch = useDispatch<AppDispatch>();
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

export default RenderFormik

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