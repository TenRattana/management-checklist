import { Platform, StyleSheet } from "react-native";
import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";

const useMasterdataStyles = () => {
    const { responsive, spacing, fontSize } = useRes();
    const { theme, darkMode } = useTheme();

    return StyleSheet.create({
        scrollView: {
            flex: 1,
        },
        textFFF: {
            color: theme.colors.fff,
            fontSize: spacing.small,
        },
        text000: {
            color: theme.colors.black,
            fontSize: spacing.small,
        },
        textQR: {
            fontSize: spacing.small - 3,
            color: theme.colors.onBackground,
        },
        text: {
            fontSize: spacing.small,
            color: theme.colors.onBackground,
        },
        textItalic: {
            fontStyle: "italic",
        },
        textBold: {
            fontWeight: "500",
        },
        textMain: {
            color: theme.colors.onPrimary,
        },
        textLight: {
            color: theme.colors.background,
        },
        textDark: {
            color: theme.colors.onBackground,
        },
        textError: {
            color: theme.colors.error,
        },
        button: {
            width: `${responsive === "small" ? 98 : responsive === "medium" ? 40 : 30}%`,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: "1%",
            marginHorizontal: "3%",
            padding: 12,
            borderRadius: 4,
        },
        backMain: {
            backgroundColor: theme.colors.blue,
        },
        backLight: {
            backgroundColor: theme.colors.background,
        },
        backDis: {
            backgroundColor: theme.colors.onSecondary,
        },
        containerDialog: {
            backgroundColor: theme.colors.background,
            borderRadius: 4,
            width: responsive === "large" ? 650 : responsive === "medium" ? 600 : '80%',
            alignSelf: "center",
        },
        buttonCreate: {
            borderRadius: 10,
            minWidth: responsive === "small" ? "100%" : 200,
            justifyContent: 'center',
            padding: 10,
            alignSelf: 'center',
        },
        containerSwitch: {
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 5,
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
        },
        containerSearch: {
            flexDirection: responsive === "small" ? "column" : "row",
            flexWrap: 'wrap',
            marginHorizontal: 20,
            justifyContent: 'space-between'
        },
        searchbar: {
            width: responsive === "small" ? "90%" : 400,
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginHorizontal: responsive === "small" ? '5%' : 30,
            borderRadius: 10,
            fontSize: spacing.small,
            backgroundColor: theme.colors.onBackground
        },
        menuItem: {
            minHeight: spacing.small + 30,
            justifyContent: 'center',
            overflow: "hidden",
        },
        menuItemText: {
            padding: 15,
            textAlign: "center",
            fontWeight: "500",
        },
        dropdown: {
            width: '100%',
            height: 50,
            borderBottomColor: 'gray',
            borderBottomWidth: 0.5,
        },
        icon: {
            marginRight: 5,
            alignItems: 'center',
            alignContent: 'center',
            alignSelf: 'center'
        },
        placeholderStyle: {
            fontSize: spacing.small,
            color: theme.colors.onBackground
        },
        selectedTextStyle: {
            fontSize: spacing.small,
            color: theme.colors.onBackground
        },
        iconStyle: {
            width: 20,
            height: 20,
        },
        inputSearchStyle: {
            height: 40,
            fontSize: spacing.small,
            color: theme.colors.onBackground
        },
        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        chip: {
            margin: 5,
            borderWidth: 1,
            alignItems: 'center',
        },
        commonContainer: {
            marginHorizontal: 10,
            marginVertical: 8
        },
        checkboxContainer: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
        },
        checkboxLabel: {
            fontSize: spacing.small,
            marginLeft: 8,
            color: theme.colors.onBackground
        },
        hint: {
            fontSize: spacing.small - 2,
            color: theme.colors.error,
            marginTop: fontSize === "large" ? 10 : 5,
            paddingLeft: fontSize === "large" ? 7 : 5,
        },
        label: {
            fontSize: spacing.small,
            marginBottom: 10,
            fontWeight: "bold",
        },
        radioItem: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
        },
        radioLabel: {
            fontSize: spacing.small,
            color: theme.colors.onBackground
        },
        errorText: {
            left: -10,
            fontSize: spacing.small,
            marginVertical: fontSize === "large" ? 5 : 2,
            paddingTop: fontSize === "large" ? 7 : 5
        },
        dropdownContainer: {
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            overflow: 'hidden',
        },
        picker: {
            height: 50,
            width: '100%',
            fontSize: spacing.small,
            backgroundColor: theme.colors.background,
            fontFamily: "Poppins"
        },
        container: {
            flex: 1,
            paddingHorizontal: 10,
            backgroundColor: theme.colors.background
        },
        title: {
            fontSize: spacing.medium,
            fontWeight: 'bold',
            paddingHorizontal: fontSize === "large" ? 10 : 5
        },
        description: {
            fontSize: spacing.small,
            paddingHorizontal: fontSize === "large" ? 10 : 5,
        },
        subFormContainer: {
            marginBottom: 16,
            flexDirection: "row",
            flexWrap: "wrap",
        },
        card: {
            // backgroundColor: !!darkMode ? theme.colors.background : undefined,
            paddingVertical: 5,
            borderRadius: 2,
            marginBottom: 20,
            borderLeftWidth: 3,
            borderColor: theme.colors.yellow,
            ...Platform.select({
                web: {
                    boxShadow: `${theme.colors.onBackground || "#000"} 0px 2px 4px`,
                },
                ios: {
                    shadowColor: theme.colors.onBackground || "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 4,
                },
                android: {
                    elevation: 4,
                },
            }),
        },
        cardTitle: {
            fontSize: spacing.medium,
            fontWeight: 'bold',
            paddingVertical: 15
        },
        containerScccess: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
        },
        titleScccess: {
            fontSize: spacing.medium,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        linkScccess: {
            marginTop: 15,
            paddingVertical: 15,
        },
        linkTextScccess: {
            color: '#1e90ff',
        },
        fieldCard: {
            marginVertical: 5,
        },
        selectedStyle: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            backgroundColor: theme.colors.succeass,
            margin: 4,
            marginTop: 10,
            padding: 10,
        },
        menuItemNav: {
            paddingHorizontal: 10,
            minHeight: fontSize === "small" ? 50 : fontSize === "medium" ? 60 : 75,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flex: 1,
        },
        menuText: {
            fontSize: spacing.small,
            padding: 5,
            color: theme.colors.onBackground
        },
        subMenuItem: {
            paddingLeft: 40,
            minHeight: fontSize === "small" ? 50 : fontSize === "medium" ? 60 : 75,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 20,
            borderRadius: 10,
        },
        subMenuText: {
            fontSize: spacing.small,
            color: theme.colors.onBackground,
        },
        settingItem: {
            paddingVertical: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        settingText: {
            fontWeight: '500',
            paddingVertical: 10,
            fontSize: spacing.small,
        },
        pickerContainer: {
            width: 150,
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: theme.colors.onBackground
        },
        configPrefix: {
            paddingVertical: fontSize === "large" ? 10 : fontSize === "medium" ? 5 : 2,
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        configCreate: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingVertical: 15,
            paddingHorizontal: 10,
            marginHorizontal: 10,
            marginVertical: 10,
            borderRadius: 8,
            borderColor: theme.colors.onBackground,
            borderWidth: 1,
        },
        configPrefixText: {
            flex: 1,
            fontWeight: '500',
            paddingVertical: 10,
            fontSize: spacing.small,
            color: theme.colors.onBackground,
            alignContent: 'center'
        },
        timeText: {
            fontSize: spacing.small,
            textAlign: 'center',
        },
    });
};

export default useMasterdataStyles;
