import React, { useState, lazy, Suspense, useRef, useCallback, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HomeScreen, LoginScreen, AdminScreen, SuperAdminScreen, ScanQR, GenerateQR, UserScreen, SettingScreen, Managepermissions } from '@/app/screens';
import NotFoundScreen from '@/app/+not-found';
import { useAuth } from "@/app/contexts/auth";
import { useRes } from "@/app/contexts/responsive";
import CustomDrawerContent from '../../components/navigation/CustomDrawer';
import axiosInstance from '@/config/axios';
import { Text, AccessibleView } from '@/components';
import { useTheme } from '../contexts';

const Drawer = createDrawerNavigator();

type ComponentNames = 'TestScreen' | 'Form' | 'Expected_result' | 'Create_form' | 'Machine_group' |
  'Machine' | 'Match_checklist_option' | 'Match_form_machine' | 'Checklist' |
  'InputFormMachine' | 'Preview' | 'Checklist_option' | 'Checklist_group' | 'ScanQR' | 'GenerateQR' | 'Setting' | 'Managepermissions' | 'NotFoundScreen' | 'Home';

const components: Record<ComponentNames, () => Promise<{ default: React.ComponentType<any> }>> = {
  Home: () => Promise.resolve({ default: HomeScreen }),
  ScanQR: () => Promise.resolve({ default: ScanQR }),
  GenerateQR: () => Promise.resolve({ default: GenerateQR }),
  Setting: () => Promise.resolve({ default: SettingScreen }),
  NotFoundScreen: () => Promise.resolve({ default: NotFoundScreen }),
  TestScreen: () => import('@/app/screens/TestScreen'),
  Form: () => import('@/app/screens/layouts/forms/form/FormScreen'),
  Expected_result: () => import('@/app/screens/layouts/transitions/expected_result/ExpectedResultScreen'),
  Create_form: () => import('@/app/screens/layouts/forms/create/CreateFormScreen'),
  Machine_group: () => import('@/app/screens/layouts/machines/machine_group/MachineGroupScreen'),
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


const Navigation = () => {
  const { loading, screens, session } = useAuth();
  const { fontSize } = useRes();

  const { theme } = useTheme()

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

  const renderComponent = useCallback((name: ComponentNames) => {
    if (!loadedComponents.has(name)) {
      const LazyComponent = lazy(components[name]);
      cachedComponents.current[name] = LazyComponent;
      setLoadedComponents((prev) => new Set(prev).add(name));
    }

    const Component = cachedComponents.current[name];
    return (props: any) => (
      <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
        <Component {...props} />
      </Suspense>
    );
  }, [loadedComponents]);

  if (loading) {
    return (
      <AccessibleView name="nav" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </AccessibleView>
    );
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: drawerWidth,
        },
      }}
      id='nav'
    >
      {screens.length > 0 ? (
        screens.map(screen => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
            component={renderComponent(screen.name as ComponentNames)}
            options={{
              headerTitle: "",
              unmountOnBlur: true,
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

export default React.memo(Navigation)