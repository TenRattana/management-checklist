import React from 'react';

import { createDrawerNavigator } from '@react-navigation/drawer';
import {
    MatchCheckListOptionScreen,
    MatchFormMachineScreen,
} from "@/app/screens";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

const Drawer = createDrawerNavigator();

export const MachineRoute = () => {
    return (
        <>
            <Drawer.Screen
                name="Match_checklist_option"
                component={MatchCheckListOptionScreen}
                options={{
                    title: "Match Checklist Option",
                    drawerIcon: ({ color }) => (
                        <TabBarIcon name="home" color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Match_form_machine"
                component={MatchFormMachineScreen}
                options={{
                    title: "Match Form Machine",
                    drawerIcon: ({ color }) => (
                        <TabBarIcon name="home" color={color} />
                    ),
                }}
            />
        </>
    );
};

export default MachineRoute;
