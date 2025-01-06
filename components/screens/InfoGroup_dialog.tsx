import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import useMasterdataStyles from "@/styles/common/masterdata";
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Dialog, Icon, IconButton, List, Text } from "react-native-paper";

const InfoGroup_dialog = ({
    setDialogAdd,
    option,
}: {
    setDialogAdd: () => void, option: {
        label: string;
        value: string;
    }[]
}) => {
    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes()
    const { theme } = useTheme()

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <View style={{ justifyContent: "space-between", flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                    <Icon source="information-outline" size={spacing.large} color={theme.colors.green} />
                    <Text style={[masterdataStyles.title, masterdataStyles.textBold, { paddingLeft: 8 }]}>Create Group Check List Option & Option Detail</Text>
                </View>
                <IconButton icon="close" size={20} iconColor={theme.colors.black} onPress={() => setDialogAdd()} />
            </View>

            <View style={styles.dialog}>
                <View style={{ marginHorizontal: 10 }}>
                    {option?.length > 0 ? (
                        option?.map((op, index) => (
                            <List.Item
                                key={index}
                                title={op.label}
                                style={styles.optionItem}
                                descriptionStyle={{ fontSize: spacing.small }}
                                titleStyle={{ fontSize: spacing.small }}
                            />
                        ))
                    ) : (
                        <Text style={masterdataStyles.text}>No options available</Text>
                    )}
                </View>
            </View>

            <View style={[masterdataStyles.containerAction, { paddingVertical: 10, justifyContent: "flex-end" }]}>
                <TouchableOpacity
                    onPress={() => setDialogAdd()}
                    style={[masterdataStyles.backMain, styles.button, { marginLeft: 10, flexDirection: 'row' }]}
                >
                    <Icon source="close" size={spacing.large} color={theme.colors.fff} />

                    <Text style={[masterdataStyles.text, masterdataStyles.textFFF, masterdataStyles.textBold, { paddingLeft: 15 }]}>
                        Cancel
                    </Text>
                </TouchableOpacity>
            </View>
        </GestureHandlerRootView>
    );
};

export default InfoGroup_dialog;

const styles = StyleSheet.create({
    dialog: {
        borderRadius: 10,
        paddingVertical: 10,
    },
    button: {
        alignSelf: 'flex-end',
        marginRight: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 4,
    },
    title: {
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    optionItem: {
        paddingVertical: 5,
    },
    noOptionsText: {
        color: "gray",
        textAlign: "center",
        marginVertical: 10,
    },
    actionButton: {
        padding: 10,
        marginHorizontal: 5,
    },
});