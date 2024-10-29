import React, { useState, lazy, Suspense, useRef, useCallback, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HomeScreen, LoginScreen, ScanQR, GenerateQR, SettingScreen, ConfigulationScreen, MachineGroupScreen, MachineScreen } from '@/app/screens';
import NotFoundScreen from '@/app/+not-found';
import { useAuth } from "@/app/contexts/auth";
import { useRes } from "@/app/contexts/responsive";
import CustomDrawerContent from '@/components/navigation/CustomDrawer';
import axiosInstance from '@/config/axios';
import { useTheme } from '../contexts';
import { useSelector } from "react-redux";

const Drawer = createDrawerNavigator();

type ComponentNames = 'TestScreen' | 'Form' | 'Expected_result' | 'Create_form' |
  'Machine' | 'Match_checklist_option' | 'Match_form_machine' | 'Checklist' |
  'InputFormMachine' | 'Preview' | 'Checklist_option' | 'Checklist_group' | 'ScanQR' | 'GenerateQR' | 'Setting' | 'Managepermissions' | 'NotFoundScreen' | 'Home' |
  'Config';

  type ComponentNameNoLazy = 'Machine_group';

const components: Record<ComponentNames, () => Promise<{ default: React.ComponentType<any> }>> = {
  Home: () => Promise.resolve({ default: HomeScreen }),
  ScanQR: () => Promise.resolve({ default: ScanQR }),
  GenerateQR: () => Promise.resolve({ default: GenerateQR }),
  Setting: () => Promise.resolve({ default: SettingScreen }),
  Config: () => Promise.resolve({ default: ConfigulationScreen }),
  NotFoundScreen: () => Promise.resolve({ default: NotFoundScreen }),
  TestScreen: () => import('@/app/screens/TestScreen'),
  Form: () => import('@/app/screens/layouts/forms/form/FormScreen'),
  Expected_result: () => import('@/app/screens/layouts/transitions/expected_result/ExpectedResultScreen'),
  Create_form: () => import('@/app/screens/layouts/forms/create/CreateFormScreen'),
  Machine: () => import('@/app/screens/layouts/machines/machine/MachineScreen'),
  Match_checklist_option: () => import('@/app/screens/layouts/matchs/match_checklist_option/MatchCheckListOptionScreen'),
  Match_form_machine: () => import('@/app/screens/layouts/matchs/match_form_machine/MatchFormMachineScreen'),
  Checklist: () => import('@/app/screens/layouts/checklists/checklist/CheckListScreen'),
  Managepermissions: () => import('@/app/screens/SAdmin/Managepermissions'),
  InputFormMachine: () => import('@/app/screens/layouts/forms/Scan/InputFormMachine'),
  Preview: () => import('@/app/screens/layouts/forms/view/Preview'),
  Checklist_option: () => import('@/app/screens/layouts/checklists/checklist_option/CheckListOptionScreen'),
  Checklist_group: () => import('@/app/screens/layouts/checklists/checklist_group/ChecklistGroupScreen'),
};

const nonLazyComponents: Record<ComponentNameNoLazy, React.ComponentType<any>> = {
  Machine_group: MachineGroupScreen,
};

const Navigation = () => {
  const state = useSelector((state: any) => state.prefix);
  const { loading, screens, session } = useAuth();
  const { fontSize } = useRes();
  const { theme } = useTheme();

  const [loadedComponents, setLoadedComponents] = useState(new Set<string>());
  const cachedComponents = useRef<{ [key: string]: React.ComponentType<any> }>({});

  const drawerWidth = fontSize === "small" ? 300 : fontSize === "medium" ? 350 : 400;

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.request.use(config => {
      if (session) {
        config.headers['Authorization'] = session.UserName;
      }
      return config;
    });

    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, [session]);

  const renderComponent = useCallback((name: ComponentNames | ComponentNameNoLazy) => {
    if (name in nonLazyComponents) {
      const Component = nonLazyComponents[name];
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
      const LazyComponent = lazy(components[name]);
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

  return (
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
    >
      {screens.length > 0 ? (
        screens.map(screen => (
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
        <Drawer.Screen name="Login" component={LoginScreen} />
      )}
    </Drawer.Navigator>
  );
};

export default React.memo(Navigation);
