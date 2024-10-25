import { StyleSheet } from "react-native";
import { useRes } from "@/app/contexts";
import { useTheme } from "react-native-paper";


const useMasterdataStyles = () => {
    const { responsive, spacing, fontSize } = useRes();
    const theme = useTheme();

    return StyleSheet.create({
        scrollView: {
            flex: 1,
        },
        text: {
            fontSize: spacing.small,
            color: theme.colors.onBackground,
        },
        textItalic: {
            fontStyle: "italic",
        },
        textBold: {
            fontWeight: "bold",
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
            borderRadius: 8,
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
            width:
                responsive === "small"
                    ? "80%"
                    : responsive === "medium"
                        ? "70%"
                        : "60%",
            alignSelf: "center",
        },
        buttonCreate: {
            // height: 100,

            borderRadius: 8,
            marginLeft: responsive === "small" ? "5%" : 30,
            minWidth: responsive === "small" ? "90%" : 200,
            justifyContent: 'center',
            padding: 15,
            alignSelf: 'center',
            marginVertical: 10
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
        },
        containerSearch: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            height: 100
        },
        searchbar: {
            width: responsive === "small" ? "90%" : 400,
            marginVertical: spacing.small,
            marginHorizontal: responsive === "small" ? '5%' : 30,
            borderRadius: 10,
            fontSize: spacing.small,
            backgroundColor: theme.colors.background
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
            flex:1,
            height: 50,
            borderBottomColor: 'gray',
            borderBottomWidth: 0.5,
        },
        icon: {
            marginRight: 5,
        },
        placeholderStyle: {
            fontSize: spacing.small,
        },
        selectedTextStyle: {
            fontSize: spacing.small,
        },
        iconStyle: {
            width: 20,
            height: 20,
        },
        inputSearchStyle: {
            height: 40,
            fontSize: spacing.small,
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
            margin: 12,
        },
        checkboxContainer: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            paddingHorizontal: 10,
        },
        checkboxLabel: {
            fontSize: spacing.small,
            marginLeft: 8,
        },
        hint: {
            fontSize: spacing.small - 2,
            color: theme.colors.error,
            marginTop: 5,
            paddingLeft: 5
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
        },
        errorText: {
            marginTop: 5,
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
        },
        container: {
            flex: 1,
            paddingHorizontal: 10,
            backgroundColor:theme.colors.background
        },
        title: {
            fontSize: spacing.medium,
            fontWeight: 'bold',
            marginBottom: 10,
        },
        description: {
            fontSize: spacing.small,
            marginBottom: 5,
        },
        subFormContainer: {
            marginBottom: 16,
            flexDirection: "row",
            flexWrap: "wrap",
        },
        card: {
            paddingVertical: 5,
            borderRadius: 8,
            elevation: 2,
            marginBottom: 20,
            // backgroundColor: '#e7e7e7'
        },
        cardTitle: {
            fontSize: spacing.small,
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
            backgroundColor: theme.colors.background,
            marginTop: 8,
            marginRight: 12,
            paddingHorizontal: 20,
            paddingVertical: 10
        },
        menuItemNav: {
            paddingHorizontal: 15,
            paddingVertical: 10,
            minHeight: fontSize === "small" ? 50 : fontSize === "medium" ? 60 : 75,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        menuText: {
            fontSize: spacing.small,
            padding: 10
        },
        subMenuItem: {
            paddingLeft: 40,
            minHeight: fontSize === "small" ? 50 : fontSize === "medium" ? 60 : 75,
            paddingVertical: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        subMenuText: {
            fontSize: spacing.small,
            color: '#5e5e5e',
        },
        settingItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 20,
            marginHorizontal: 20,
            marginVertical: 10,
            borderRadius: 8,
            borderColor: theme.colors.onBackground,
            borderWidth: 1,
        },
        settingText: {
            fontWeight: '500',
        },
        pickerContainer: {
            width: 150,
            borderWidth: 1,
            borderRadius: 8,
        },
    });
};

export default useMasterdataStyles;
