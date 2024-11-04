// import React from 'react';
// import { useSelector } from 'react-redux';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { PaperProvider } from 'react-native-paper';
// import PermissionDeny from './screens/layouts/PermissionDeny';
// import HomeScreen from './screens/layouts/HomeScreen';
// import LoginScreen from './screens/layouts/LoginScreen';
// import { useAuth, useTheme } from '@/app/contexts';
// import { useSegments } from 'expo-router';
// import RouteGuard from './guard/GuardRoute';
// import {
//     ChecklistGroupScreen,
//     CheckListOptionScreen,
//     CheckListScreen,
//     ConfigulationScreen,
//     CreateFormScreen,
//     ExpectedResultScreen,
//     FormScreen,
//     GenerateQR,
//     InputFormMachine,
//     MachineGroupScreen,
//     MachineScreen,
//     Managepermissions,
//     MatchCheckListOptionScreen,
//     MatchFormMachineScreen,
//     PreviewScreen,
//     ScanQR,
//     SettingScreen,
// } from './screens';

// const Drawer = createDrawerNavigator();
// console.log("App");

// // const Screen = [
// //     { name: "Home", route: 'screens/layouts/HomeScreen', permissions: ["view_home"] },
// //     { name: "Login", route: 'screens/layouts/LoginScreen', permissions: ["view_login"] },
// //     { name: "Machine_group", route: 'screens/layouts/machines/machine_group/MachineGroupScreen', permissions: ["view_machine_group"] },
// //     { name: "Machine", route: 'screens/layouts/machines/machine/MachineScreen', permissions: ["view_machine"] },
// //     { name: "Checklist", route: 'screens/layouts/checklists/checklist/CheckListScreen', permissions: ["view_checklist"] },
// //     { name: "Checklist_option", route: 'screens/layouts/checklists/checklist_option/CheckListOptionScreen', permissions: ["view_checklist_option"] },
// //     { name: "Checklist_group", route: 'screens/layouts/checklists/checklist_group/CheckListGroupScreen', permissions: ["view_checklist_group"] },
// //     { name: "Match_checklist_option", route: 'screens/layouts/matchs/match_checklist_option/MatchCheckListOptionScreen', permissions: ["view_match_checklist_option"] },
// //     { name: "Match_form_machine", route: 'screens/layouts/matchs/match_form_machine/MatchFormMachineScreen', permissions: ["view_match_form_machine"] },
// //     { name: "Create_form", route: 'screens/layouts/forms/create/CreateFormScreen', permissions: ["create_form"] },
// //     { name: "Expected_result", route: 'screens/layouts/transitions/expected_result/ExpectedResultScreen', permissions: ["view_expected_result"] },
// //     { name: "Form", route: 'screens/layouts/forms/form/FormScreen', permissions: ["view_form"] },
// //     { name: "Preview", route: 'screens/layouts/forms/view/Preview', permissions: ["view_preview"] },
// //     { name: "ScanQR", route: 'screens/layouts/actions/camera/ScanQR', permissions: ["view_scan_qr"] },
// //     { name: "GenerateQR", route: 'screens/layouts/actions/action/GenerateQR', permissions: ["generate_qr"] },
// //     { name: "InputFormMachine", route: 'screens/layouts/forms/scan/InputFormMachine', permissions: ["input_form_machine"] },
// //     { name: "Setting", route: 'screens/layouts/SettingScreen', permissions: ["manage_settings"] },
// //     { name: "Managepermissions", route: 'screen/SAdmin/Managepermissions', permissions: ["manage_permissions"] },
// //     { name: "Permission_deny", route: 'screens/layouts/PermiossionDeny', permissions: [] },
// //     { name: "Config", route: 'screens/layouts/Configulation', permissions: ["view_config"] },
// // ];

// const Screen = [
//     { name: "Home", route: HomeScreen, permissions: ["view_home"] },
//     { name: "Login", route: LoginScreen, permissions: ["view_login"] },
//     { name: "Machine_group", route: MachineGroupScreen, permissions: ["view_machine_group"] },
//     { name: "Machine", route: MachineScreen, permissions: ["view_machine"] },
//     { name: "Checklist", route: CheckListScreen, permissions: ["view_checklist"] },
//     { name: "Checklist_option", route: CheckListOptionScreen, permissions: ["view_checklist_option"] },
//     { name: "Checklist_group", route:ChecklistGroupScreen, permissions: ["view_checklist_group"] },
//     { name: "Match_checklist_option", route: MatchCheckListOptionScreen, permissions: ["view_match_checklist_option"] },
//     { name: "Match_form_machine", route: MatchFormMachineScreen, permissions: ["view_match_form_machine"] },
//     { name: "Create_form", route: CreateFormScreen, permissions: ["create_form"] },
//     { name: "Expected_result", route: ExpectedResultScreen, permissions: ["view_expected_result"] },
//     { name: "Form", route:FormScreen, permissions: ["view_form"] },
//     { name: "Preview", route: PreviewScreen, permissions: ["view_preview"] },
//     { name: "ScanQR", route: ScanQR, permissions: ["view_scan_qr"] },
//     { name: "GenerateQR", route: GenerateQR, permissions: ["generate_qr"] },
//     { name: "InputFormMachine", route: InputFormMachine, permissions: ["input_form_machine"] },
//     { name: "Setting", route: SettingScreen, permissions: ["manage_settings"] },
//     { name: "Managepermissions", route: Managepermissions, permissions: ["manage_permissions"] },
//     { name: "Permission_deny", route: PermissionDeny, permissions: [] },
//     { name: "Config", route: ConfigulationScreen, permissions: ["view_config"] },
// ];


