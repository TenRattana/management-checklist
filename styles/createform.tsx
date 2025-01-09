import { StyleSheet } from "react-native";
import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";

const useCreateformStyle = () => {
    const { theme } = useTheme();
    const { responsive, spacing, fontSize } = useRes();

    return StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: responsive === "small" ? "column" : "row",
        },
        containerL1: {
            display: "flex",
            width: responsive === "small" ? "100%" : fontSize === "large" ? 430 : 370,
            borderColor: theme.colors.onBackground,
            borderRightWidth: 1
        },
        containerL2: {
            display: "flex",
            flex: 1,
        },
        addSubFormButton: {
            margin: 16,
            marginTop: 20,
            marginVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 0.5
        },
        addItem: {
            margin: 5,
            backgroundColor: theme.colors.drag,
            borderRadius: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        fieldContainer: {
            marginHorizontal: 10,
            marginLeft: 20,
            paddingHorizontal: 5,
            // height: 60,
            // marginVertical: 5,
            // backgroundColor: theme.colors.field,
            flexDirection: 'row',
            alignItems: 'center',
        },
        subFormContainer: {
            // marginVertical: 8,
            // backgroundColor: theme.colors.subform,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            // justifyContent: 'space-between',
        },
        active: {
            opacity: 0.8
        },
        fieldText: {
            fontSize: spacing.small,
            padding: 5,
            color: theme.colors.fff
        },
        subFormText: {
            fontSize: spacing.small,
            color: theme.colors.onBackground
        },
        saveButton: {
            paddingHorizontal: 10,
            height: 60,
            marginVertical: 3,
            backgroundColor: theme.colors.blue,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            margin: 16,
        },
        saveText: {
            color: theme.colors.background,
            fontSize: spacing.small
        },
        scrollableContainer: {
            maxHeight: 500,
            overflow: 'scroll',
        },
        icon: {
            paddingVertical: 10,
        }
    });
};

export default useCreateformStyle;
