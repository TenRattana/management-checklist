import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.2;

const TestComponent = () => {
    const translateX = useSharedValue(-DRAWER_WIDTH);
    const mainTranslateX = useSharedValue(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerContent, setDrawerContent] = useState(null);

    const openDrawer = (content: any) => {
        setDrawerContent(content);
        translateX.value = withTiming(0, { duration: 300 });
        mainTranslateX.value = withTiming(DRAWER_WIDTH, { duration: 300 });
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 300 });
        mainTranslateX.value = withTiming(0, { duration: 300 });
        setDrawerOpen(false);
        setDrawerContent(null);
    };

    const drawerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const mainContentStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: mainTranslateX.value }],
    }));

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            const newValue = Math.max(-DRAWER_WIDTH, Math.min(0, translateX.value + event.translationX));
            translateX.value = newValue;
            mainTranslateX.value = Math.max(0, DRAWER_WIDTH + newValue);
        })
        .onEnd(() => {
            if (translateX.value > -DRAWER_WIDTH / 2) {
                openDrawer(drawerContent || 'main');
            } else {
                closeDrawer();
            }
        });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.content,
                        mainContentStyle,
                        { width: drawerOpen ? width - DRAWER_WIDTH : width },
                    ]}
                >
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => openDrawer('main')} style={styles.openButton}>
                            <Text style={styles.buttonText}>Open Drawer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => openDrawer('toolbox')} style={styles.toolboxButton}>
                            <Text style={styles.buttonText}>Toolbox</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.contentText}>Main Content</Text>
                </Animated.View>
            </GestureDetector>

            <Animated.View style={[styles.drawer, drawerStyle]}>
                <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
                    <Text style={styles.buttonText}>Close Drawer</Text>
                </TouchableOpacity>

                {drawerContent === 'main' && (
                    <Text style={styles.drawerContent}>Drawer Content</Text>
                )}

                {drawerContent === 'toolbox' && (
                    <Text style={styles.drawerContent}>Toolbox Content</Text>
                )}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    buttonContainer: {
        flexDirection: 'row',
        position: 'absolute',
        top: 20,
        left: 20,
    },
    openButton: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    toolboxButton: {
        backgroundColor: '#e67e22',
        padding: 10,
        borderRadius: 5,
    },
    contentText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    drawer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: DRAWER_WIDTH,
        backgroundColor: '#2ecc71',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    drawerContent: {
        fontSize: 16,
        color: '#fff',
    },
});

export default TestComponent;
