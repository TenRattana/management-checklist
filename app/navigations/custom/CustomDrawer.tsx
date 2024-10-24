import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { useAuth } from "@/app/contexts/auth";
import { useRes } from '@/app/contexts/responsive';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { AccessibleView, Text } from '@/components';
import MenuSection from './MenuSection';
import useMasterdataStyles from "@/styles/common/masterdata";

const CustomDrawerContent = (props: any) => {
    const { navigation } = props;
    const { fontSize } = useRes();
    const masterdataStyles = useMasterdataStyles();
    const { session, loading } = useAuth();

    const [isMenuListOpen, setIsMenuListOpen] = useState<{ machine: boolean; checklist: boolean; match: boolean }>({
        machine: false,
        checklist: false,
        match: false,
    });

    if (loading) {
        return null;
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


    return (
        <DrawerContentScrollView {...props}>
            {session.UserName && (
                <AccessibleView name="container-customnav" style={{ flex: 1 }}>

                    {(session.GUserName === "SuperAdmin" || session.GUserName === "Admin") && (
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
                            {renderPressable('Scan QR Code', 'ScanQR')}
                            {renderPressable('Generate QR Code', 'GenerateQR')}
                            {renderPressable('Setting', 'Setting')}
                        </>
                    )}

                    {session.GUserName === "SuperAdmin" && (
                        <>
                            {renderPressable('Test', 'TestScreen')}
                            {renderPressable('Managepermissions', 'Managepermissions')}
                        </>
                    )}

                    {session.GUserName === "GeneralUser" && (
                        <>
                            {renderPressable('Home', 'Home')}
                            {renderPressable('Scan QR Code', 'ScanQR')}
                            {renderPressable('Setting', 'Setting')}
                        </>
                    )}
                </AccessibleView>
            )}
        </DrawerContentScrollView>
    );
}

export default React.memo(CustomDrawerContent);
