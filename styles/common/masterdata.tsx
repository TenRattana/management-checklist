import { StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRes } from "@/app/contexts";


const useMasterdataStyles = () => {
    const colors = useThemeColor();
    const { responsive, spacing } = useRes();

    return StyleSheet.create({
        scrollView: {
            flex: 1,
        },
        text: {
            fontSize: spacing.small,
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
            marginLeft: responsive === "small" ? "5%" : 30,
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
        },
        containerSearch: {
            marginVertical: 12,
            flexDirection: 'row',
            flexWrap: 'wrap'
        },
        searchbar: {
            width: responsive === "small" ? "90%" : 400,
            maxHeight: 60,
            marginVertical: 10,
            marginHorizontal: responsive === "small" ? '5%' : 30,
            borderRadius: 10,
            elevation: 4,
            fontSize: spacing.small,
        },
        menuItem: {
            marginBottom: 10,
            borderRadius: 8,
            overflow: "hidden",
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
            color: "#6e6e6e",
            marginTop: 5,
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
            paddingHorizontal: 10
        },
        title: {
            fontSize: spacing.medium,
            fontWeight: 'bold',
            marginBottom: 16,
        },
        description: {
            fontSize: spacing.small,
            marginBottom: 16,
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
            fontWeight: 'bold'
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
            backgroundColor: colors.light,
            shadowColor: '#000',
            marginTop: 8,
            marginRight: 12,
            paddingHorizontal: 20,
            paddingVertical: 10

        },
    });
};

export default useMasterdataStyles;
