import { StyleSheet } from "react-native";
import { useRes, useTheme } from "@/app/contexts";

const useCustomtableStyles = () => {
    const { theme } = useTheme();
    const { responsive, spacing } = useRes();

    return StyleSheet.create({
        container: {
            width: responsive === "small" ? "100%" : "95%",
            alignSelf: "center",
            marginVertical: 10,
            backgroundColor: theme.colors.background,
            overflow: "hidden",
        },
        eventColumn: {
            flex: 1,
            flexDirection: 'row',
        },
        eventCell: {
        },
        cardRow: {
            flex: 1,
            paddingHorizontal: spacing.medium,
            marginVertical: 10,
            borderRadius: 2,
            borderWidth: 1,
            borderColor: theme.colors.surfaceVariant,
        },
        row: {
            height: responsive === "small" ? 50 : responsive === "medium" ? 60 : 70,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.background,
            paddingVertical: responsive === "small" ? 5 : 10,
        },
        icon: {
            margin: responsive === "small" ? 0 : 5,
        },
        iconAction: { backgroundColor: responsive !== "small" ? theme.colors.background : "rgba(247, 243, 249, 1)" },

    });
};

export default useCustomtableStyles;