// const DrawerNavigator = () => {
//     const { loading } = useAuth();
//     const currentRouteName = useSegments().join('/');

//     if (loading) {
//         return null;
//     }
//     console.log("DrawerNavigator");

//     return (
//         <Drawer.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
//             {Screen.map(({ name, route: ScreenComponent, permissions }) => {
//                 const hasPermission = permissions.includes(currentRouteName);

//                 return (
//                     <Drawer.Screen key={name} name={name} options={{ title: name }}>
//                         {() => (
//                             <RouteGuard permissions={hasPermission ? permissions : []} route={name} name={name}>
//                                 {hasPermission ? <ScreenComponent /> : <PermissionDeny />}
//                             </RouteGuard>
//                         )}
//                     </Drawer.Screen>
//                 );
//             })}
//         </Drawer.Navigator>
//     );


//     // return (
//     //     <Drawer.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
//     //         {Screen.map((screen: { name: string; route: string, permissions: string[] }) => {
//     //             const ScreenComponent = screen.route;

//     //             const hasPermission = screen.permissions.includes(currentRouteName);

//     //             return (
//     //                 <Drawer.Screen key={screen.name} name={screen.name} options={{ title: screen.name }}>
//     //                     {() => (
//     //                         <RouteGuard permissions={hasPermission ? screen.permissions : []} route={screen.name} name={screen.name}>
//     //                             {hasPermission ? <ScreenComponent /> : <PermissionDeny />}
//     //                         </RouteGuard>
//     //                     )}
//     //                 </Drawer.Screen>
//     //             );
//     //         })}
//     //     </Drawer.Navigator>
//     // );
// };

// const App = () => {
//     const { theme } = useTheme();
//     console.log("App s");

//     return (
//         <PaperProvider theme={theme}>
//             <DrawerNavigator />
//         </PaperProvider>
//     );
// };

// export default App;


import React from 'react';
import { useSelector } from 'react-redux';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { PaperProvider } from 'react-native-paper';
import PermissionDeny from './screens/layouts/PermissionDeny';
import HomeScreen from './screens/layouts/HomeScreen';
import LoginScreen from './screens/layouts/LoginScreen';
import { useAuth, useTheme } from '@/app/contexts';
import { router, useSegments } from 'expo-router';
import RouteGuard from './guard/GuardRoute';
import {
    ChecklistGroupScreen,
    CheckListOptionScreen,
    CheckListScreen,
    ConfigulationScreen,
    CreateFormScreen,
    ExpectedResultScreen,
    FormScreen,
    GenerateQR,
    InputFormMachine,
    MachineGroupScreen,
    MachineScreen,
    Managepermissions,
    MatchCheckListOptionScreen,
    MatchFormMachineScreen,
    PreviewScreen,
    ScanQR,
    SettingScreen,
} from './screens';

const Drawer = createDrawerNavigator();
console.log("App");

// const screens = [
//     { name: "Home", route: HomeScreen, permissions: ["view_home"] },
//     { name: "Login", route: LoginScreen, permissions: ["view_login"] },
//     { name: "Machine_group", route: MachineGroupScreen, permissions: ["view_machine_group"] },
//     { name: "Machine", route: MachineScreen, permissions: ["view_machine"] },
//     { name: "Checklist", route: CheckListScreen, permissions: ["view_checklist"] },
//     { name: "Checklist_option", route: CheckListOptionScreen, permissions: ["view_checklist_option"] },
//     { name: "Checklist_group", route: ChecklistGroupScreen, permissions: ["view_checklist_group"] },
//     { name: "Match_checklist_option", route: MatchCheckListOptionScreen, permissions: ["view_match_checklist_option"] },
//     { name: "Match_form_machine", route: MatchFormMachineScreen, permissions: ["view_match_form_machine"] },
//     { name: "Create_form", route: CreateFormScreen, permissions: ["create_form"] },
//     { name: "Expected_result", route: ExpectedResultScreen, permissions: ["view_expected_result"] },
//     { name: "Form", route: FormScreen, permissions: ["view_form"] },
//     { name: "Preview", route: PreviewScreen, permissions: ["view_preview"] },
//     { name: "ScanQR", route: ScanQR, permissions: ["view_scan_qr"] },
//     { name: "GenerateQR", route: GenerateQR, permissions: ["generate_qr"] },
//     { name: "InputFormMachine", route: InputFormMachine, permissions: ["input_form_machine"] },
//     { name: "Setting", route: SettingScreen, permissions: ["manage_settings"] },
//     { name: "Managepermissions", route: Managepermissions, permissions: ["manage_permissions"] },
//     { name: "Permission_deny", route: PermissionDeny, permissions: [] },
//     { name: "Config", route: ConfigulationScreen, permissions: ["view_config"] },
// ];

