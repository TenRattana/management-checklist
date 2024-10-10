import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import AccessibleView from "../AccessibleView";
import { useNavigation } from "@react-navigation/native";

const NotFoundScreen = () => {
    const navigation = useNavigation();
    console.log("NotFoundScreen");

    return (
        <>
            <AccessibleView style={styles.container}>
                <Text style={styles.title}>This form doesn't exist.</Text>
                <Pressable style={styles.link} onPress={() => navigation.navigate("ScanQR")}>
                    <Text style={styles.linkText}>Scan again!</Text>
                </Pressable>
            </AccessibleView>
        </>
    );
};

export default React.memo(NotFoundScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        color: '#1e90ff',
    },
});
