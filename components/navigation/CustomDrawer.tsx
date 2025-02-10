import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Text } from '@/components';
import MenuSection from './MenuSection';
import useMasterdataStyles from "@/styles/common/masterdata";
import { useSelector } from 'react-redux';
import { ComponentNames, Menus, ParentMenu } from '@/typing/type';
import { navigate, navigationRef } from '@/app/navigations/navigationUtils';
import { Divider, Icon } from 'react-native-paper';
import { useTheme } from '@/app/contexts/useTheme';
import { RenderTouchableOpacityProps } from '@/typing/Navigate';

const RenderTouchableOpacity = (props: RenderTouchableOpacityProps) => {
    const masterdataStyles = useMasterdataStyles();
    const { label, navigateTo, navigations, Icons } = props
    const current = navigationRef.current?.getCurrentRoute();
    const { theme, darkMode } = useTheme();

    const styles = StyleSheet.create({
        container: {
            marginHorizontal: 20,
            marginVertical: 2,
            borderRadius: 10,
            paddingLeft: 10,
            alignItems: 'center',
            flexDirection: 'row',
            backgroundColor: current?.name === navigateTo ? !darkMode ? 'rgba(14, 17, 224, 0.16)' : 'rgba(11, 14, 212, 0.71)' : undefined
        }
    })

    return (
        <View style={styles.container}>
            {Icons && <Icon source={Icons ? Icons : "baby-face-outline"} size={20} color={theme.colors.onBackground} />}
            <TouchableOpacity
                key={`item-${label}-nav-${navigateTo}-${current}`}
                onPress={() => navigate(navigateTo)}
                style={masterdataStyles.menuItemNav}
            >
                <Text style={masterdataStyles.menuText}>{label}</Text>
            </TouchableOpacity>
        </View>
    );
};

const CustomDrawerContent = React.memo((props: DrawerContentComponentProps) => {
    const { navigation } = props;
    const masterdataStyles = useMasterdataStyles();

    const user = useSelector((state: any) => state.user);
    const [isMenuListOpen, setIsMenuListOpen] = useState<{ [key: string]: boolean }>({});

    const handleSetMenuListOpen = useCallback((PermissionID: string) => {
        setIsMenuListOpen(prevState => ({
            ...prevState,
            [PermissionID]: !prevState[PermissionID]
        }));
    }, [isMenuListOpen]);

    return user.IsAuthenticated && user.Screen.length > 0 ? (
        <DrawerContentScrollView {...props} style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ padding: 10 }}>
                <Text style={[masterdataStyles.menuText, masterdataStyles.title, { paddingLeft: 20 }]}>Menu List</Text>
            </View>

            <Divider style={{ marginHorizontal: 20, marginBottom: 10 }} />

            {user.Screen.map((screen: Menus) => {
                if (screen.OrderNo) {
                    if (screen.ParentMenu.length > 0) {
                        return (
                            <MenuSection
                                key={`item-${screen.MenuLabel}-nav-${screen.NavigationTo}`}
                                title={screen.MenuLabel}
                                isOpen={Boolean(isMenuListOpen?.[screen.PermissionID])}
                                onToggle={() =>
                                    handleSetMenuListOpen(String(screen.PermissionID))
                                }
                                items={screen.ParentMenu.map((parent: ParentMenu) => ({
                                    label: parent.MenuLabel,
                                    navigateTo: parent.NavigationTo,
                                    Icon: parent.Icon
                                }))}
                                navigation={navigation}
                            />
                        );
                    } else {
                        return <RenderTouchableOpacity key={`item-${screen.MenuLabel}-nav-${screen.NavigationTo}`} label={screen.MenuLabel} navigateTo={screen.NavigationTo as ComponentNames} navigations={navigation} Icons={screen.Icon} />;
                    }
                }
            })}
        </DrawerContentScrollView>
    ) : null;
});

export default CustomDrawerContent;
