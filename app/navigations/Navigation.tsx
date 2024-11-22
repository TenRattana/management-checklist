import React, { lazy, Suspense, useRef, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
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
    LoginScreen,
} from '@/app/screens';
import PermissionDeny from '../screens/layouts/PermissionDeny';
import { useRes } from "@/app/contexts/useRes";
import CustomDrawerContent from '@/components/navigation/CustomDrawer';
import { useTheme } from '@/app/contexts/useTheme';
import { useDispatch, useSelector } from "react-redux";
import TestComponent from '../screens/TestComponent';
import { Menu, ComponentNames, ComponentNameNoLazy, ParentMenu } from '@/typing/type';
import { AppDispatch } from '@/stores';
import { initializeLogout } from '../providers';
import { IconButton } from 'react-native-paper';
import Setting_dailog from "@/components/screens/Setting_dailog";

const Drawer = createDrawerNavigator();

const components: Record<ComponentNames, () => Promise<{ default: React.ComponentType<any> }>> = {
    Create_form: () => import('@/app/screens/layouts/forms/create/CreateFormScreen'),
    InputFormMachine: () => import('@/app/screens/layouts/forms/Scan/InputFormMachine'),
    Preview: () => import('@/app/screens/layouts/forms/view/PreviewScreen'),
    Apporved: () => import('@/app/screens/layouts/approveds/ApporvedScreen'),
};

const nonLazyComponents: Record<ComponentNameNoLazy, React.ComponentType<any>> = {
    Login: LoginScreen,
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

const DrawerNav = React.memo(({ renderComponent, user }: any) => {
    const { theme } = useTheme();
    const { fontSize } = useRes();
    const state = useSelector((state: any) => state.prefix);
    const drawerWidth = fontSize === "small" ? 300 : fontSize === "medium" ? 350 : 400;
    const [showsetting, setShowsetting] = useState(false)

    const handelShowsetting = useCallback((value: boolean) => {
        setShowsetting(value)
    }, [])

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                drawerStyle: {
                    backgroundColor: theme.colors.background,
                    width: drawerWidth,
                },
                headerTitle: state.AppName || "",
                headerTitleStyle: {
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#333',
                },
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => handelShowsetting(true)}>
                        <IconButton icon="account-circle" size={30} style={{ marginRight: 10 }} />
                    </TouchableOpacity>
                ),
                unmountOnBlur: true,
                drawerHideStatusBarOnOpen: true,
                drawerStatusBarAnimation: 'slide',
                freezeOnBlur: true
            }}
            initialRouteName={user.initialRoute}
            id="nav"
        >
            {user.IsAuthenticated && user.Screen.length > 0 ? (
                <>
                    {user.Screen.map((screen: Menu) => {
                        if (screen.NavigationTo) {
                            return (
                                <Drawer.Screen
                                    key={screen.MenuID}
                                    name={screen.NavigationTo}
                                    component={renderComponent(screen.NavigationTo as (ComponentNames | ComponentNameNoLazy))}
                                />
                            );
                        }

                        if (screen.ParentMenu && screen.ParentMenu.length > 0) {
                            return screen.ParentMenu.map((parentScreen: ParentMenu) => {
                                return (
                                    <Drawer.Screen
                                        key={parentScreen.MenuID}
                                        name={parentScreen.NavigationTo}
                                        component={renderComponent(parentScreen.NavigationTo as (ComponentNames | ComponentNameNoLazy))}
                                    />
                                );
                            });
                        }

                        return null;
                    })}

                    <Drawer.Screen
                        name="Logout"
                        component={LogoutScreen}
                        options={{
                            headerShown: false,
                        }}
                    />
                </>
            ) : (
                <Drawer.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Login',
                    }}
                />
            )}
        </Drawer.Navigator>
    );
});

const Navigation: React.FC = React.memo(() => {
    const user = useSelector((state: any) => state.user);

    const cachedComponents = useRef<{ [key: string]: React.ComponentType<any> }>({});

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
        <DrawerNav
            renderComponent={renderComponent}
            user={user}
        />
    )
});

const LogoutScreen = React.memo(() => {
    const dispatch = useDispatch<AppDispatch>();

    const logouts = useCallback(async () => {
        dispatch(initializeLogout());
    }, [dispatch])

    useEffect(() => {
        logouts()
    }, [logouts]);

    return null;
});

export default Navigation;
