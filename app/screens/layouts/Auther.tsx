import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useTheme } from '@/app/contexts/useTheme';
import { useRes } from '@/app/contexts/useRes';
import { AccessibleView } from '@/components';
import { Divider } from 'react-native-paper';

const Auther = React.memo((user: any) => {
    const state = user.user

    const { theme } = useTheme();
    const { fontSize } = useRes();

    const masterdataStyles = useMasterdataStyles();

    const styles = StyleSheet.create({
        divider: {
            backgroundColor: '#ddd',
            marginBottom: 10,
        },
        userInfoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
            paddingVertical: fontSize === "large" ? 15 : fontSize === "medium" ? 10 : 5,
        },
        chipText: {
            paddingVertical: 5,
            paddingHorizontal: 12,
            borderRadius: 16,
            backgroundColor: theme.colors.drag,
        }
    });

    return (
        <AccessibleView name="setting" style={[masterdataStyles.container]}>
            <AccessibleView name="setting-mode" style={[masterdataStyles.settingItem]}>
                <View style={styles.userInfoRow}>
                    <Text style={[masterdataStyles.settingText, masterdataStyles.textBold]}>User Name : </Text>
                    <Text style={masterdataStyles.text}>{state.Full_Name}</Text>
                </View>
            </AccessibleView>
            <Divider style={styles.divider} />

            <AccessibleView name="setting-mode" style={[masterdataStyles.settingItem]}>
                <View style={styles.userInfoRow}>
                    <Text style={[masterdataStyles.settingText, masterdataStyles.textBold]}>Position : </Text>
                    <Text style={masterdataStyles.text}>{state.Position}</Text>
                </View>
            </AccessibleView>
            <Divider style={styles.divider} />

            <AccessibleView name="setting-mode" style={[masterdataStyles.settingItem]}>
                <View style={styles.userInfoRow}>
                    <Text style={[masterdataStyles.settingText, masterdataStyles.textBold]}>Department : </Text>
                    <Text style={masterdataStyles.text}>{state.DepartMent}</Text>
                </View>
            </AccessibleView>
            <Divider style={styles.divider} />



            <AccessibleView name="setting-mode" style={[masterdataStyles.settingItem]}>
                <View style={styles.userInfoRow}>
                    <Text style={[masterdataStyles.settingText, masterdataStyles.textBold]}>Group Permission : </Text>
                    <Text style={[styles.chipText, masterdataStyles.text, masterdataStyles.textBold, { color: theme.colors.fff }]}>{state.GUserName}</Text>
                </View>
            </AccessibleView>
            <Divider style={styles.divider} />

        </AccessibleView>
    );
});

export default Auther;
