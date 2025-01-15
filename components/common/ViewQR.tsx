import { StyleSheet, Text } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import * as Print from 'expo-print';
import QRCode from 'react-native-qrcode-svg';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useTheme } from '@/app/contexts/useTheme';
import { Dialog, IconButton, Portal } from 'react-native-paper';
import { useRes } from '@/app/contexts/useRes';
import { spacing } from '@/constants/Spacing';

const ViewQR = ({ value, open, setOpen, display }: { value: string, open: boolean, setOpen: (v: boolean) => void, display: string }) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()
    const { responsive } = useRes()

    const [qrData, setQrData] = useState('');
    const qrRef = useRef<any>(null);

    useEffect(() => {
        if (qrRef.current && open) {
            qrRef.current.toDataURL(callback);
        }
    }, [open, value]);

    const callback = (dataURL: any) => {
        setQrData(dataURL);
    };

    const handlePrint = async () => {
        const htmlContent = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 10px;
                    }
                    h1 {
                        font-size: 24px;
                    }
                    h4 {
                        font-size: 18px;
                    }
                    img {
                        width: 100%;
                        padding: 10px;
                    }
                </style>
            </head>
            <body>
                <h1>QR Code for Machine ID</h1>
                <h4>Machine Name : ${display}</h4>
                <img src="${qrData}" alt="QR Code" />
            </body>
        </html>
    `;

        try {
            await Print.printAsync({ html: htmlContent });
        } catch (error) {
            console.error("Error printing the HTML:", error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            zIndex: 3,
            width: responsive === "large" ? 800 : "60%",
            alignSelf: 'center',
            paddingHorizontal: 20,
            paddingVertical: 50,
            borderRadius: 4,
            backgroundColor: theme.colors.background,
            alignContent: 'center',
            alignItems: 'center',
            shadowColor: undefined
        }
    });

    return (
        <Portal>
            <Dialog visible={open} onDismiss={() => setOpen(false)} style={styles.container}>
                <QRCode
                    value={value || "value"}
                    size={350}
                    color="black"
                    backgroundColor={theme.colors.background}
                    logoBorderRadius={5}
                    logoMargin={20}
                    getRef={(c) => { qrRef.current = c }}
                />
                <Text style={[{ marginVertical: 40, fontSize: spacing.medium }]}>
                    {`Scan this code for open form ${display}.`}
                </Text>

                <IconButton
                    icon="printer"
                    iconColor={theme.colors.onBackground}
                    onPress={handlePrint}
                    style={{ position: 'absolute', right: 0, bottom: -5 }}
                />
            </Dialog>
        </Portal>
    );
}

export default ViewQR;
