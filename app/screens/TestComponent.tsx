import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { withSpring, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const TOOLBOX_WIDTH = 250;

const App = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerForm, setDrawerForm] = useState(false);

    const translateXToolbox = useSharedValue(-TOOLBOX_WIDTH);
    const translateXForm = useSharedValue(-TOOLBOX_WIDTH);

    // ใช้ useAnimatedStyle เพื่อจัดตำแหน่งของ Toolbox
    const toolboxStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: withSpring(translateXToolbox.value) }],
    }));

    // ใช้ useAnimatedStyle เพื่อจัดตำแหน่งของ Form
    const formStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: withSpring(translateXForm.value) }],
    }));

    // ฟังก์ชันสำหรับเปิดหรือปิด Toolbox
    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
        translateXToolbox.value = drawerOpen ? 300 : 0;
        if (drawerForm) {
            setDrawerForm(false);
        }
    };

    // ฟังก์ชันสำหรับเปิดหรือปิด Form
    const toggleForm = () => {
        setDrawerForm(!drawerForm);
        translateXForm.value = drawerForm ? 300 : 0;
        if (drawerOpen) {
            setDrawerOpen(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.sidebar}>
                <TouchableOpacity onPress={toggleDrawer} style={styles.sidebarButton}>
                    <Text style={styles.buttonText}>{drawerOpen ? 'Close Toolbox' : 'Open Toolbox'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleForm} style={styles.sidebarButton}>
                    <Text style={styles.buttonText}>{drawerForm ? 'Close Form' : 'Open Form'}</Text>
                </TouchableOpacity>
            </View>

            <Animated.View style={[styles.drawer, toolboxStyle]}>
                <View style={styles.drawerContent}>
                    <Text style={styles.drawerText}>Toolbox Content</Text>
                </View>
            </Animated.View>

            <Animated.View style={[styles.drawer, formStyle]}>
                <View style={styles.drawerContent}>
                    <Text style={styles.drawerText}>Form Content</Text>
                </View>
            </Animated.View>

            <View style={styles.mainContent}>
                <Text style={styles.mainText}>Main Content Goes Here</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f4f7fc',
    },
    sidebar: {
        width: 70,
        backgroundColor: '#004aad',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
    },
    sidebarButton: {
        backgroundColor: '#005eff',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        elevation: 2,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 11,
        textAlign: 'center',
        fontWeight: '600',
    },
    drawer: {
        width: 300,
        flex:1,
        backgroundColor: '#ffffff',
        borderRightWidth: 1,
        borderColor: '#d1d1d1',
    },
    drawerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    drawerText: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eef2f7',
        padding: 20,
    },
    mainText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#222222',
    },
});

export default App;
