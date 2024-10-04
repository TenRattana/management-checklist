import React from "react";
import { View, Pressable } from "react-native";
import { Portal, Dialog, Text } from "react-native-paper";
import { SaveDialogProps } from "@/typing/value";

const SaveDialog = ({
    isVisible,
    setIsVisible,
    saveForm,
}: SaveDialogProps) => {
    return (
        <Portal>
            <Dialog
                visible={isVisible}
                onDismiss={() => setIsVisible(false)}
            >
                <Dialog.Title style={{ paddingLeft: 8 }}>Save Form</Dialog.Title>
                <Dialog.Content>
                    <Text
                        style={[{ marginBottom: 10, paddingLeft: 10 }]}
                    >
                        You are about to save the form. Are you sure?
                    </Text>

                    <View

                    >
                        <Pressable
                            onPress={() => saveForm()}
                        >
                            <Text>
                                Save
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

export default React.memo(SaveDialog);
