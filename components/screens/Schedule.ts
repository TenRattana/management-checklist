import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import { StyleSheet } from "react-native";

const { theme } = useTheme();
const { responsive } = useRes();

export const styles = StyleSheet.create({
    container: {
        width: responsive === 'large' ? 800 : responsive === 'medium' ? '80%' : '80%',
        alignSelf: 'center',
        backgroundColor: theme.colors.background,
        overflow: 'hidden',
    },
    containerTime: {
        backgroundColor: theme.colors.fff,
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    addButton: {
        marginVertical: 5,
    },
    slotContainer: {
        marginHorizontal: '2%',
        flexBasis: '46%',
    },
    timeButton: {
        marginVertical: 5,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 6,
    },
    deleteButton: {
        justifyContent: 'center',
        alignSelf: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
    timeIntervalMenu: {
        marginHorizontal: 5,
        marginBottom: 10,
    },
    menuItem: {
        width: 200,
    },
    rightActionsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        borderRadius: 8,
    },
});