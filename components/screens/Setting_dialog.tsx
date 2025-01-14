import React, { useState, Suspense, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Dialog, Portal, Divider, Text, IconButton } from 'react-native-paper';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useRes } from '@/app/contexts/useRes';
import { AccessibleView } from '..';
import { useTheme } from '@/app/contexts/useTheme';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores';
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
    setPrefixTimeSchedule,

    setGroupMachine,
    setCheckList,
    setCheckListOption,
    setExpectedResult,
    setForm,
    setSubForm,
    setGroupCheckList,
    setMachine,
    setMatchCheckListOption,
    setMatchFormMachine,
    setUsersPermission,
    setTimeSchedule,
    setAppName
} from "@/slices";
import { useMutation, useQueryClient } from 'react-query';
import { AppProps } from '@/typing/type';
import axiosInstance from '@/config/axios';
import { useToast } from '@/app/contexts/useToast';
import SettingsScreen from '@/app/screens/layouts/settings/SettingScreen';
import ConfigulationScreen from '@/app/screens/layouts/settings/Configulation';
import Auther from '@/app/screens/layouts/settings/Auther';

const { height } = Dimensions.get('window');

const saveAppconfig = async (data: AppProps): Promise<{ message: string }> => {
    const response = await axiosInstance.post("AppConfig_service.asmx/SaveAppConfig", data);
    return response.data;
};

interface SettingProps {
    isVisible: boolean;
    setVisible: () => void;
}

