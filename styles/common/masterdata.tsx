import { StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSpacing } from "@/hooks/useSpacing";
import { useRes } from "@/app/contexts";


const useMasterdataStyles = () => {
    const colors = useThemeColor();
    const { responsive, spacing } = useRes();

    return StyleSheet.create({
        scrollView: {
            flex: 1,
        },
        text: {
            fontSize: spacing.medium,
            color: colors.text,
        },
        textItalic: {
            fontStyle: "italic",
        },
        textBold: {
            fontWeight: "bold",
        },
        textMain: {
            color: colors.main,
        },
        textLight: {
            color: colors.light,
        },
        textDark: {
            color: colors.dark,
        },
        textError: {
            color: colors.danger,
        },
        button: {
            width: `${responsive === "small" ? 98 : responsive === "medium" ? 40 : 30}%`,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: "1%",
            marginHorizontal: "3%",
            padding: 12,
            borderRadius: 8,
        },
        backMain: {
            backgroundColor: colors.main,
        },
        backLight: {
            backgroundColor: colors.palette.light,
        },
        backDis: {
            backgroundColor: colors.disable,
        },
        containerDialog: {
            width:
                responsive === "small"
                    ? "80%"
                    : responsive === "medium"
                        ? "70%"
                        : "60%",
            alignSelf: "center",
        },
        containerSwitch: {
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 10,
        },
        containerAction: {
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
        },
        errorMessage: {
            textAlign: 'left',
            writingDirection: "ltr",
            opacity: 1
        },
        containerInput: {
            marginVertical: 12,
            marginHorizontal: 12,
        }
    });
};

export default useMasterdataStyles;
