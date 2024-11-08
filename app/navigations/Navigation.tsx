import React, { lazy, Suspense, useRef, useCallback, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
    HomeScreen,
    ScanQR,
    GenerateQR,
    SettingScreen,
    ConfigulationScreen,
    MachineGroupScreen,
    MachineScreen,
    CheckListScreen,
    ChecklistGroupScreen,
    CheckListOptionScreen,
    FormScreen,
    ExpectedResultScreen,
    MatchCheckListOptionScreen,
    MatchFormMachineScreen,
    Managepermissions,
} from '@/app/screens';
import PermissionDeny from '../screens/layouts/PermissionDeny';
import { useRes } from "@/app/contexts";
import CustomDrawerContent from '@/components/navigation/CustomDrawer';
import { useTheme } from '../contexts';
import { useSelector } from "react-redux";
import TestComponent from '../screens/TestComponent';

const Drawer = createDrawerNavigator();

type ComponentNames =
    | 'Create_form'
    | 'InputFormMachine'
    | 'Preview'
    | 'Approve';

type ComponentNameNoLazy =
    | 'Machine_group'
    | 'Machine'
    | 'Checklist'
    | 'Home'
    | 'ScanQR'
    | 'GenerateQR'
    | 'Setting'
    | 'Config'
    | 'Permission_deny'
    | 'Checklist_option'
    | 'Checklist_group'
    | 'Form'
    | 'Expected_result'
    | 'Match_checklist_option'
    | 'Match_form_machine'
    | 'Managepermissions'
    | 'Test';

const components: Record<ComponentNames, () => Promise<{ default: React.ComponentType<any> }>> = {
    Create_form: () => import('@/app/screens/layouts/forms/create/CreateFormScreen'),
    InputFormMachine: () => import('@/app/screens/layouts/forms/Scan/InputFormMachine'),
    Preview: () => import('@/app/screens/layouts/forms/view/Preview'),
    Approve: () => import('@/app/screens/layouts/approveds/ApprovedScreen'),
};

const nonLazyComponents: Record<ComponentNameNoLazy, React.ComponentType<any>> = {
    Machine_group: MachineGroupScreen,
    Machine: MachineScreen,
    Checklist: CheckListScreen,
    Checklist_group: ChecklistGroupScreen,
    Checklist_option: CheckListOptionScreen,
    Form: FormScreen,
    Expected_result: ExpectedResultScreen,
    Match_checklist_option: MatchCheckListOptionScreen,
    Match_form_machine: MatchFormMachineScreen,
    Managepermissions: Managepermissions,
    ScanQR: ScanQR,
    GenerateQR: GenerateQR,
    Setting: SettingScreen,
    Config: ConfigulationScreen,
    Permission_deny: PermissionDeny,
    Home: HomeScreen,
    Test: TestComponent
};

const Navigation: React.FC = () => {
    const state = useSelector((state: any) => state.prefix);
    const user = useSelector((state: any) => state.user);
    const { fontSize } = useRes();
    const { theme } = useTheme();

    const cachedComponents = useRef<{ [key: string]: React.ComponentType<any> }>({});

    const drawerWidth = fontSize === "small" ? 300 : fontSize === "medium" ? 350 : 400;

    const initialRoute: string = user?.username && user?.screen?.length > 0 ? "Home" : "Permission_deny";

    const renderComponent = useCallback((name: ComponentNames | ComponentNameNoLazy) => {
        if (name in nonLazyComponents) {
            const Component = nonLazyComponents[name as ComponentNameNoLazy];
            return (props: any) => <Component {...props} />;
        }

        if (cachedComponents.current[name]) {
            const Component = cachedComponents.current[name];
            return (props: any) => (
                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />} >
                    <Component {...props} />
                </Suspense>
            );
        }

        if (name in components) {
            const LazyComponent = lazy(components[name as ComponentNames]);
            cachedComponents.current[name] = LazyComponent;

            return (props: any) => (
                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />} >
                    <LazyComponent {...props} />
                </Suspense>
            );
        }

        return (props: any) => (
            <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />} >
                <PermissionDeny {...props} />
            </Suspense>
        );
    }, []);

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} initialRouteName={initialRoute} />}
            screenOptions={{
                drawerStyle: {
                    backgroundColor: theme.colors.background,
                    width: drawerWidth,
                },
                unmountOnBlur: true,
                drawerHideStatusBarOnOpen: true,
                drawerStatusBarAnimation: 'slide',
                freezeOnBlur: true
            }}
            initialRouteName={initialRoute}
            id="nav"
        >
            {user.username && user.screen.length > 0 ? (
                user.screen.map((screen: { name: string }) => (
                    <Drawer.Screen
                        key={screen.name}
                        name={screen.name}
                        component={renderComponent(screen.name as (ComponentNames | ComponentNameNoLazy))}
                        options={{
                            headerTitle: state.AppName || "",
                            drawerLabel: screen.name,
                        }}
                    />
                ))
            ) : (
                <Drawer.Screen
                    name="Permission_deny"
                    component={PermissionDeny}
                    options={{
                        drawerLabel: 'Permission Denied',
                    }}
                />
            )}
        </Drawer.Navigator>
    );
};

export default React.memo(Navigation);
