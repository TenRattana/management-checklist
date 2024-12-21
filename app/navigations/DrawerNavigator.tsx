import React, { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, Text } from 'react-native-paper';
import { getMenuScreens } from './getMenuScreens';
import { ComponentNames } from '@/typing/type';
import PermissionDeny from '../screens/layouts/PermissionDeny';
import CustomMenu from '@/components/navigation/CustomMenu';
import { useTheme } from '../contexts/useTheme';
import { useRes } from '../contexts/useRes';
import CustomDrawerContent from '@/components/navigation/CustomDrawer';
import { AppDispatch } from '@/stores';
import { initializeLogout } from '../providers';
import Setting_dialog from '@/components/screens/Setting_dialog';
import { View } from 'react-native';

const Drawer = createDrawerNavigator();
const MemoSetting_dialog = React.memo(Setting_dialog)
const MemoCustomMenu = React.memo(CustomMenu)

const components: Record<ComponentNames, () => Promise<{ default: React.ComponentType<any> }>> = {
    InputFormMachine: () => import('@/app/screens/layouts/forms/Scan/InputFormMachine'),
    Preview: () => import('@/app/screens/layouts/forms/view/PreviewScreen'),
    Apporved: () => import('@/app/screens/layouts/transactions/approveds/ApporvedScreen'),
    Checklist: () => import('@/app/screens/layouts/checklists/checklist/CheckListScreen'),
    Checklist_group: () => import('@/app/screens/layouts/checklists/checklist_group/ChecklistGroupScreen'),
    Checklist_option: () => import('@/app/screens/layouts/checklists/checklist_option/CheckListOptionScreen'),
    Machine: () => import('@/app/screens/layouts/machines/machine/MachineScreen'),
    Machine_group: () => import('@/app/screens/layouts/machines/machine_group/MachineGroupScreen'),
    Match_checklist_option: () => import('@/app/screens/layouts/matchs/match_checklist_option/MatchCheckListOptionScreen'),
    Match_form_machine: () => import('@/app/screens/layouts/matchs/match_form_machine/MatchFormMachineScreen'),
    Config: () => import('@/app/screens/layouts/settings/Configulation'),
    Create_form: () => import('@/app/screens/layouts/forms/create/CreateFormScreen'),
    Expected_result: () => import('@/app/screens/layouts/transactions/expected_result/ExpectedResultScreen'),
    Form: () => import('@/app/screens/layouts/forms/form/FormScreen'),
    Home: () => import('@/app/screens/layouts/HomeScreen'),
    Login: () => import('@/app/auth/LoginScreen'),
    Managepermissions: () => import('@/app/screens/SAdmin/Managepermissions'),
    Permission_deny: () => import('@/app/screens/NotFoundScreen404'),
    ScanQR: () => import('@/app/screens/layouts/actions/camera/ScanQR'),
    Setting: () => import('@/app/screens/layouts/settings/SettingScreen'),
    Test: () => import('@/app/screens/TestComponent'),
    Time: () => import('@/app/screens/layouts/schedule/TimescheduleScreen'),
    TimeTrack: () => import('@/app/screens/layouts/schedule/TimescheduleTrack'),
};

const DrawerNav = React.memo(({ renderComponent }: { renderComponent: (name: ComponentNames) => (props: any) => React.JSX.Element }) => {
    const { theme } = useTheme();
    const { fontSize } = useRes();

    const Screen = useSelector((state: any) => state.user.Screen);
    const FirstPage = useSelector((state: any) => state.user.initialRoute) || "Home";
    const Appname = useSelector((state: any) => state.prefix.AppName);
    const drawerWidth = fontSize === "small" ? 300 : fontSize === "medium" ? 350 : 400;
    const dispatch = useDispatch<AppDispatch>();

    const menuScreens = getMenuScreens(Screen, renderComponent);

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

    console.log("Drawe");

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {menuScreens.length > 0 ? (
                <Drawer.Navigator
                    drawerContent={(props) => <CustomDrawerContent {...props} />}
                    screenOptions={{
                        drawerHideStatusBarOnOpen: false,
                        drawerStatusBarAnimation: 'none',
                        drawerStyle: {
                            backgroundColor: theme.colors.background,
                            width: drawerWidth,
                        },
                        headerTitle: Appname || "",
                        headerTitleStyle: {
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#333',
                        },
                        headerRight: () => (
                            <MemoCustomMenu
                                visible={menuVisible}
                                onShow={toggleMenu}
                                onDismiss={closeMenu}
                                onSettingsPress={handleSettings}
                                onLogoutPress={handleLogout}
                            />
                        ),
                        unmountOnBlur: true,
                        freezeOnBlur: true
                    }}
                    initialRouteName={FirstPage}
                >
                    {menuScreens}
                </Drawer.Navigator>
            ) : <PermissionDeny />}

            {menuSetting && (
                <MemoSetting_dialog isVisible={menuSetting} setVisible={() => setMenuSetting(false)} />
            )}
        </SafeAreaView>
    );
});

const DrawerNavigator: React.FC = React.memo(() => {
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
                <Suspense fallback={
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text>Loading...</Text>
                    </View>
                }>
                    <LazyComponent {...props} />
                </Suspense>

            );
        }
        console.warn(`Component ${name} not found. Falling back to PermissionDeny.`);

        return (props: any) => (
            <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                <PermissionDeny {...props} />
            </Suspense>
        );
    }, []);

    return (
        <DrawerNav
            renderComponent={renderComponent}
        />
    );
});


export default DrawerNavigator;
