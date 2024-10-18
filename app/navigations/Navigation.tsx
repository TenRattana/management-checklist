import React, { useState, lazy, Suspense, useRef, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HomeScreen, LoginScreen, AdminScreen, SuperAdminScreen, ScanQR, GenerateQR, UserScreen, SettingScreen, Managepermissions } from '@/app/screens';
import NotFoundScreen from '@/app/+not-found'
import { useAuth } from "@/app/contexts/auth";
import CustomDrawerContent from './custom/CustomDrawer';

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

const Navigations = () => {
  console.log("Navigations");

  const { loading, screens } = useAuth();
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set());
  const cachedComponents = useRef<{ [key: string]: React.ComponentType<any> }>({});

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const renderComponent = (name: ComponentNames) => {
    console.log("renderComponent");

    if (!loadedComponents.has(name)) {
      if (!cachedComponents.current[name]) {
        cachedComponents.current[name] = lazy(components[name]);
      }
      loadedComponents.add(name);
    }

    const Component = cachedComponents.current[name];
    return (props: any) => <Component {...props} />;
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName='Home'
    >
      {!loading && screens && screens.length > 0 ? screens.map(screen => (
        <Drawer.Screen
          key={screen.name}
          name={screen.name}
          component={renderComponent(screen.name as ComponentNames)}
        />
      )) : (
        <Drawer.Screen name={"Login"} component={LoginScreen} />
      )}
    </Drawer.Navigator>
  );
};

export default React.memo(Navigations);
