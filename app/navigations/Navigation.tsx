import React, { lazy, Suspense, useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
    TimescheduleScreen,
} from '@/app/screens';
import PermissionDeny from '../screens/layouts/PermissionDeny';
import { useRes } from "@/app/contexts/useRes";
import CustomDrawerContent from '@/components/navigation/CustomDrawer';
import { useTheme } from '@/app/contexts/useTheme';
import { useDispatch, useSelector } from "react-redux";
import TestComponent from '../screens/TestComponent';
import { ComponentNames, ComponentNameNoLazy, ParentMenu, Menus } from '@/typing/type';
import { AppDispatch } from '@/stores';
import { initializeLogout } from '../providers';
import CustomMenu from '@/components/navigation/CustomMenu'
import Setting_dialog from "@/components/screens/Setting_dialog"
import { SafeAreaView } from 'react-native-safe-area-context';

const Drawer = createDrawerNavigator();
const MemoSetting_dialog = React.memo(Setting_dialog)

const components: Record<ComponentNames, () => Promise<{ default: React.ComponentType<any> }>> = {
    Home: () => import('@/app/screens/layouts/HomeScreen'),
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
    Test: TestComponent,
    Time: TimescheduleScreen
};

const DrawerNav = React.memo(({ renderComponent, user }: any) => {
    const { theme } = useTheme();
    const { fontSize } = useRes();
    const state = useSelector((state: any) => state.prefix);
    const drawerWidth = fontSize === "small" ? 300 : fontSize === "medium" ? 350 : 400;
    const dispatch = useDispatch<AppDispatch>();

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuSetting, setMenuSetting] = useState(false);

    const handleSettings = useCallback(() => {
        setMenuSetting(true)
        setMenuVisible(false);
    }, []);

    const handleLogout = useCallback(() => {
        dispatch(initializeLogout());
        setMenuVisible(false);
    }, []);

    const toggleMenu = useCallback(() => {
        setMenuVisible((prev) => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setMenuVisible(false);
    }, []);

    const menuScreens = useMemo(() => {
        if (!user.IsAuthenticated || user.Screen.length === 0) {
            return [
                <Drawer.Screen
                    key="login"
                    name="Login"
                    component={LoginScreen}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Login',
                    }}
                />,
            ];
        }

        const screens: JSX.Element[] = [];
        user.Screen.forEach((screen: Menus) => {
            if (screen.NavigationTo) {
                screens.push(
                    <Drawer.Screen
                        key={screen.MenuID}
                        name={screen.NavigationTo}
                        component={renderComponent(screen.NavigationTo as ComponentNames | ComponentNameNoLazy)}
                    />
                );
            }

            if (screen.ParentMenu && screen.ParentMenu.length > 0) {
                screen.ParentMenu.forEach((parentScreen: ParentMenu) => {
                    screens.push(
                        <Drawer.Screen
                            key={parentScreen.MenuID}
                            name={parentScreen.NavigationTo}
                            component={renderComponent(parentScreen.NavigationTo as ComponentNames | ComponentNameNoLazy)}
                        />
                    );
                });
            }
        });

        return screens;
    }, [user.IsAuthenticated, user.Screen, renderComponent, user.loadgin]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Drawer.Navigator
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    drawerHideStatusBarOnOpen: false,
                    drawerStatusBarAnimation: 'none',
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
                        <CustomMenu
                            visible={menuVisible}
                            onShow={toggleMenu}
                            onDismiss={closeMenu}
                            onSettingsPress={handleSettings}
                            onLogoutPress={handleLogout}
                        />
                    ),
                    unmountOnBlur: true,
                    freezeOnBlur: true,
                }}
                initialRouteName={user.initialRoute}
                id="nav"
            >
                {menuScreens}
            </Drawer.Navigator>

            <MemoSetting_dialog isVisible={menuSetting} setVisible={() => setMenuSetting(false)} />
        </SafeAreaView>
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
                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                    <Component {...props} />
                </Suspense>
            );
        }

        if (name in components) {
            const LazyComponent = lazy(components[name as ComponentNames]);
            cachedComponents.current[name] = LazyComponent;

            return (props: any) => (
                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                    <LazyComponent {...props} />
                </Suspense>
            );
        }

        return (props: any) => (
            <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                <PermissionDeny {...props} />
            </Suspense>
        );
    }, []);

    return (
        <DrawerNav
            renderComponent={renderComponent}
            user={user}
        />
    );
});


export default Navigation;
