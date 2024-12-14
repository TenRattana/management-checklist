import { useRes } from "@/app/contexts/useRes";
import { useTheme } from "@/app/contexts/useTheme";
import { StyleSheet } from "react-native";


const Create = (width: number, drawerOpen: boolean) => {
    const { responsive, fontSize } = useRes();
    const { theme } = useTheme();
    const DRAWER_WIDTH = responsive === "small" ? width : fontSize === "large" ? 430 : 370;

    return StyleSheet.create({
        container: {
            flex: 1,
        },
        content: {
            flex: 1,
            backgroundColor: theme.colors.background,
            borderLeftWidth: 1,
            borderColor: '#eaeaea',
            width: drawerOpen ? width - DRAWER_WIDTH : width,
            display: responsive === "small" && drawerOpen ? 'none' : 'flex',
        },
        buttonContainer: {
            flexDirection: 'row',
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 6
        },
        openButton: {
            backgroundColor: theme.colors.drag,
            alignItems: 'center',
            flexDirection: 'row',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
        },
        openButtonActive: {
            backgroundColor: theme.colors.error,
            alignItems: 'center',
            flexDirection: 'row',
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
        },
        drawer: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: DRAWER_WIDTH,
        },
        groupContainer: {
            marginVertical: 20,
            paddingBottom: 10,
        },
        groupTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            textAlign: 'center',
        },
        fieldList: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
        },
        fieldContainer: {
            marginHorizontal: 10,
            flex: 1,
        },
        iconButton: {
            marginBottom: 5,
        },
        fieldTitle: {
            textAlign: 'center',
            color: 'black',
            fontSize: 12,
        },
    });
}

export default Create
