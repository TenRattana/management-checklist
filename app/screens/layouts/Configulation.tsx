import React from 'react';
import { StyleSheet } from 'react-native';
import { AccessibleView, ConfigItem, Text } from '@/components';
import useMasterdataStyles from '@/styles/common/masterdata';
import { Divider } from 'react-native-paper';

interface ConfigurationProps {
    prefix: any;
    handleSubmit: (field: string, values: { [key: string]: any }) => void;
    edit: { [key: string]: boolean };
    handelEdit: (field: string, value: boolean) => void;
}

const Configuration: React.FC<ConfigurationProps> = React.memo(({ prefix, handleSubmit, edit, handelEdit }) => {
    const state = prefix;

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
                    onEdit={(v: boolean) => handelEdit('AppName', v)}
                    handleSubmit={handleSubmit}
                />
                <Divider style={styles.divider} />
            </AccessibleView>

            <AccessibleView name="setting-mode" style={[masterdataStyles.configPrefix]}>
                <Text style={[masterdataStyles.settingText, masterdataStyles.textBold]}>Fix Prefixes</Text>
                {['GroupMachine', 'Machine', 'CheckList', 'GroupCheckList', 'CheckListOption', 'MatchCheckListOption', 'MatchFormMachine', 'Form', 'SubForm', 'ExpectedResult', 'UsersPermission', "TimeSchedule"].map((item) => (
                    <React.Fragment key={item}>
                        <ConfigItem
                            state={state}
                            label={item}
                            value={state[item]}
                            editable={edit[item]}
                            onEdit={(v: boolean) => handelEdit(item, v)}
                            handleSubmit={handleSubmit}
                        />
                        <Divider style={styles.divider} />
                    </React.Fragment>
                ))}
            </AccessibleView>
        </AccessibleView>
    );
});

export default Configuration;