const Setting_dialog: React.FC<SettingProps> = React.memo(({ isVisible, setVisible }) => {
    const [activeMenu, setActiveMenu] = useState<string>("user");
    const { fontSize, spacing, responsive } = useRes();
    const { theme } = useTheme();
    const { handleError } = useToast();

    const masterdataStyles = useMasterdataStyles();
    const prefix = useSelector((state: any) => state.prefix);
    const user = useSelector((state: any) => state.user);

    const dispatch = useDispatch<AppDispatch>();

    const handleMenuPress = (menu: string) => {
        setActiveMenu(menu);
    };

    const styles = StyleSheet.create({
        dialog: {
            width: responsive === "large" ? (fontSize === "large" ? 1000 : 800) : responsive === "medium" ? (fontSize === "large" ? 850 : 700) : "80%",
            justifyContent: 'center',
            alignSelf: 'center',
            alignContent: 'center',
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: theme.colors.background,
        },
        dialogContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
        },
        sectionTool: {
            flexBasis: '30%',
            paddingRight: 10,
        },
        sectionView: {
            flexBasis: '70%',
            paddingLeft: 10,
            minHeight: height / 2,
            maxHeight: height / 1.5,
        },
        divider: {
            marginBottom: 15,
            backgroundColor: '#ddd',
        },
        saveButton: {
            marginVertical: 10,
            backgroundColor: '#4CAF50',
            borderRadius: 8,
            paddingVertical: 8,
        },
        logoutButton: {
            marginVertical: 10,
            borderColor: '#f44336',
            borderRadius: 8,
            borderWidth: 1,
            paddingVertical: 8,
        },
        activeMenuItem: {
            backgroundColor: theme.colors.drag,
            borderRadius: 8,
        },
        menuItemNav: {
            paddingHorizontal: 10,
            paddingVertical: fontSize === "large" ? 10 : fontSize === "medium" ? 5 : 2,
            minHeight: fontSize === "small" ? 50 : fontSize === "medium" ? 60 : 75,
            flexDirection: 'row',
            alignItems: 'center',
        },
    });

    const queryClient = useQueryClient();

    const mutation = useMutation(saveAppconfig, {
        onSuccess: () => {
            queryClient.invalidateQueries('appConfig');
        },
        onError: handleError,
    });

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
        ExpectedResult: false,
        TimeSchedule: false,

        PF_GroupMachine: false,
        PF_Machine: false,
        PF_CheckList: false,
        PF_GroupCheckList: false,
        PF_CheckListOption: false,
        PF_MatchCheckListOption: false,
        PF_MatchFormMachine: false,
        PF_Form: false,
        PF_SubForm: false,
        PF_ExpectedResult: false,
        PF_TimeSchedule: false,
    });

    const handleSubmit = useCallback((field: string, values: { [x: string]: any; }) => {
        switch (field) {
            case 'AppName':
                dispatch(setAppName({ AppName: values[field] }));
                break;
            case 'PF_GroupMachine':
                dispatch(setPrefixGroupMachine({ PF_GroupMachine: values[field] }));
                break;
            case 'PF_CheckList':
                dispatch(setPrefixCheckList({ PF_CheckList: values[field] }));
                break;
            case 'PF_CheckListOption':
                dispatch(setPrefixCheckListOption({ PF_CheckListOption: values[field] }));
                break;
            case 'PF_ExpectedResult':
                dispatch(setPrefixExpectedResult({ PF_ExpectedResult: values[field] }));
                break;
            case 'PF_Form':
                dispatch(setPrefixForm({ PF_Form: values[field] }));
                break;
            case 'PF_SubForm':
                dispatch(setPrefixSubForm({ PF_SubForm: values[field] }));
                break;
            case 'PF_GroupCheckList':
                dispatch(setPrefixGroupCheckList({ PF_GroupCheckList: values[field] }));
                break;
            case 'PF_Machine':
                dispatch(setPrefixMachine({ PF_Machine: values[field] }));
                break;
            case 'PF_MatchCheckListOption':
                dispatch(setPrefixMatchCheckListOption({ PF_MatchCheckListOption: values[field] }));
                break;
            case 'PF_MatchFormMachine':
                dispatch(setPrefixMatchFormMachine({ PF_MatchFormMachine: values[field] }));
                break;
            case 'PF_UsersPermission':
                dispatch(setPrefixUsersPermission({ PF_UsersPermission: values[field] }));
                break;
            case 'PF_TimeSchedule':
                dispatch(setPrefixTimeSchedule({ PF_TimeSchedule: values[field] }))
                break;

            case 'GroupMachine':
                dispatch(setGroupMachine({ GroupMachine: values[field] }));
                break;
            case 'CheckList':
                dispatch(setCheckList({ CheckList: values[field] }));
                break;
            case 'CheckListOption':
                dispatch(setCheckListOption({ CheckListOption: values[field] }));
                break;
            case 'ExpectedResult':
                dispatch(setExpectedResult({ ExpectedResult: values[field] }));
                break;
            case 'Form':
                dispatch(setForm({ Form: values[field] }));
                break;
            case 'SubForm':
                dispatch(setSubForm({ SubForm: values[field] }));
                break;
            case 'GroupCheckList':
                dispatch(setGroupCheckList({ GroupCheckList: values[field] }));
                break;
            case 'Machine':
                dispatch(setMachine({ Machine: values[field] }));
                break;
            case 'MatchCheckListOption':
                dispatch(setMatchCheckListOption({ MatchCheckListOption: values[field] }));
                break;
            case 'MatchFormMachine':
                dispatch(setMatchFormMachine({ MatchFormMachine: values[field] }));
                break;
            case 'UsersPermission':
                dispatch(setUsersPermission({ UsersPermission: values[field] }));
                break;
            case 'TimeSchedule':
                dispatch(setTimeSchedule({ TimeSchedule: values[field] }))
                break;
            default:
                break;
        }

        const data = { ...prefix, [field]: values[field] };
        mutation.mutate(data);

        setEdit((prev) => ({ ...prev, [field]: false }));
    }, [dispatch, prefix]);

    const handelEdit = useCallback((field: string, value: boolean) => {
        setEdit((prev) => ({ ...prev, [field]: value }))
    }, [edit])

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={() => { setVisible(); setActiveMenu("user"); }} style={styles.dialog}>
                <Dialog.Title style={masterdataStyles.title}>Settings</Dialog.Title>

                <Divider style={styles.divider} />

                <Dialog.Content style={styles.dialogContent}>
                    <AccessibleView name="sectionTool" style={styles.sectionTool}>
                        <TouchableOpacity
                            onPress={() => handleMenuPress('user')}
                            style={[
                                styles.menuItemNav,
                                activeMenu === 'user' && styles.activeMenuItem,
                            ]}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <IconButton icon="account" size={spacing.large} style={{ left: -10 }} iconColor={activeMenu === 'user' ? theme.colors.background : theme.colors.onBackground} />
                                <Text style={[masterdataStyles.text, { textAlign: "left", left: -10, color: activeMenu === 'user' ? theme.colors.background : theme.colors.onBackground }]}>User info</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleMenuPress('general')}
                            style={[
                                styles.menuItemNav,
                                activeMenu === 'general' && styles.activeMenuItem,
                            ]}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <IconButton icon="cog" size={spacing.large} style={{ left: -10 }} iconColor={activeMenu === 'general' ? theme.colors.background : theme.colors.onBackground} />
                                <Text style={[masterdataStyles.text, { textAlign: "left", left: -10, color: activeMenu === 'general' ? theme.colors.background : theme.colors.onBackground }]}>Setting</Text>
                            </View>
                        </TouchableOpacity>

                        {user.Permissions.includes('view_config') && (
                            <TouchableOpacity
                                onPress={() => handleMenuPress('configuration')}
                                style={[
                                    styles.menuItemNav,
                                    activeMenu === 'configuration' && styles.activeMenuItem,
                                ]}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <IconButton icon="application-cog-outline" size={spacing.large} style={{ left: -10 }} iconColor={activeMenu === 'configuration' ? theme.colors.background : theme.colors.onBackground} />
                                    <Text style={[masterdataStyles.text, { textAlign: "left", left: -10, color: activeMenu === 'configuration' ? theme.colors.background : theme.colors.onBackground }]}>Configuration</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </AccessibleView>

                    <Divider style={styles.divider} />

                    <AccessibleView name="sectionView" style={styles.sectionView}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {activeMenu === "user" && (
                                <Suspense fallback={<Text>Loading...</Text>}>
                                    <Auther user={user} />
                                </Suspense>
                            )}
                            {activeMenu === 'general' && (
                                <Suspense fallback={<Text>Loading...</Text>}>
                                    <SettingsScreen />
                                </Suspense>
                            )}
                            {user.Permissions.includes('view_config') && activeMenu === "configuration" && (
                                <Suspense fallback={<Text>Loading...</Text>}>
                                    <ConfigulationScreen prefix={prefix} handleSubmit={handleSubmit} edit={edit} handelEdit={handelEdit} />
                                </Suspense>
                            )}
                        </ScrollView>
                    </AccessibleView>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
});

export default Setting_dialog;
