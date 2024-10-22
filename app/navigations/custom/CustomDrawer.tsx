
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { useAuth } from "@/app/contexts/auth";
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Text } from '@/components';
import MenuSection from './MenuSection';
import useMasterdataStyles from "@/styles/common/masterdata";

const CustomDrawerContent = (props: any) => {
    console.log("CustomDrawerContent");

    const { navigation } = props;
    const masterdataStyles = useMasterdataStyles()

    const [isMenuListOpen, setIsMenuListOpen] = useState<{ machine: boolean; checklist: boolean; match: boolean }>({
        machine: false,
        checklist: false,
        match: false,
    });

    const { session, loading } = useAuth();

    if (loading) {
        return null;
    }

    return (
        <DrawerContentScrollView {...props}>
            {session.UserName && (
                <>
                    {(session.GUserName === "SuperAdmin" || session.GUserName === "Admin") && (
                        <>
                            <Pressable
                                onPress={() => navigation.navigate('Home')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>Home</Text>
                            </Pressable>

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

                            <Pressable
                                onPress={() => navigation.navigate('Match_checklist_option')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>Match Option & Group Check List</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('Form')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>List Form</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('Match_form_machine')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>Match Form & Machine</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('Expected_result')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>List Result</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('ScanQR')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>Scan QR Code</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('GenerateQR')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>Generate QR Code</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('Setting')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>Setting</Text>
                            </Pressable>
                        </>
                    )}

                    {(session.GUserName === "SuperAdmin") && (
                        <>
                            <Pressable
                                onPress={() => navigation.navigate('TestScreen')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>Test</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('Managepermissions')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>Managepermissions</Text>
                            </Pressable>
                        </>
                    )}

                    {(session.GUserName === "GeneralUser") && (
                        <>
                            <Pressable
                                onPress={() => navigation.navigate('Home')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>Home</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('ScanQR')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>Scan QR Code</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('Setting')}
                                style={masterdataStyles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={masterdataStyles.menuText}>Setting</Text>
                            </Pressable>
                        </>
                    )}
                </>
            )}

        </DrawerContentScrollView>
    );
}

export default React.memo(CustomDrawerContent)


