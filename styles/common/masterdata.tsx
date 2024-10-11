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
        buttonCreate: {
            borderRadius: 8,
            marginVertical: 20,
            marginLeft: 30,
            width: responsive === "small" ? "90%" : 200,
            height: 45,
            justifyContent: 'center',
            alignItems: 'center'
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
        },
        searchbar: {
            width: 400,
            maxHeight: 60,
            marginVertical: 10,
            marginHorizontal: 30,
            borderRadius: 10,
            elevation: 4,
            fontSize: 18,
        },
        menuItem: {
            marginBottom: 10,
            borderRadius: 8,
            overflow: "hidden",
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1,
        },
        menuItemText: {
            padding: 15,
            textAlign: "center",
            fontWeight: "500",
        },
        dropdown: {
            height: 50,
            borderBottomColor: 'gray',
            borderBottomWidth: 0.5,
        },
        icon: {
            marginRight: 5,
        },
        placeholderStyle: {
            fontSize: 20,
        },
        selectedTextStyle: {
            fontSize: 20,
        },
        iconStyle: {
            width: 20,
            height: 20,
        },
        inputSearchStyle: {
            height: 40,
            fontSize: 20,
        },
    });
};

export default useMasterdataStyles;
