import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Dialog, Portal, Divider, Text, IconButton } from 'react-native-paper';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useRes } from '@/app/contexts/useRes';
import { AccessibleView } from '..';
import { useTheme } from '@/app/contexts/useTheme';
import { SettingScreen } from '@/app/screens';
import Configuration from '@/app/screens/layouts/Configulation';
import { useSelector } from 'react-redux';
import Auther from '@/app/screens/layouts/Auther'

interface SettingProps {
    isVisible: boolean;
    setVisible: () => void;
}
const MemoSettingScreen = React.memo(SettingScreen)
const MemoConfiguration = React.memo(Configuration)
const MemoAuther = React.memo(Auther)
const { height } = Dimensions.get('window');

const Setting_dialog: React.FC<SettingProps> = React.memo(({ isVisible, setVisible }) => {
    const [activeMenu, setActiveMenu] = useState<string>("user");
    const { fontSize, spacing } = useRes()
    const { theme } = useTheme()
    const masterdataStyles = useMasterdataStyles()
    const prefix = useSelector((state: any) => state.prefix);
    const user = useSelector((state: any) => state.user);

    const handleMenuPress = (menu: string) => {
        setActiveMenu(menu);
    };

    const styles = StyleSheet.create({
        dialog: {
            width: fontSize === "large" ? '80%' : fontSize === "medium" ? '75%' : '70%',
            justifyContent: 'center',
            alignSelf: 'center',
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: theme.colors.background
        },
        dialogContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 15
        },
        sectionTool: {
            flexBasis: '30%',
            paddingRight: 10,
        },
        sectionView: {
            flexBasis: '70%',
            paddingLeft: 10,
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
        }
    });

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
                            <View style={[{ flexDirection: "row", alignItems: "center" }]}>
                                <IconButton icon="account" size={spacing.large} animated style={{ left: -10 }} />
                                <Text style={[masterdataStyles.text, { textAlign: "left", left: -10 }]}>User info</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleMenuPress('general')}
                            style={[
                                styles.menuItemNav,
                                activeMenu === 'general' && styles.activeMenuItem,
                            ]}
                        >
                            <View style={[{ flexDirection: "row", alignItems: "center" }]}>
                                <IconButton icon="cog" size={spacing.large} animated style={{ left: -10 }} />
                                <Text style={[masterdataStyles.text, { textAlign: "left", left: -10 }]}>Setting</Text>
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
                                <View style={[{ flexDirection: "row", alignItems: "center" }]}>
                                    <IconButton icon="application-cog-outline" size={spacing.large} animated style={{ left: -10 }} />
                                    <Text style={[masterdataStyles.text, { textAlign: "left", left: -10 }]}>Configuration</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </AccessibleView>

                    <Divider style={styles.divider} />

                    <AccessibleView name="sectionView" style={styles.sectionView}>
                        <ScrollView
                            id="setting"
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                        >
                            {activeMenu === "user" && (
                                <MemoAuther user={user} />
                            )}
                            {activeMenu === 'general' && (
                                <MemoSettingScreen />
                            )}
                            {user.Permissions.includes('view_config') && activeMenu === "configuration" && (
                                <MemoConfiguration prefix={prefix} />
                            )}
                        </ScrollView>
                    </AccessibleView>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
});

export default Setting_dialog;
