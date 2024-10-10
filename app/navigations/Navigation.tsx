import React, { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { IconButton } from 'react-native-paper';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HomeScreen, LoginScreen, AdminScreen, SuperAdminScreen, ScanQR, GenerateQR, UserScreen, SettingScreen, Managepermissions } from '@/app/screens';
import { useAuth } from "@/app/contexts/auth";
import { AccessibleView } from '@/components';
import { ScrollView } from 'react-native-gesture-handler';

const Drawer = createDrawerNavigator();
import { DrawerContentScrollView } from '@react-navigation/drawer';

function CustomDrawerContent(props: any) {
  const { navigation } = props;

  const [isMenuListOpen, setIsMenuListOpen] = useState<{ machine: boolean; checklist: boolean; match: boolean }>({
    machine: false,
    checklist: false,
    match: false,
  });

  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <DrawerContentScrollView {...props}>
        {user ? (
          <>
            <Pressable
              onPress={() => navigation.navigate('Home')}
              style={styles.menuItem}
              android_ripple={{ color: '#f0f0f0' }}
            >
              <Text style={styles.menuText}>Home</Text>
            </Pressable>

            <MenuSection
              title="Machine"
              isOpen={isMenuListOpen.machine}
              onToggle={() => setIsMenuListOpen((prev) => ({ ...prev, machine: !prev.machine }))}
              items={[
                { label: 'Machine Group', navigateTo: 'Machine_group' },
                { label: 'Machine', navigateTo: 'Machine' },
              ]}
              navigation={navigation}
            />

            <MenuSection
              title="Check List"
              isOpen={isMenuListOpen.checklist}
              onToggle={() => setIsMenuListOpen((prev) => ({ ...prev, checklist: !prev.checklist }))}
              items={[
                { label: 'Check List', navigateTo: 'Checklist' },
                { label: 'Check List Option', navigateTo: 'Checklist_option' },
                { label: 'Group Check List', navigateTo: 'Checklist_group' },
              ]}
              navigation={navigation}
            />

            <MenuSection
              title="Match"
              isOpen={isMenuListOpen.match}
              onToggle={() => setIsMenuListOpen((prev) => ({ ...prev, match: !prev.match }))}
              items={[
                { label: 'Match Option & Group Check List', navigateTo: 'Match_checklist_option' },
                { label: 'Match Form & Machine', navigateTo: 'Match_form_machine' },
              ]}
              navigation={navigation}
            />

            <Pressable
              onPress={() => navigation.navigate('Form')}
              style={styles.menuItem}
              android_ripple={{ color: '#f0f0f0' }}
            >
              <Text style={styles.menuText}>List Form</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('Expected_result')}
              style={styles.menuItem}
              android_ripple={{ color: '#f0f0f0' }}
            >
              <Text style={styles.menuText}>List Result</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('Test')}
              style={styles.menuItem}
              android_ripple={{ color: '#f0f0f0' }}
            >
              <Text style={styles.menuText}>Test</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('ScanQR')}
              style={styles.menuItem}
              android_ripple={{ color: '#f0f0f0' }}
            >
              <Text style={styles.menuText}>Scan QR Code</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('GenerateQR')}
              style={styles.menuItem}
              android_ripple={{ color: '#f0f0f0' }}
            >
              <Text style={styles.menuText}>Generate QR Code</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('Managepermissions')}
              style={styles.menuItem}
              android_ripple={{ color: '#f0f0f0' }}
            >
              <Text style={styles.menuText}>Managepermissions</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('Setting')}
              style={styles.menuItem}
              android_ripple={{ color: '#f0f0f0' }}
            >
              <Text style={styles.menuText}>Setting</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('Logout')}
              style={styles.menuItem}
              android_ripple={{ color: '#f0f0f0' }}
            >
              <Text style={styles.menuText}>Logout</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={styles.menuItem}
            android_ripple={{ color: '#f0f0f0' }}
          >
            <Text style={styles.menuText}>Login</Text>
          </Pressable>
        )}
      </DrawerContentScrollView>
    </ScrollView>
  );
}

