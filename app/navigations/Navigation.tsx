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
import NotFoundScreen from '@/app/+not-found';
import CustomDrawerContent from '@/components/navigation/CustomDrawer';
import axiosInstance from '@/config/axios';
import { useSelector } from "react-redux";
import { useAuth, useRes, useTheme } from '@/app/contexts';

const Drawer = createDrawerNavigator();

type ComponentNames =
  | 'Create_form'
  | 'InputFormMachine'
  | 'Preview';

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
  | 'Managepermissions';

const components: Record<ComponentNames, () => Promise<{ default: React.ComponentType<any> }>> = {
  Create_form: () => import('@/app/screens/layouts/forms/create/CreateFormScreen'),
  InputFormMachine: () => import('@/app/screens/layouts/forms/Scan/InputFormMachine'),
  Preview: () => import('@/app/screens/layouts/forms/view/Preview'),
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
  Permission_deny: NotFoundScreen,
  Home: HomeScreen,
};

const Navigation: React.FC = () => {
  const prefix = useSelector((state: any) => state.prefix);
  const user = useSelector((state: any) => state.user);
  const screens = user.screens;
  const { loading } = useAuth();
  const { fontSize } = useRes();
  const { theme } = useTheme();

  const cachedComponents = useRef<{ [key: string]: React.ComponentType<any> }>({});

  const drawerWidth = fontSize === "small" ? 300 : fontSize === "medium" ? 350 : 400;

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.request.use(config => {
      if (user.isAuthenticated) {
        config.headers['Authorization'] = user.username;
      }
      return config;
    });

    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, [user]);

  const renderComponent = useCallback((name: ComponentNames | ComponentNameNoLazy) => {
    console.log("name", name);

    if (name in nonLazyComponents) {
      const Component = nonLazyComponents[name as ComponentNameNoLazy];
      return (props: any) => <Component {...props} />;
    } else if (name in components) {
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
        <NotFoundScreen {...props} />
      </Suspense>
    );
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return user.isAuthenticated ? (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: drawerWidth,
        },
        unmountOnBlur: true,
      }}
      id='nav'
      key={'nav'}
    >
      {screens.length > 0 ? (
        screens.map((screen: { name: string }) => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
            component={renderComponent(screen.name as (ComponentNames | ComponentNameNoLazy))}
            options={{
              headerTitle: prefix.AppName || "",
              drawerLabel: screen.name,
            }}
          />
        ))
      ) : (
        <Drawer.Screen
          name="Permission_deny"
          component={NotFoundScreen}
          options={{
            drawerLabel: 'Permission Denied',
          }}
        />
      )}

    </Drawer.Navigator>
  ) : false
};

export default React.memo(Navigation);
