import React from 'react';

import { createDrawerNavigator } from '@react-navigation/drawer';
import {
    MachineGroupScreen,
    MachineScreen,
} from "@/app/screens";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

const Drawer = createDrawerNavigator();

export const MatchRoute = () => {
    return (
        <>
            <Drawer.Screen
                name="MachineGroup"
                component={MachineGroupScreen}
                options={{
                    title: "Machine Group",
                    drawerIcon: ({ color }) => (
                        <TabBarIcon name="home" color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Machine"
                component={MachineScreen}
                options={{
                    title: "Machine",
                    drawerIcon: ({ color }) => (
                        <TabBarIcon name="home" color={color} />
                    ),
                }}
            />
        </>
    );
};

export default MatchRoute;
