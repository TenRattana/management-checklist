import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Menus, ParentMenu, ComponentNames } from '@/typing/type';

const Drawer = createDrawerNavigator();

export const getMenuScreens = (
    Screen: Menus[],
    renderComponent: (name: ComponentNames) => React.ComponentType<any>
) => {
    const screens: JSX.Element[] = [];

    Screen.forEach((screen: Menus) => {
        if (screen.NavigationTo) {
            screens.push(
                <Drawer.Screen
                    key={screen.MenuID}
                    name={screen.NavigationTo}
                    component={renderComponent(screen.NavigationTo as ComponentNames)}
                />
            );
        }

        if (screen.ParentMenu && screen.ParentMenu.length > 0) {
            screen.ParentMenu.forEach((parentScreen: ParentMenu) => {
                screens.push(
                    <Drawer.Screen
                        key={parentScreen.MenuID}
                        name={parentScreen.NavigationTo}
                        component={renderComponent(parentScreen.NavigationTo as ComponentNames)}
                    />
                );
            });
        }
    });

    return screens;
};
