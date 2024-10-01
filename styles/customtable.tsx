import { StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSpacing } from "@/hooks/useSpacing";
import { useRes } from "@/app/contexts";


const useCustomtableStyles = () => {
    const colors = useThemeColor();
    const { responsive, spacing } = useRes();

    return StyleSheet.create({
        container: {
            width: responsive === "small" ? "100%" : "95%",
            alignSelf: "center",
            marginVertical: 10,
            backgroundColor: colors.background,
            overflow: "hidden",
        },
        cardRow: {
            padding: spacing.medium,
            marginVertical: spacing.small,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: colors.warning,
        },
        row: {
            height: responsive === "small" ? 50 : responsive === "medium" ? 60 : 70,
            borderBottomWidth: 1,
            borderBottomColor: colors.background,
            paddingVertical: responsive === "small" ? 5 : 10,
        },
        icon: {
            margin: responsive === "small" ? 0 : 5,
        },
        iconAction: { backgroundColor: responsive !== "small" ? colors.light : "rgba(247, 243, 249, 1)" },

    });
};

export default useCustomtableStyles;
