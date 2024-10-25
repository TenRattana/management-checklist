import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { useSpacing } from "@/hooks/useSpacing";
import { useRes } from "@/app/contexts";


const useCreateformStyle = () => {
    const theme = useTheme();
    const { responsive, spacing, fontSize } = useRes();

    return StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: responsive === "small" ? "column" : "row",
        },
        containerL1: {
            display: "flex",
            width: responsive === "small" ? "100%" : fontSize === "large" ? 450 : 350,
            backgroundColor: theme.colors.background,
        },
        containerL2: {
            display: "flex",
            flex: 1,
            margin: 10,
            padding: 5
        },
        addSubFormButton: {
            margin: 16,
            marginVertical: 8,
            backgroundColor: '#e0f7fa',
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        addSubFormText: {
            fontSize: spacing.small,
            color: '#00796b',
            marginLeft: 8,
            paddingVertical: 10
        },
        fieldContainer: {
            paddingHorizontal: 10,
            // height: 60,
            marginVertical: 5,
            backgroundColor: '#fafafa',
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        subFormContainer: {
            padding: 16,
            marginVertical: 8,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        active: {
            backgroundColor: '#d0f0d0',
        },
        fieldText: {
            fontSize: spacing.small,
            paddingVertical: 10,

        },
        subFormText: {
            fontSize: spacing.small,
        },
        saveButton: {
            paddingHorizontal: 10,
            height: 60,
            marginVertical: 3,
            backgroundColor: '#00796b',
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            margin: 16,
        },
        saveButtonText: {
            color: theme.colors.background,
            fontSize: spacing.small,
        },
        scrollableContainer: {
            maxHeight: 500,
            overflow: 'scroll',
        },
        icon: {
            paddingVertical: 10
        }
    });
};

export default useCreateformStyle;
