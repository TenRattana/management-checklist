import React, { lazy, Suspense, useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { LoginScreen } from '@/app/screens';
import PermissionDeny from '../screens/layouts/PermissionDeny';
import { useRes } from "@/app/contexts/useRes";
import CustomDrawerContent from '@/components/navigation/CustomDrawer';
import { useTheme } from '@/app/contexts/useTheme';
import { useDispatch, useSelector } from "react-redux";
import { ComponentNames, ParentMenu, Menus } from '@/typing/type';
import { AppDispatch } from '@/stores';
import { initializeLogout } from '../providers';
import CustomMenu from '@/components/navigation/CustomMenu'
import Setting_dialog from "@/components/screens/Setting_dialog"
import { SafeAreaView } from 'react-native-safe-area-context';

const Drawer = createDrawerNavigator();
const MemoSetting_dialog = React.memo(Setting_dialog)

const components: Record<ComponentNames, () => Promise<{ default: React.ComponentType<any> }>> = {
    InputFormMachine: () => import('@/app/screens/layouts/forms/Scan/InputFormMachine'),
    Preview: () => import('@/app/screens/layouts/forms/view/PreviewScreen'),
    Apporved: () => import('@/app/screens/layouts/approveds/ApporvedScreen'),
    Checklist: () => import('@/app/screens/layouts/checklists/checklist/CheckListScreen'),
    Checklist_group: () => import('@/app/screens/layouts/checklists/checklist_group/ChecklistGroupScreen'),
    Checklist_option: () => import('@/app/screens/layouts/checklists/checklist_option/CheckListOptionScreen'),
    Machine: () => import('@/app/screens/layouts/machines/machine/MachineScreen'),
    Machine_group: () => import('@/app/screens/layouts/machines/machine_group/MachineGroupScreen'),
    Match_checklist_option: () => import('@/app/screens/layouts/matchs/match_checklist_option/MatchCheckListOptionScreen'),
    Match_form_machine: () => import('@/app/screens/layouts/matchs/match_form_machine/MatchFormMachineScreen'),
    Config: () => import('@/app/screens/layouts/Configulation'),
    Create_form: () => import('@/app/screens/layouts/forms/create/CreateFormScreen'),
    Expected_result: () => import('@/app/screens/layouts/transactions/expected_result/ExpectedResultScreen'),
    Form: () => import('@/app/screens/layouts/forms/form/FormScreen'),
    Home: () => import('@/app/screens/layouts/HomeScreen'),
    Login: () => import('@/app/screens/layouts/LoginScreen'),
    Managepermissions: () => import('@/app/screens/SAdmin/Managepermissions'),
    Permission_deny: () => import('@/app/screens/NotFoundScreen404'),
    ScanQR: () => import('@/app/screens/layouts/actions/camera/ScanQR'),
    Setting: () => import('@/app/screens/layouts/SettingScreen'),
    Test: () => import('@/app/screens/TestComponent'),
    Time: () => import('@/app/screens/layouts/schedule/TimescheduleScreen'),
    TimeTrack: () => import('@/app/screens/layouts/schedule/TimescheduleTrack'),
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
        setMenuSetting(true);
        setMenuVisible(false);
    }, []);

    const handleLogout = useCallback(() => {
        dispatch(initializeLogout());
        setMenuVisible(false);
    }, [dispatch]);

    const toggleMenu = useCallback(() => {
        setMenuVisible((prev) => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setMenuVisible(false);
    }, []);

    const menuScreens = useMemo(() => {
        if (!user.IsAuthenticated || !user.Screen || user.Screen.length === 0) {

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
                        component={renderComponent(screen.NavigationTo as ComponentNames)}
                        options={{ freezeOnBlur: true }}
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
                            options={{ freezeOnBlur: true }}
                        />
                    );
                });
            }
        });

        return screens;
    }, [user.IsAuthenticated, user.Screen, renderComponent]);

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
                }}
                initialRouteName={user.initialRoute || "Login"}
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

    const renderComponent = useCallback((name: ComponentNames) => {

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
