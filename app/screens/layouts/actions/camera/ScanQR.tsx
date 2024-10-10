import { Camera } from "expo-camera/legacy";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { ScanQRProps } from "@/typing/tag";

const ScanQR: React.FC<ScanQRProps> = ({ navigation }) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState<boolean>(false);
    const [qrValue, setQrValue] = useState<string | null>(null);
    console.log("ScanQR");

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }, []);

    useEffect(() => {
        if (scanned && qrValue) {
            handleAction(qrValue);
        }
    }, [scanned, qrValue]);

    if (hasPermission === null) {
        return <View />;
    }

    if (!hasPermission) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: "center" }}>
                    We need your permission to show the camera
                </Text>
                <Button
                    onPress={() => Camera.requestCameraPermissionsAsync()}
                    title="Grant Permission"
                />
            </View>
        );
    }

    const handleAction = (value: string | null) => {
        try {
            if (value) {
                navigation.navigate("InputFormMachine", {
                    machineId: value,
                });
                setScanned(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (!scanned) {
            setScanned(true);
            setQrValue(data);
            console.log(
                `Bar code with type ${type} and data ${data} has been scanned!`
            );
        }
    };

    return (
        <View style={styles.container}>
            {!scanned ? (
                <Camera style={styles.camera} onBarCodeScanned={handleBarCodeScanned} />
            ) : (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>Scanned QR Code</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    camera: {
        flex: 1,
    },
    resultContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    resultText: {
        fontSize: 24,
        color: "black",
        marginBottom: 20,
    },
    text: {
        fontSize: 18,
        color: "blue",
        textDecorationLine: "underline",
    },
});

export default ScanQR;
