import { DrawerNavigationHelpers } from "@react-navigation/drawer/lib/typescript/src/types";
import { ComponentNames } from "./type";

export interface RenderTouchableOpacityProps {
    label: string;
    navigateTo: ComponentNames;
    navigations: DrawerNavigationHelpers;
    Icons: string;
}

export interface CustomMenuProps {
    visible: boolean;
    onDismiss: () => void;
    onSettingsPress: () => void;
    onLogoutPress: () => void;
    onShow: () => void;
}

export interface MenuSectionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    items: { label: string; navigateTo: string; Icon:string;}[];
    navigation: DrawerNavigationHelpers;
}