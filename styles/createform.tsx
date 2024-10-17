import { StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSpacing } from "@/hooks/useSpacing";
import { useRes } from "@/app/contexts";


const useCreateformStyle = () => {
    const colors = useThemeColor();
    const { responsive, spacing } = useRes();

    return StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: responsive === "small" ? "column" : "row",
        },
        containerL1: {
            display: "flex",
            flexGrow: 0,
            width: responsive === "small" ? "100%" : 350,
            backgroundColor: colors.light,
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
        },
        fieldContainer: {
            paddingHorizontal: 10,
            height: 60,
            marginVertical: 3,
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
            color: colors.light,
            fontSize: spacing.small,
        },
        scrollableContainer: {
            maxHeight: 500,
            overflow: 'scroll',
        },
    });
};

export default useCreateformStyle;
