import { Camera } from "expo-camera/legacy";
import React, { useCallback, useEffect, useState } from "react";
import { Button, StyleSheet } from "react-native";
import { ScanQRProps } from "@/typing/tag";
import { useFocusEffect } from "expo-router";
import { useToast } from "@/app/contexts/useToast";
import { AccessibleView, Text } from '@/components'

const ScanQR: React.FC<ScanQRProps> = ({ navigation }) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState<boolean>(false);
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState<boolean>(true);
    const { handleError } = useToast()
    useFocusEffect(
        useCallback(() => {
            (async () => {
                const { status } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(status === "granted");
            })();

            return () => setCameraActive(false);
        }, [])
    )

    useEffect(() => {
        if (scanned && qrValue) {
            handleAction(qrValue);
        }
    }, [scanned, qrValue]);

    if (hasPermission === null) {
        return <AccessibleView name="container-scan">{false}</AccessibleView>;
    }

    if (!hasPermission) {
        return (
            <AccessibleView name="container-hasPermission" style={styles.container}>
                <Text style={{ textAlign: "center" }}>
                    We need your permission to show the camera
                </Text>
                <Button
                    onPress={() => Camera.requestCameraPermissionsAsync()}
                    title="Grant Permission"
                />
            </AccessibleView>
        );
    }

    const handleAction = (value: string | null) => {
        try {
            if (value) {
                navigation.navigate("InputFormMachine", {
                    machineId: value,
                });
                setScanned(false);
                setCameraActive(false);
            }
        } catch (error) {
            handleError(error)
        }
    };

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (!scanned) {
            setScanned(true);
            setQrValue(data);
        }
    };

    return (
        <AccessibleView name="container-scan" style={styles.container}>
            {cameraActive && !scanned ? (
                <Camera style={styles.camera} onBarCodeScanned={handleBarCodeScanned} />
            ) : (
                <AccessibleView name="scan-qr" style={styles.resultContainer}>
                    <Text style={styles.resultText}>Scanned QR Code</Text>
                    <Button title="Scan Again" onPress={() => { setScanned(false); setCameraActive(true); }} />
                </AccessibleView>
            )}
        </AccessibleView>
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
