import React, { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Text } from '@/components';
import MenuSection from './MenuSection';
import useMasterdataStyles from "@/styles/common/masterdata";
import { useSelector } from 'react-redux';
import { useAuth } from '@/app/contexts';

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    const masterdataStyles = useMasterdataStyles();
    const { loading } = useAuth();
    const { navigation } = props;

    const user = useSelector((state: any) => state.user);
    const screens = user.screens;

    const [isMenuListOpen, setIsMenuListOpen] = useState({
        machine: false,
        checklist: false,
    });

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const renderPressable = (label: string, navigateTo: string) => (
        <Pressable
            key={label}
            onPress={() => navigation.navigate(navigateTo)}
            style={masterdataStyles.menuItemNav}
            android_ripple={{ color: '#f0f0f0' }}
        >
            <Text style={masterdataStyles.menuText}>{label}</Text>
        </Pressable>
    );

    const renderMachineMenu = () => {
        const machineItems = [
            { label: 'Machine Group', navigateTo: 'Machine_group' },
            { label: 'Machine', navigateTo: 'Machine' },
        ];
        const hasMachinePermission = machineItems.some(item =>
            screens.some((screen: { name: string }) => screen.name === item.navigateTo)
        );

        if (hasMachinePermission) {
            return (
                <MenuSection
                    key="machineSection"
                    title="Machine"
                    isOpen={isMenuListOpen.machine}
                    onToggle={() => setIsMenuListOpen((prev) => ({ ...prev, machine: !prev.machine }))}
                    items={machineItems.filter(item =>
                        screens.some((screen: { name: string }) => screen.name === item.navigateTo)
                    )}
                    navigation={navigation}
                />
            );
        }
        return null;
    };

    const renderChecklistMenu = () => {
        const checklistItems = [
            { label: 'Check List', navigateTo: 'Checklist' },
            { label: 'Group Check List', navigateTo: 'Checklist_group' },
            { label: 'Check List Option', navigateTo: 'Checklist_option' },
        ];
        const hasChecklistPermission = checklistItems.some(item =>
            screens.some((screen: { name: string }) => screen.name === item.navigateTo)
        );

        if (hasChecklistPermission) {
            return (
                <MenuSection
                    key="checklistSection"
                    title="Check List"
                    isOpen={isMenuListOpen.checklist}
                    onToggle={() => setIsMenuListOpen((prev) => ({ ...prev, checklist: !prev.checklist }))}
                    items={checklistItems.filter(item =>
                        screens.some((screen: { name: string }) => screen.name === item.navigateTo)
                    )}
                    navigation={navigation}
                />
            );
        }
        return null;
    };

    const additionalScreens = ["Create_form", "Preview", "Permission_deny"];

    return (
        <DrawerContentScrollView {...props}>
            {user.isAuthenticated && (
                <>
                    {renderPressable('Home', 'Home')}
                    {renderMachineMenu()}
                    {renderChecklistMenu()}

                    {additionalScreens.map(screenName =>
                        screens.some((screen: { name: string }) => screen.name === screenName)
                    )}

                    {screens.map((screen: { name: string }) => {
                        const { name } = screen;

                        if (!["Machine_group", "Machine", "Checklist", "Checklist_group", "Checklist_option", "Home", ...additionalScreens].includes(name)) {
                            return renderPressable(name.replaceAll("_", " "), name);
                        }

                        return null;
                    })}
                </>
            )}
        </DrawerContentScrollView>
    );
}

export default React.memo(CustomDrawerContent);
