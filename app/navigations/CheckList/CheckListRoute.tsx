import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
    CheckListScreen,
    CheckListOptionScreen,
    ChecklistGroupScreen,
} from "@/app/screens";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

const Drawer = createDrawerNavigator();

export const CheckListRoute = () => {
    return (
        <>
            <Drawer.Screen
                name="Checklist"
                component={CheckListScreen}
                options={{
                    title: "Checklist",
                    drawerIcon: ({ color }) => (
                        <TabBarIcon name="home" color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Checklist_option"
                component={CheckListOptionScreen}
                options={{
                    title: "Checklist Option",
                    drawerIcon: ({ color }) => (
                        <TabBarIcon name="home" color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Checklist_group"
                component={ChecklistGroupScreen}
                options={{
                    title: "Checklist Group",
                    drawerIcon: ({ color }) => (
                        <TabBarIcon name="home" color={color} />
                    ),
                }}
            />
        </>
    );
};

export default CheckListRoute;
