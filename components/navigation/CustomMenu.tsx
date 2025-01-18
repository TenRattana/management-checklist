import React from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Menu, Divider, Avatar } from "react-native-paper";
import { useRes } from '@/app/contexts/useRes'
import useMasterdataStyles from "@/styles/common/masterdata";
import { useTheme } from "@/app/contexts/useTheme";
import { useSelector } from "react-redux";
import { CustomMenuProps } from "@/typing/Navigate";

const CustomMenu = React.memo(({ visible, onDismiss, onSettingsPress, onLogoutPress, onShow, }: CustomMenuProps) => {
    const { theme } = useTheme();
    const { spacing } = useRes()
    const { width } = Dimensions.get('window');
    const masterdataStyles = useMasterdataStyles()
    const user = useSelector((state: any) => state.user);

    const styles = StyleSheet.create({
        iconButton: {
            marginRight: 10,
            backgroundColor: "#E8F5E9",
            borderRadius: 20,
        },
        menuContent: {
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 15,
            backgroundColor: theme.colors.background,
            elevation: 4,
        },
        divider: {
            marginVertical: 5,
            backgroundColor: "#E0E0E0",
        },
    });

    const getInitials = (text: string) => {
        const words = text.split(" ");
        const initials = words.map(word => word.charAt(0).toUpperCase());
        return initials.join("");
    };

    return (
        <View>
            <TouchableOpacity onPress={onShow} style={{ marginHorizontal: 10 }}>
                <Avatar.Text size={35} label={getInitials(user.Full_Name)} style={styles.iconButton} />
            </TouchableOpacity>

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
});


export default CustomMenu;
