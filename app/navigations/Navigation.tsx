import React, { lazy, Suspense, useRef, useCallback, useState, useMemo } from 'react';
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
import { LoadingSpinner } from '@/components';
import { IconButton, Text } from 'react-native-paper';
import { Platform, View } from 'react-native';
import { useToast } from '../contexts/useToast';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';

const Drawer = createDrawerNavigator();
const MemoSetting_dialog = React.memo(Setting_dialog)

export const navigationRef = React.createRef<NavigationContainerRef<{}> & { openDrawer: () => void; closeDrawer: () => void }>();

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
    Managepermissions: () => import('@/app/screens/layouts/permission/Managepermissions'),
    Permission_deny: () => import('@/app/screens/NotFoundScreen404'),
    ScanQR: () => import('@/app/screens/layouts/actions/camera/ScanQR'),
    Setting: () => import('@/app/screens/layouts/settings/SettingScreen'),
    Time: () => import('@/app/screens/layouts/schedule/TimescheduleScreen'),
    TimeTrack: () => import('@/app/screens/layouts/schedule/TimescheduleTrack'),
};

const DrawerNav = React.memo(({ renderComponent, user }: any) => {
    const { theme, darkMode } = useTheme();
    const { showSuccess } = useToast();
    const { fontSize, spacing, responsive } = useRes();
    const state = useSelector((state: any) => state.prefix);
    const drawerWidth = fontSize === "small" ? 300 : fontSize === "medium" ? 350 : 400;
    const dispatch = useDispatch<AppDispatch>();
    const [isDrawerVisible, setDrawerVisible] = useState(true);

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuSetting, setMenuSetting] = useState(false);

    const handleSettings = useCallback(() => {
        setMenuSetting(true);
        setMenuVisible(false);
    }, []);

    const handleLogout = useCallback(() => {
        dispatch(initializeLogout());
        setMenuVisible(false);
        showSuccess("Logout Success")
    }, [dispatch]);

    const toggleMenu = useCallback(() => {
        setMenuVisible((prev) => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setMenuVisible(false);
    }, []);

    const menuScreens = useMemo(() => {
        const screens: JSX.Element[] = [];
        user.Screen.forEach((screen: Menus) => {
            if (screen.NavigationTo) {
                screens.push(
                    <Drawer.Screen
                        key={screen.MenuID}
                        name={screen.NavigationTo}
                        component={renderComponent(screen.NavigationTo as ComponentNames)}
                        options={{ title: screen.MenuLabel }}
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
                            options={{ title: screen.MenuLabel }}
                        />
                    );
                });
            }
        });

        return screens;
    }, [user.IsAuthenticated, user.Screen, renderComponent]);

    const initialRoute = user.initialRoute || (user.Screen.length > 0 ? user.Screen[0].NavigationTo : "");

    const toggleDrawer = () => {
        if (navigationRef.current) {
            navigationRef.current.dispatch(DrawerActions.toggleDrawer());
        }
        setDrawerVisible(!isDrawerVisible)
    };

    return user.Screen.length > 0 && (
        <>
            {Platform.OS === "web" && responsive === "large" && (
                <View style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60,
                    backgroundColor: theme.colors.blueNav,
                    borderColor: "rgb(216, 216, 216)",
                    borderTopWidth: 1, borderBottomWidth: 1,
                    ...Platform.select({
                        web: {
                            boxShadow: `${theme.colors.onBackground || "#000"} 0px 2px 4px`,
                        },
                        ios: {
                            shadowColor: theme.colors.onBackground || "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 1,
                            shadowRadius: 4,
                        },
                        android: {
                            elevation: 4,
                        },
                    }),
                }} key={JSON.stringify(darkMode)}>
                    <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center' }}>
                        <IconButton icon="menu" iconColor={theme.colors.fff} size={25}
                            onPress={() => toggleDrawer()}
                        />
                        <Text style={{
                            paddingLeft: 5,
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: theme.colors.fff,
                        }}>{state.AppName || ''}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.fff }}>{user.Full_Name}</Text>
                        <CustomMenu
                            visible={menuVisible}
                            onShow={toggleMenu}
                            onDismiss={closeMenu}
                            onSettingsPress={handleSettings}
                            onLogoutPress={handleLogout}
                        />
                    </View>
                </View>
            )}
            <Drawer.Navigator
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: Platform.OS !== 'web' || responsive !== "large",
                    drawerStatusBarAnimation: 'none',
                    drawerStyle: {
                        backgroundColor: theme.colors.background,
                        width: drawerWidth,
                        display: Platform.OS === 'web' && responsive === "large" && isDrawerVisible ? 'flex' : Platform.OS !== 'web' || responsive !== "large" ? 'flex' : 'none'
                    },
                    drawerType: Platform.OS === 'web' && responsive === "large" ? 'permanent' : 'front',
                    headerTitle: state.AppName || '',
                    headerTitleStyle: {
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: theme.colors.fff,
                    },
                    headerStyle: {
                        backgroundColor: theme.colors.blueNav
                    },
                    headerTintColor: theme.colors.fff,
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: theme.colors.fff,
                            }}>{user.Full_Name}</Text>
                            <CustomMenu
                                visible={menuVisible}
                                onShow={toggleMenu}
                                onDismiss={closeMenu}
                                onSettingsPress={handleSettings}
                                onLogoutPress={handleLogout}
                            />
                        </View>
                    ),
                    freezeOnBlur: true,
                    unmountOnBlur: true,
                }}
                initialRouteName={initialRoute}
                id="nav"
            >
                {menuScreens}
            </Drawer.Navigator>

            <MemoSetting_dialog isVisible={menuSetting} setVisible={() => setMenuSetting(false)} />
        </>
    );
});

const Navigation: React.FC = React.memo(() => {
    const user = useSelector((state: any) => state.user);

    const cachedComponents = useRef<{ [key: string]: React.ComponentType<any> }>({});

    const renderComponent = useCallback((name: ComponentNames) => {
        if (cachedComponents.current[name]) {
            const Component = cachedComponents.current[name];
            return (props: any) => (
                <Suspense fallback={<LoadingSpinner />}>
                    <Component {...props} />
                </Suspense>
            );
        }

        if (name in components) {
            const LazyComponent = lazy(components[name as ComponentNames]);
            cachedComponents.current[name] = LazyComponent;

            return (props: any) => (
                <Suspense fallback={<LoadingSpinner />}>
                    <LazyComponent {...props} />
                </Suspense>
            );
        }

        return (props: any) => (
            <Suspense fallback={<LoadingSpinner />}>
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
