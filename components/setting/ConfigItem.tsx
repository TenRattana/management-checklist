import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
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
    handleSubmit: (field: string, values: { [x: number]: any }) => void;
}

const MemoRenderFormik = React.memo(RenderFormik, (prevProps, nextProps) => {
    return (
        prevProps.field === nextProps.field &&
        prevProps.state[prevProps.field] === nextProps.state[nextProps.field]
    );
});

const ConfigItem: React.FC<ConfigItemProps> = React.memo(({ label, value, editable, onEdit, state, handleSubmit }) => {
    const { theme } = useTheme();
    const { spacing, fontSize } = useRes();
    const masterdataStyles = useMasterdataStyles();

    if (!state || !label) {
        return <ActivityIndicator size="large" />;
    }

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

    const keyText = `${label}-${editable ? 'editable' : 'non-editable'}`;
    const keyIconButton = `${label}-${editable ? 'editable' : 'non-editable'}-icon`;

    return (
        <AccessibleView name={`container-${label}`} style={[styles.row, { flexBasis: '100%' }]}>
            {editable ? (
                <View style={{ flex: 1 }}>
                    <MemoRenderFormik field={label === "Program Display" ? "AppName" : label} state={state} handleSubmit={handleSubmit} onEdit={(v: boolean) => onEdit(v)} />
                </View>
            ) : (
                <>
                    <Text
                        style={[masterdataStyles.settingText]}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        key={keyText}
                    >
                        {`${label} : ${!editable ? value : ""}`}
                    </Text>
                    <IconButton
                        icon="pencil-box"
                        onPress={() => onEdit(true)}
                        iconColor={theme.colors.blue}
                        size={spacing.large + 5}
                        style={[styles.iconButton, { width: 100 }]}
                        key={keyIconButton}
                    />
                </>
            )}
        </AccessibleView>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.label === nextProps.label &&
        prevProps.value === nextProps.value &&
        prevProps.editable === nextProps.editable &&
        prevProps.state === nextProps.state
    );
});

export default ConfigItem;
