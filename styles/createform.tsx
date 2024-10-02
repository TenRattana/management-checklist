import { StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSpacing } from "@/hooks/useSpacing";
import { useRes } from "@/app/contexts";


const useCreateformStyle = () => {
    const colors = useThemeColor();
    const { responsive, spacing } = useRes();

    return StyleSheet.create({

        containerL1: {
            padding: 16,
            flex: 1,
            backgroundColor: colors.light,
            width: responsive === "small" ? "100%" : 400,
        },
        addSubFormButton: {
            padding: 16,
            marginVertical: 8,
            backgroundColor: '#e0f7fa',
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        addSubFormText: {
            fontSize: 16,
            color: '#00796b',
            marginLeft: 8,
        },
        fieldContainer: {
            padding: 16,
            marginVertical: 8,
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
            fontSize: 16,
        },
        subFormText: {
            fontSize: 16,
        },
        saveButton: {
            padding: 16,
            backgroundColor: '#00796b',
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 16,
        },
        saveButtonText: {
            color: colors.light,
            fontSize: 16,
        },

    });
};

export default useCreateformStyle;
