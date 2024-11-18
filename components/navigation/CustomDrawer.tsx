import React, { useState } from 'react';
import { ActivityIndicator, Pressable, TouchableOpacity, View } from 'react-native';
import { useAuth } from "@/app/contexts";
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Text } from '@/components';
import MenuSection from './MenuSection';
import useMasterdataStyles from "@/styles/common/masterdata";
import { useSelector } from 'react-redux';
import { Menu, ParentMenu } from '@/typing/type';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = React.memo((props) => {
    const { navigation } = props;
    const masterdataStyles = useMasterdataStyles();
    const user = useSelector((state: any) => state.user);
    const { loading } = useAuth();

    const [isMenuListOpen, setIsMenuListOpen] = useState<{ [key: string]: boolean }>({});

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const renderPressable = (label: string, navigateTo: string) => {
        return (
            <TouchableOpacity
                key={`item-${label}-nav-${navigateTo}`}
                onPress={() => navigation.navigate(navigateTo)}
                style={masterdataStyles.menuItemNav}
            >
                <Text style={masterdataStyles.menuText}>{label}</Text>
            </TouchableOpacity>
        );
    };

    const handleSetMenuListOpen = (PermissionID: string) => {
        setIsMenuListOpen(prevState => ({
            ...prevState,
            [PermissionID]: !prevState[PermissionID]
        }));
    };

    return user.username ? (
        <DrawerContentScrollView {...props} style={{ flex: 1 }}>
            {user.screen.map((screen: Menu) => {
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
                        return renderPressable(screen.MenuLabel, screen.NavigationTo);
                    }
                }
            })}
        </DrawerContentScrollView>
    ) : null;
});

export default CustomDrawerContent;
