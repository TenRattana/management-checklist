import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Inputs } from "@/components";

const GenerateQR = () => {
    const [qrValue, setQrValue] = useState<string>("");
    console.log("GenerateQR");

    const generateQR = (value: string) => {
        return (
            <QRCode
                value={value || "No input"}
                size={200}
                color="black"
                backgroundColor="white"
            />
        );
    };

    const handleChange = (value: string) => {
        setQrValue(value);
    };

    return (
        <View style={styles.container}>
            <Inputs
                placeholder=""
                label="QR Code Example"
                value={qrValue}
                handleChange={handleChange}
            />
            {generateQR(qrValue)}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    text: {
        fontSize: 20,
        marginBottom: 20,
    },
});

export default React.memo(GenerateQR);
