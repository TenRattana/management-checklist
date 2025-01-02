import LottieView from "lottie-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";

const Submit = React.memo(() => {
    return (
        <View style={styles.container}>
            <LottieView
                source={require('@/assets/animations/Submit.json')}
                autoPlay
                style={styles.lottie}
                direction={1}
                webStyle={styles.lottie}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: '50%',
        height: '50%',
    },
});

export default Submit;