import React, { useCallback, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Text } from '@/components';
import MenuSection from './MenuSection';
import useMasterdataStyles from "@/styles/common/masterdata";
import { useSelector } from 'react-redux';
import { ComponentNames, Menus, ParentMenu } from '@/typing/type';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types';
import { navigate, navigationRef } from '@/app/navigations/navigationUtils';
import { Icon } from 'react-native-paper';
import { useTheme } from '@/app/contexts/useTheme';

interface RenderTouchableOpacityProps {
    label: string;
    navigateTo: ComponentNames;
    navigations: DrawerNavigationHelpers;
}

const RenderTouchableOpacity = React.memo((props: RenderTouchableOpacityProps) => {
    const masterdataStyles = useMasterdataStyles();
    const { label, navigateTo, navigations } = props
    const cureent = navigationRef.current?.getCurrentRoute();
    const { theme } = useTheme();

    return (
        <View style={{ paddingLeft: 25, alignItems: 'center', flexDirection: 'row' }}>
            <Icon source="baby-face-outline" size={20} color={theme.colors.onBackground} />
            <TouchableOpacity
                key={`item-${label}-nav-${navigateTo}-${cureent}`}
                onPress={() => navigate(navigateTo)}
                style={masterdataStyles.menuItemNav}
            >
                <Text style={masterdataStyles.menuText}>{label}</Text>
            </TouchableOpacity>
        </View>
    );
});

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = React.memo((props) => {
    const { navigation } = props;

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
            {user.Screen.map((screen: Menus) => {
                if (screen.OrderNo) {
                    if (screen.ParentMenu) {
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
                                }))}
                                navigation={navigation}
                            />
                        );
                    } else {
                        return <RenderTouchableOpacity key={`item-${screen.MenuLabel}-nav-${screen.NavigationTo}`} label={screen.MenuLabel} navigateTo={screen.NavigationTo as ComponentNames} navigations={navigation} />;
                    }
                }
            })}
        </DrawerContentScrollView>
    ) : null;
});

export default CustomDrawerContent;