const screens = [
    { name: "Home", route: 'screens/layouts/HomeScreen', ScreenComponent: HomeScreen, permissions: ["view_home"] },
    // { name: "Login", route: 'screens/layouts/LoginScreen', ScreenComponent: HomeScreen, permissions: ["view_login"] },
    { name: "Machine_group", route: 'screens/layouts/machines/machine_group/MachineGroupScreen', ScreenComponent: HomeScreen, permissions: ["view_machine_group"] },
    { name: "Machine", route: 'screens/layouts/machines/machine/MachineScreen', ScreenComponent: HomeScreen, permissions: ["view_machine"] },
//     { name: "Checklist", route: 'screens/layouts/checklists/checklist/CheckListScreen', ScreenComponent: HomeScreen, permissions: ["view_checklist"] },
//     { name: "Checklist_option", route: 'screens/layouts/checklists/checklist_option/CheckListOptionScreen', ScreenComponent: HomeScreen, permissions: ["view_checklist_option"] },
//     { name: "Checklist_group", route: 'screens/layouts/checklists/checklist_group/CheckListGroupScreen', ScreenComponent: HomeScreen, permissions: ["view_checklist_group"] },
//     { name: "Match_checklist_option", route: 'screens/layouts/matchs/match_checklist_option/MatchCheckListOptionScreen', ScreenComponent: HomeScreen, permissions: ["view_match_checklist_option"] },
//     { name: "Match_form_machine", route: 'screens/layouts/matchs/match_form_machine/MatchFormMachineScreen', ScreenComponent: HomeScreen, permissions: ["view_match_form_machine"] },
//     { name: "Create_form", route: 'screens/layouts/forms/create/CreateFormScreen', ScreenComponent: HomeScreen, permissions: ["create_form"] },
//     { name: "Expected_result", route: 'screens/layouts/transitions/expected_result/ExpectedResultScreen', ScreenComponent: HomeScreen, permissions: ["view_expected_result"] },
//     { name: "Form", route: 'screens/layouts/forms/form/FormScreen', ScreenComponent: HomeScreen, permissions: ["view_form"] },
//     { name: "Preview", route: 'screens/layouts/forms/view/Preview', ScreenComponent: HomeScreen, permissions: ["view_preview"] },
//     { name: "ScanQR", route: 'screens/layouts/actions/camera/ScanQR', ScreenComponent: HomeScreen, permissions: ["view_scan_qr"] },
//     { name: "GenerateQR", route: 'screens/layouts/actions/action/GenerateQR', ScreenComponent: HomeScreen, permissions: ["generate_qr"] },
//     { name: "InputFormMachine", route: 'screens/layouts/forms/scan/InputFormMachine', ScreenComponent: HomeScreen, permissions: ["input_form_machine"] },
//     { name: "Setting", route: 'screens/layouts/SettingScreen', ScreenComponent: HomeScreen, permissions: ["manage_settings"] },
//     { name: "Managepermissions", route: 'screen/SAdmin/Managepermissions', ScreenComponent: HomeScreen, permissions: ["manage_permissions"] },
//     { name: "Permission_deny", route: 'screens/layouts/PermiossionDeny', ScreenComponent: HomeScreen, permissions: [] },
//     { name: "Config", route: 'screens/layouts/Configulation', ScreenComponent: HomeScreen, permissions: ["view_config"] },
];

const DrawerNavigator = () => {
    const { loading } = useAuth();
    const currentRouteName = useSegments().join('/');

    if (loading) {
        return null;
    }
    console.log("DrawerNavigator");

    return (
        <Drawer.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            {screens.map(({ name, route, ScreenComponent, permissions }) => {
                const hasPermission = permissions.some(permission => currentRouteName.includes(permission));
                console.log(permissions);
                
                return (
                    <Drawer.Screen key={name} name={route} options={{ title: name }}>
                        {() => (
                            <RouteGuard permissions={hasPermission ? permissions : []} route={name} name={name}>
                                {hasPermission ? <ScreenComponent /> : <PermissionDeny />}
                            </RouteGuard>
                        )}
                    </Drawer.Screen>
                );
            })}
        </Drawer.Navigator>
    );
};

const App = () => {
    const { theme } = useTheme();
    console.log("App");

    return (
        <PaperProvider theme={theme}>
            <DrawerNavigator />
        </PaperProvider>
    );
};

export default App;

