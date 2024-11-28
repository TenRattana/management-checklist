import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler'; // ใช้ Swipeable
import { IconButton } from 'react-native-paper'; // ใช้ IconButton จาก react-native-paper

const TestComponent = () => {
    const renderLeftActions = () => (
        <View style={styles.leftActions}>
            <IconButton icon="check" iconColor="white" size={30} onPress={() => console.log("Item checked")} />
        </View>
    );

    const renderRightActions = () => (
        <View style={styles.rightActions}>
            <IconButton icon="delete" iconColor="white" size={30} onPress={() => console.log("Item deleted")} />
        </View>
    );

    return (
        <View style={styles.container}>
            <Swipeable renderLeftActions={renderLeftActions} renderRightActions={renderRightActions}>
                <View style={styles.item}>
                    <Text style={styles.text}>Swipe Me</Text>
                </View>
            </Swipeable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        width: 300,
        height: 60,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        borderRadius: 8,
    },
    text: {
        fontSize: 18,
        color: '#333',
    },
    leftActions: {
        flex: 1,
        backgroundColor: '#4caf50',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        borderRadius: 8,
    },
    rightActions: {
        flex: 1,
        backgroundColor: '#f44336',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        borderRadius: 8,
    },
});

export default TestComponent;