const MenuSection = ({ title, isOpen, onToggle, items, navigation }: any) => {
  const itemHeight = 68;
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  const totalHeight = items.length * itemHeight;

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    overflow: 'hidden',
  }));

  useEffect(() => {
    if (isOpen) {
      opacity.value = withTiming(1, { duration: 300 });
      height.value = withTiming(totalHeight, { duration: 300 });
    } else {
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        height.value = withTiming(0, { duration: 300 });
      }, 300);
    }
  }, [isOpen, totalHeight]);

  return (
    <>
      <Pressable onPress={onToggle} style={styles.menuItem}>
        <Text style={styles.menuText}>{title}</Text>
        <IconButton icon={isOpen ? 'chevron-up' : 'chevron-down'} size={20} />
      </Pressable>
      <Animated.View style={[animatedStyle]}>
        {items.map((item: any) => (
          <Pressable key={item.label} onPress={() => navigation.navigate(item.navigateTo)} style={styles.subMenuItem}>
            <Text style={styles.subMenuText}>{item.label}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </>
  );
};

type ComponentNames = 'Test' | 'Form' | 'Expected_result' | 'Create_form' | 'Machine_group' |
  'Machine' | 'Match_checklist_option' | 'Match_form_machine' | 'Checklist' |
  'InputFormMachine' | 'Preview' | 'Checklist_option' | 'Checklist_group';

const components: Record<ComponentNames, () => Promise<{ default: React.ComponentType<any> }>> = {
  Test: () => import('@/app/screens/TestScreen'),
  Form: () => import('@/app/screens/layouts/forms/form/FormScreen'),
  Expected_result: () => import('@/app/screens/layouts/transitions/expected_result/ExpectedResultScreen'),
  Create_form: () => import('@/app/screens/layouts/forms/create/CreateFormScreen'),
  Machine_group: () => import('@/app/screens/layouts/machines/machine_group/MachineGroupScreen'),
  Machine: () => import('@/app/screens/layouts/machines/machine/MachineScreen'),
  Match_checklist_option: () => import('@/app/screens/layouts/matchs/match_checklist_option/MatchCheckListOptionScreen'),
  Match_form_machine: () => import('@/app/screens/layouts/matchs/match_form_machine/MatchFormMachineScreen'),
  Checklist: () => import('@/app/screens/layouts/checklists/checklist/CheckListScreen'),
  InputFormMachine: () => import('@/app/screens/layouts/forms/Scan/InputFormMachine'),
  Preview: () => import('@/app/screens/layouts/forms/view/Preview'),
  Checklist_option: () => import('@/app/screens/layouts/checklists/checklist_option/CheckListOptionScreen'),
  Checklist_group: () => import('@/app/screens/layouts/checklists/checklist_group/ChecklistGroupScreen'),
};

const App = () => {
  const { user, role, loading } = useAuth();
  const [loadedComponents, setLoadedComponents] = useState(new Set<string>());
  const cachedComponents = useRef<{ [key: string]: React.ComponentType<any> }>({});

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const renderComponent = (name: ComponentNames) => {
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
    <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
      <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
        {user ? (
          <>
            {(role === "SuperAdmin" || role === "Admin") && (
              <>
                {[
                  { name: "Machine_group" },
                  { name: "Machine" },
                  { name: "Checklist" },
                  { name: "Checklist_option" },
                  { name: "Checklist_group" },
                  { name: "Match_checklist_option" },
                  { name: "Match_form_machine" },
                  { name: "Create_form" },
                  { name: "Expected_result" },
                  { name: "Form" },
                  { name: "User" },
                  { name: "Preview" },
                  { name: "Admin" },
                  { name: "ScanQR" },
                  { name: "GenerateQR" },
                  { name: "InputFormMachine" },
                  { name: "Setting" },
                ].map(screen => (
                  <Drawer.Screen key={screen.name} name={screen.name} component={renderComponent(screen.name as ComponentNames)} />
                ))}
              </>
            )}
            {role === "SuperAdmin" && (
              <>
                {[
                  { name: "Managepermissions" },
                  { name: "SuperAdmin" },
                  { name: "Test" },
                ].map(screen => (
                  <Drawer.Screen key={screen.name} name={screen.name} component={renderComponent(screen.name as ComponentNames)} />
                ))}
              </>
            )}
            {role === "GeneralUser" && (
              <>
                {[
                  { name: "ScanQR" },
                  { name: "InputFormMachine" },
                  { name: "Setting" },
                  { name: "Logout" },
                ].map(screen => (
                  <Drawer.Screen key={screen.name} name={screen.name} component={renderComponent(screen.name as ComponentNames)} />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <Drawer.Screen name={"Login"} component={LoginScreen} />
          </>
        )}
      </Drawer.Navigator>
    </Suspense>
  );
};

const LogoutScreen: React.FC = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <AccessibleView name="navigation" style={styles.container}>
      <Pressable disabled>
        <Text>Logging out...</Text>
      </Pressable>
    </AccessibleView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 68,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
  },
  subMenuItem: {
    paddingLeft: 40,
    minHeight: 68,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subMenuText: {
    fontSize: 16,
    color: '#5e5e5e',
  },
});

export default App;