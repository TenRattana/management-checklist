
import React, { useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from "@/app/contexts/auth";
import { DrawerContentScrollView } from '@react-navigation/drawer';
import MenuSection from './MenuSection';

const CustomDrawerContent = (props: any) => {
    console.log("CustomDrawerContent");

    const { navigation } = props;

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
                                style={styles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={styles.menuText}>Home</Text>
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
                                    { label: 'Check List Option', navigateTo: 'Checklist_option' },
                                    { label: 'Group Check List', navigateTo: 'Checklist_group' },
                                ]}
                                navigation={navigation}
                            />

                            <MenuSection
                                title="Match"
                                isOpen={isMenuListOpen.match}
                                onToggle={() => setIsMenuListOpen((prev) => ({ ...prev, match: !prev.match }))}
                                items={[
                                    { label: 'Match Option & Group Check List', navigateTo: 'Match_checklist_option' },
                                    { label: 'Match Form & Machine', navigateTo: 'Match_form_machine' },
                                ]}
                                navigation={navigation}
                            />

                            <Pressable
                                onPress={() => navigation.navigate('Form')}
                                style={styles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={styles.menuText}>List Form</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('Expected_result')}
                                style={styles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={styles.menuText}>List Result</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('ScanQR')}
                                style={styles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={styles.menuText}>Scan QR Code</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('GenerateQR')}
                                style={styles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={styles.menuText}>Generate QR Code</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('Setting')}
                                style={styles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={styles.menuText}>Setting</Text>
                            </Pressable>
                        </>
                    )}

                    {(session.GUserName === "SuperAdmin") && (
                        <>
                            <Pressable
                                onPress={() => navigation.navigate('Test')}
                                style={styles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={styles.menuText}>Test</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('Managepermissions')}
                                style={styles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={styles.menuText}>Managepermissions</Text>
                            </Pressable>
                        </>
                    )}

                    {(session.GUserName === "GeneralUser") && (
                        <>
                            <Pressable
                                onPress={() => navigation.navigate('Home')}
                                style={styles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={styles.menuText}>Home</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('ScanQR')}
                                style={styles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={styles.menuText}>Scan QR Code</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('Setting')}
                                style={styles.menuItem}
                                android_ripple={{ color: '#f0f0f0' }}
                            >
                                <Text style={styles.menuText}>Setting</Text>
                            </Pressable>
                        </>
                    )}
                </>
            )}

        </DrawerContentScrollView>
    );
}

export default React.memo(CustomDrawerContent)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 10,
    },
    menuItem: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        minHeight: 68,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 16,
    },
    subMenuItem: {
        paddingLeft: 40,
        minHeight: 68,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subMenuText: {
        fontSize: 16,
        color: '#5e5e5e',
    },
});

