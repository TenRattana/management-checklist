import React, { useState, useCallback, useEffect } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useAuth } from "@/app/contexts";
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Text } from '@/components';
import MenuSection from './MenuSection';
import useMasterdataStyles from "@/styles/common/masterdata";
import { useSelector } from 'react-redux';

interface CustomDrawerProps extends DrawerContentComponentProps {
    initialRouteName: string;
}
const CustomDrawerContent: React.FC<CustomDrawerProps> = (props) => {
    const { navigation, initialRouteName } = props
    const masterdataStyles = useMasterdataStyles();
    const user = useSelector((state: any) => state.user);
    const { loading } = useAuth();

    const [isMenuListOpen, setIsMenuListOpen] = useState({
        machine: false,
        checklist: false,
    });

    useEffect(() => {
        if (initialRouteName) {
            navigation.navigate(initialRouteName);
        }
    }, [initialRouteName, navigation]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const renderPressable = (label: string, navigateTo: string) => (
        <Pressable
            onPress={() => navigation.navigate(navigateTo)}
            style={masterdataStyles.menuItemNav}
            android_ripple={{ color: '#f0f0f0' }}
        >
            <Text style={masterdataStyles.menuText}>{label}</Text>
        </Pressable>
    );

    return user.username ? (
        <DrawerContentScrollView {...props} style={{ flex: 1 }}>
            <>
                {(user.role === "SuperAdmin" || user.role === "Admin") && (
                    <>
                        {renderPressable('Home', 'Home')}

                        <MenuSection
                            title="Machine"
                            isOpen={isMenuListOpen.machine}
                            onToggle={() => setIsMenuListOpen((prev) => ({ ...prev, machine: !prev.machine }))}
                            items={[
                                { label: 'Machine Group', navigateTo: 'Machine_group' },
                                { label: 'Machine', navigateTo: 'Machine' },
                            ]}
                            navigation={navigation}
                        />

                        <MenuSection
                            title="Check List"
                            isOpen={isMenuListOpen.checklist}
                            onToggle={() => setIsMenuListOpen((prev) => ({ ...prev, checklist: !prev.checklist }))}
                            items={[
                                { label: 'Check List', navigateTo: 'Checklist' },
                                { label: 'Group Check List', navigateTo: 'Checklist_group' },
                                { label: 'Check List Option', navigateTo: 'Checklist_option' },
                            ]}
                            navigation={navigation}
                        />

                        {renderPressable('Match Option & Group Check List', 'Match_checklist_option')}
                        {renderPressable('List Form', 'Form')}
                        {renderPressable('Match Form & Machine', 'Match_form_machine')}
                        {renderPressable('List Result', 'Expected_result')}
                        {renderPressable('List Approve', 'Approve')}
                        {renderPressable('Scan QR Code', 'ScanQR')}
                        {renderPressable('Generate QR Code', 'GenerateQR')}
                        {renderPressable('Setting', 'Setting')}
                        {renderPressable('Configulation', 'Config')}
                    </>
                )}

                {user.role === "SuperAdmin" && (
                    <>
                        {renderPressable('Managepermissions', 'Managepermissions')}
                        {renderPressable('Test', 'Test')}
                    </>
                )}

                {user.role === "GeneralUser" && (
                    <>
                        {renderPressable('Home', 'Home')}
                        {renderPressable('Scan QR Code', 'ScanQR')}
                        {renderPressable('List Result', 'Expected_result')}
                        {renderPressable('Setting', 'Setting')}
                    </>
                )}

                {user.role === "Head" && (
                    <>
                        {renderPressable('Home', 'Home')}
                        {renderPressable('Scan QR Code', 'ScanQR')}
                        {renderPressable('List Result', 'Expected_result')}
                        {renderPressable('List Approve', 'Approve')}
                        {renderPressable('Setting', 'Setting')}
                    </>
                )}
            </>
        </DrawerContentScrollView>
    ) : null;
}

export default React.memo(CustomDrawerContent);
