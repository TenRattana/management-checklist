import { useRes } from "@/app/contexts/useRes";
import useMasterdataStyles from "@/styles/common/masterdata";
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Dialog, List, Text } from "react-native-paper";

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

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <View style={styles.dialog}>
                <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold]}>{"Group Checklist Info"}</Dialog.Title>
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
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity onPress={() => setDialogAdd()} style={styles.actionButton}>
                        <Text style={masterdataStyles.text}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </GestureHandlerRootView>
    );
};

export default InfoGroup_dialog;

const styles = StyleSheet.create({
    dialog: {
        borderRadius: 10,
        padding: 10,
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