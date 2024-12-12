import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Portal, Dialog, Text } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import AccessibleView from "@/components/AccessibleView";
import { DialogsProps } from "@/typing/tag";
import { useRes } from "@/app/contexts/useRes";

const Dialogs: React.FC<DialogsProps> = ({
    isVisible,
    setIsVisible,
    actions,
    title = "",
    messages = "",
    handleDialog,
    data,
}) => {
    const masterdataStyles = useMasterdataStyles();
    const { fontSize , responsive } = useRes()
    const handleOkPress = () => {
        handleDialog(actions, data);
        setIsVisible(false);
    };

    return (
        <AccessibleView name="dialog-container" style={{ display: isVisible ? 'flex' : 'none' }}>
            <Portal>
                <Dialog
                    visible={isVisible}
                    onDismiss={() => setIsVisible(false)}
                    style={[{ width: responsive === "large" ? 800 :  '60%', alignSelf: 'center' }]}
                >
                    <Dialog.Icon icon="alert" size={90} />

                    <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold, masterdataStyles.textDark, { textAlign: "center" }]}>
                        {title}
                    </Dialog.Title>

                    <Dialog.Content style={{ padding: 20 }}>
                        <Text
                            variant="bodyMedium"
                            style={[masterdataStyles.text, masterdataStyles.textDark, { paddingVertical: fontSize === "large" ? 7 : 5, textAlign: "center", marginBottom: 10 }]}
                        >
                            You have selected{" "}
                            <Text style={[masterdataStyles.textBold, masterdataStyles.textError]}>
                                {messages}
                            </Text>
                            . Please confirm your action.
                        </Text>

                        <View style={[masterdataStyles.containerAction, { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }]}>
                            <TouchableOpacity
                                onPress={handleOkPress}
                                style={[masterdataStyles.button, masterdataStyles.backMain, { flex: 1, marginRight: 5 }]}
                            >
                                <Text style={[masterdataStyles.text, masterdataStyles.textFFF, masterdataStyles.textBold]}>
                                    Ok
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setIsVisible(false)}
                                style={[masterdataStyles.button, masterdataStyles.backMain, { flex: 1, marginLeft: 5 }]}
                            >
                                <Text style={[masterdataStyles.text, masterdataStyles.textFFF, masterdataStyles.textBold]}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Dialog.Content>
                </Dialog>
            </Portal>
        </AccessibleView>
    );
};

export default React.memo(Dialogs);
