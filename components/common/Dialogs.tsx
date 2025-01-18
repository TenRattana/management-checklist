import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Portal, Dialog, Text, Icon, IconButton } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import AccessibleView from "@/components/AccessibleView";
import { DialogsProps } from "@/typing/tag";
import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";

const Dialogs = ({ isVisible, setIsVisible, actions, title = "", messages = "", handleDialog, data, }: DialogsProps) => {
    const masterdataStyles = useMasterdataStyles();
    const { fontSize, responsive, spacing } = useRes()
    const { theme } = useTheme()
    const handleOkPress = () => {
        handleDialog(actions, data);
        setIsVisible(false);
    };

    const styles = StyleSheet.create({
        container: {
            width: responsive === "large" ? 600 : '60%',
            alignSelf: 'center',
            borderRadius: 4,
            backgroundColor: theme.colors.background,
        },
        containerAction: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 15,
            paddingVertical: 10
        }
    })

    return (
        <AccessibleView name="dialog-container" style={{ display: isVisible ? 'flex' : 'none' }}>
            <Portal>
                <Dialog
                    visible={isVisible}
                    onDismiss={() => setIsVisible(false)}
                    style={styles.container}
                >
                    <Dialog.Content style={{ paddingHorizontal: 20, paddingBottom: 20, marginTop: 10 }}>

                        <View style={{ justifyContent: "space-between", flexDirection: 'row' }}>
                            <IconButton icon="information" size={25} iconColor={theme.colors.error} mode="contained" />
                            <IconButton icon="close" size={20} iconColor={theme.colors.onBackground} onPress={() => setIsVisible(false)} />
                        </View>

                        <Text
                            variant="bodyMedium"
                            style={[masterdataStyles.text, masterdataStyles.title, { paddingVertical: 10, paddingLeft: 10 }]}
                        >
                            {title} {"Action"}
                        </Text>

                        <Text
                            variant="bodyMedium"
                            style={[masterdataStyles.text, { paddingVertical: fontSize === "large" ? 7 : 5, paddingLeft: 10 }]}
                        >
                            You have selected{" "}
                            <Text style={[masterdataStyles.textBold, masterdataStyles.textError]}>
                                {messages}
                            </Text>
                            . Please confirm your action.
                        </Text>
                    </Dialog.Content>

                    <View style={[masterdataStyles.containerAction, styles.containerAction]}>
                        <TouchableOpacity
                            onPress={handleOkPress}
                            style={[masterdataStyles.button, { flex: 1, marginRight: 5, flexDirection: "row", backgroundColor: theme.colors.gay }]}
                        >
                            <Icon source="check" size={spacing.large} color={theme.colors.black} />

                            <Text style={[masterdataStyles.text000, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                Yes
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setIsVisible(false)}
                            style={[masterdataStyles.button, masterdataStyles.backMain, { flex: 1, marginLeft: 10, flexDirection: "row" }]}
                        >
                            <Icon source="close" size={spacing.large} color={theme.colors.fff} />

                            <Text style={[masterdataStyles.text, masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>

                </Dialog>
            </Portal>
        </AccessibleView>
    );
};

export default React.memo(Dialogs);
