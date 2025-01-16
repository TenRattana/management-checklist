import { StyleSheet, Text, Platform } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import * as Print from "expo-print";
import QRCode from "react-native-qrcode-svg";
import { useTheme } from "@/app/contexts/useTheme";
import { useRes } from "@/app/contexts/useRes";
import { Dialog, IconButton, Portal } from "react-native-paper";
import { spacing } from "@/constants/Spacing";
import useMasterdataStyles from "@/styles/common/masterdata";

const ViewQR = ({
    value,
    open,
    setOpen,
    display,
}: {
    value: string;
    open: boolean;
    setOpen: (v: boolean) => void;
    display: string;
}) => {
    const masterdataStyles = useMasterdataStyles();
    const { theme } = useTheme();
    const [base64Code, setBase64Code] = useState<string>("");
    const [isReadyToPrint, setIsReadyToPrint] = useState<boolean>(false);

    const handlePrint = useCallback(async () => {
        if (!base64Code) {
            console.log("QR Code data is still loading...");
            return;
        }

        const printHtmlContent = `
       <html>
            <head>
                <style>
                    * {
                        margin: 0;
                        padding:0;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        justify-content: center; 
                        align-items: center; 
                        min-height: 100vh; 
                    }
                    h4 {
                        padding-top:5px;
                        padding-bottom:5px;
                    }
                    img {
                        padding-top:5px;
                        padding-bottom:5px;
                        max-width: 300px; 
                        height: auto; 
                    }
                    h5 {
                        padding-top: 5px;
                    }
                </style>
            </head>
            <body>
                <h4>${`QR Code : ${display}.`}</h4>
                <img src="data:image/png;base64,${base64Code}" alt="QR Code" />
                <h5>Scan this code for open form.</h5>
            </body>
        </html>
        `;

        if (Platform.OS === "web") {
            const printWindow = window.open("", "", "width=1980,height=1090");
            printWindow.document.write(printHtmlContent);
            printWindow.document.close();
            printWindow.print();
        } else {
            try {
                const printResult = await Print.printToFileAsync({
                    html: printHtmlContent,
                });
                if (printResult && printResult.uri) {
                    await Print.printAsync({ uri: printResult.uri });
                } else {
                    console.error("Failed to create PDF, URI is undefined.");
                }
            } catch (error) {
                console.error("Error creating or printing PDF:", error);
            }
        }
    }, [base64Code]);

    useEffect(() => {
        if (base64Code) {
            setIsReadyToPrint(true);
        }
    }, [base64Code]);

    return (
        <Portal>
            <Dialog
                visible={open}
                onDismiss={() => setOpen(false)}
                style={[
                    masterdataStyles.containerDialog,
                    { alignItems: "center", alignSelf: "center", paddingTop: 20 },
                ]}
            >
                <QRCode
                    value={value || "value"}
                    size={300}
                    color="black"
                    backgroundColor={theme.colors.background}
                    logoBorderRadius={5}
                    logoMargin={20}
                    getRef={(ref) => {
                        if (ref && !base64Code) {
                            ref.toDataURL((base64: string) => {
                                setBase64Code(base64);
                            });
                        }
                    }}
                />
                <Text style={[{ marginVertical: 40, fontSize: spacing.medium }]}>
                    {`Scan this code for open form ${display}.`}
                </Text>

                <IconButton
                    icon="printer"
                    iconColor={theme.colors.onBackground}
                    onPress={handlePrint}
                    style={{ position: "absolute", right: 0, bottom: -5 }}
                    disabled={!isReadyToPrint}
                />
            </Dialog>
        </Portal>
    );
};

export default ViewQR;
