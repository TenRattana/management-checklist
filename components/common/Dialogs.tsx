import React from "react";
import { Pressable } from "react-native";
import { Portal, Dialog, Text } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import AccessibleView from "@/components/AccessibleView";
import { DialogsProps } from "@/typing/tag";

const Dialogs = ({
    isVisible,
    setIsVisible,
    actions,
    title,
    messages,
    handleDialog,
    handleBlur,
    data,
}: DialogsProps) => {
    console.log("Dialog_checkble");
    const masterdataStyles = useMasterdataStyles()

    return (
        <AccessibleView>
            <Portal>
                <Dialog
                    visible={isVisible}
                    onDismiss={() => setIsVisible(false)}
                    style={masterdataStyles.containerDialog}
                >
                    <Dialog.Icon icon="alert" size={90} />

                    <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, { textAlign: "center" }]}>
                        {title || ""}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text
                            variant="bodyMedium"
                            style={[masterdataStyles.text, { marginTop: 10, paddingTop: 15, textAlign: "center", marginBottom: 10 }]}
                        >
                            You have selected{" "}
                            <Text style={[masterdataStyles.textBold, masterdataStyles.textError]}>
                                {messages || ""}
                            </Text>
                            . Please confirm your action.
                        </Text>

                        <AccessibleView style={masterdataStyles.containerAction}>
                            <Pressable
                                onPress={() => {
                                    handleDialog(actions, data);
                                    setIsVisible(false);
                                }}
                                style={[
                                    masterdataStyles.button,
                                    masterdataStyles.backMain,
                                ]}
                            >
                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>
                                    Ok
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setIsVisible(false)}
                                style={[masterdataStyles.button, masterdataStyles.backDis]}
                            >
                                <Text style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textLight]}>
                                    Cancel
                                </Text>
                            </Pressable>
                        </AccessibleView>
                    </Dialog.Content>
                </Dialog>
            </Portal>
        </AccessibleView>
    );
};

export default React.memo(Dialogs);
