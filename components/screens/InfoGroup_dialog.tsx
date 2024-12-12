import { useRes } from "@/app/contexts/useRes";
import useMasterdataStyles from "@/styles/common/masterdata";
import { GroupCheckListOption, CheckListOption } from "@/typing/type";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Dialog, List, Text } from "react-native-paper";

const InfoGroup_dialog = ({
    setDialogAdd,
    option,
    glc
}: { setDialogAdd: () => void, option: GroupCheckListOption[], glc: string | undefined }) => {
    const [options, setOptions] = useState<{ label: string; value: string; }[]>([]);
    const [GCLOptionName, setGCLOptionName] = useState<string | undefined>(undefined);
    const masterdataStyles = useMasterdataStyles();
    const { spacing } = useRes()

    useEffect(() => {
        if (option.length > 0 && glc !== undefined) {
            const filtered = option.find((item: GroupCheckListOption) => item.GCLOptionID === glc);
            if (filtered) {
                const filteredOptions = filtered.CheckListOptions?.map((op: CheckListOption) => ({
                    label: op.CLOptionName,
                    value: op.CLOptionID,
                })) || [];
                setGCLOptionName(filtered.GCLOptionName);
                setOptions(filteredOptions);
            }
        }
    }, [option, glc]);

    return (
        <View style={styles.dialog}>
            <Dialog.Title style={[masterdataStyles.text, masterdataStyles.textBold]}>{GCLOptionName || "Group Checklist Info"}</Dialog.Title>
            <View style={{ marginHorizontal: 10 }}>
                {options.length > 0 ? (
                    options.map((option, index) => (
                        <List.Item
                            key={index}
                            title={option.label}
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
    );
};

export default InfoGroup_dialog;

const styles = StyleSheet.create({
    dialog: {
        borderRadius: 10,
        padding: 10,
        flex: 1,
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