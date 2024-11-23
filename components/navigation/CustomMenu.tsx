import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Menu, Divider, IconButton, Text } from "react-native-paper";
import { useRes } from '@/app/contexts/useRes'
import useMasterdataStyles from "@/styles/common/masterdata";
import { useTheme } from "@/app/contexts/useTheme";

interface CustomMenuProps {
    visible: boolean;
    onDismiss: () => void;
    onSettingsPress: () => void;
    onLogoutPress: () => void;
    onShow: () => void;
}

const CustomMenu: React.FC<CustomMenuProps> = ({
    visible,
    onDismiss,
    onSettingsPress,
    onLogoutPress,
    onShow,
}) => {
    const { theme } = useTheme();
    const { spacing } = useRes()
    const { width } = Dimensions.get('window');
    const masterdataStyles = useMasterdataStyles()

    const styles = StyleSheet.create({
        iconButton: {
            marginRight: 10,
            backgroundColor: "#E8F5E9",
            borderRadius: 20,
        },
        menuContent: {
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 10,
            backgroundColor: theme.colors.background,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
        },
        divider: {
            marginVertical: 5,
            backgroundColor: "#E0E0E0",
        },
    });

    return (
        <View>
            <IconButton
                icon="account-circle"
                size={25}
                style={styles.iconButton}
                onPress={onShow}
                iconColor="#4CAF50"
            />
            <Menu
                visible={visible}
                onDismiss={onDismiss}
                anchor={{ x: width, y: 70 }}
                contentStyle={styles.menuContent}
            >
                <Menu.Item
                    onPress={onSettingsPress}
                    title="Settings"
                    titleStyle={masterdataStyles.text}
                    leadingIcon="cog"
                />
                <Divider style={styles.divider} />
                <Menu.Item
                    onPress={onLogoutPress}
                    title="Logout"
                    titleStyle={[masterdataStyles.textError, { fontSize: spacing.small }]}
                    leadingIcon="logout"
                />
            </Menu>
        </View>
    );
};


export default CustomMenu;
