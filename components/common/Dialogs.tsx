import React, { useMemo, useState } from "react";
import { View, Pressable } from "react-native";
import { Portal, Dialog, Button, Text } from "react-native-paper";

interface DialogsProps {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    actions?: string;
    title?: string;
    messages?: string;
    handleDialog: (actions?: string, data?: string) => void;
    handleBlur?: () => void;
    data?: string;
}

const Dialogs: React.FC<DialogsProps> = ({
    isVisible,
    setIsVisible,
    actions,
    title,
    messages,
    handleDialog,
    handleBlur,
    data,
}) => {
    console.log("Dialog_checkble");

    return (
        <Portal>
            <Dialog
                visible={isVisible}
                onDismiss={() => setIsVisible(false)}
            >
                <Dialog.Icon icon="alert" size={90} />

                <Dialog.Title style={{ alignSelf: "center" }}>
                    {title || ""}
                </Dialog.Title>
                <Dialog.Content>
                    <Text
                        variant="bodyMedium"

                    >
                        You have selected{" "}
                        <Text>
                            {messages || ""}
                        </Text>
                        . Please confirm your action.
                    </Text>

                    <View>
                        <Pressable
                            onPress={() => {
                                handleDialog(actions, data);
                                setIsVisible(false);
                            }}
                        >
                            <Text>
                                Ok
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setIsVisible(false)}
                        >
                            <Text>
                                Cancel
                            </Text>
                        </Pressable>
                    </View>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
};

export default Dialogs;
