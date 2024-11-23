import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme, } from '@/app/contexts/useTheme';
import { useRes } from '@/app/contexts/useRes';
import { AccessibleView, ConfigItem, Text } from '@/components';
import useMasterdataStyles from '@/styles/common/masterdata';
import { Divider } from 'react-native-paper';


const Configuration = React.memo((prefix: any) => {
    const { theme } = useTheme();
    const { spacing, fontSize } = useRes();
    const state = prefix.prefix

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
    });

    const masterdataStyles = useMasterdataStyles();

    const styles = StyleSheet.create({
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 5,
        },
        iconButton: {
            padding: 0,
            margin: 0
        },
        divider: {
            backgroundColor: '#ddd',
            marginBottom: 10,
            width: '100%',
        },
    });

    return (
        <AccessibleView name="setting" style={[masterdataStyles.container]}>
            <AccessibleView name="setting-mode" style={[masterdataStyles.configPrefix]}>
                <Text style={[masterdataStyles.settingText, masterdataStyles.textBold]}>App</Text>
                <ConfigItem
                    key={state.AppName}
                    state={state}
                    label="Program Display"
                    value={state.AppName}
                    editable={edit.AppName}
                    onEdit={(v) => setEdit(prev => ({ ...prev, AppName: v }))}
                />
                <Divider style={styles.divider} />
            </AccessibleView>

            <AccessibleView name="setting-mode" style={[masterdataStyles.configPrefix]}>
                <Text style={[masterdataStyles.settingText, masterdataStyles.textBold]}>Fix Prefixes</Text>
                {['GroupMachine', 'Machine', 'CheckList', 'GroupCheckList', 'CheckListOption', 'MatchCheckListOption', 'MatchFormMachine', 'Form', 'SubForm', 'ExpectedResult', 'UsersPermission'].map((item) => (
                    <React.Fragment key={`${state[item]}-${item}`}>
                        <ConfigItem
                            state={state}
                            label={item}
                            value={state[item]}
                            editable={edit[item]}
                            onEdit={(v: boolean) => setEdit(prev => ({ ...prev, [item]: v }))} />
                        <Divider style={styles.divider} />
                    </React.Fragment>
                ))}
            </AccessibleView>
        </AccessibleView>
    );
});

export default Configuration;

