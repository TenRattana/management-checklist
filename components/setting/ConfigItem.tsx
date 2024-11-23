import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useTheme } from '@/app/contexts/useTheme';
import { useRes } from '@/app/contexts/useRes';
import RenderFormik from './RenderFormik';
import AccessibleView from '../AccessibleView';
import useMasterdataStyles from '@/styles/common/masterdata';

interface ConfigItemProps {
    label: string;
    value: string;
    editable: boolean;
    onEdit: (v: boolean) => void;
    state: any;
}

const MemoRenderFormik = React.memo(RenderFormik);

const ConfigItem: React.FC<ConfigItemProps> = React.memo(({ label, value, editable, onEdit, state }) => {
    const { theme } = useTheme();
    const { spacing, fontSize } = useRes();
    const masterdataStyles = useMasterdataStyles();


    const styles = StyleSheet.create({
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 5,
            paddingVertical: fontSize === "large" ? 10 : fontSize === "medium" ? 5 : 2,
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

    return (
        <AccessibleView name={`container-${label}`} style={[styles.row, { flexBasis: '100%' }]}>
            {editable ? (
                <>
                    <View style={{ flexGrow: 1 }}>
                        <Text
                            style={[masterdataStyles.settingText]}
                            ellipsizeMode="tail"
                            numberOfLines={1}
                            key={`text-${label}-${editable ? 'editable' : 'non-editable'}`}
                        >
                            {`${label} : ${!editable ? value : ""}`}
                        </Text>

                    </View>
                    <View style={{ flexGrow: 10 }}>
                        <MemoRenderFormik field={label === "Program Display" ? "AppName" : label} setEdit={onEdit} state={state} />
                    </View>
                </>
            ) : (
                <>
                    <Text
                        style={[masterdataStyles.settingText]}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        key={`text-${label}-${editable ? 'editable' : 'non-editable'}`}
                    >
                        {`${label} : ${!editable ? value : ""}`}
                    </Text>
                    <IconButton
                        icon="pencil-box"
                        onPress={() => onEdit(true)}
                        iconColor={theme.colors.blue}
                        size={spacing.large + 5}
                        style={[styles.iconButton, { width: 100 }]}
                        key={`icon-button-${label}`}
                    />
                </>
            )}
        </AccessibleView>
    );
});

export default ConfigItem;

