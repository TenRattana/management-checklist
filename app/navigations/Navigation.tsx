import React, { useEffect, useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { IconButton } from 'react-native-paper';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  HomeScreen,
  LoginScreen,
  AdminScreen,
  SuperAdminScreen,
  UserScreen,
  TestScreen,
  FormScreen,
  ExpectedResultScreen,
  CreateFormScreen,
  MachineGroupScreen,
  MachineScreen,
  MatchCheckListOptionScreen,
  MatchFormMachineScreen,
  CheckListScreen,
  ScanQR,
  GenerateQR,
  InputFormMachine,
  Managepermissions,
  SettingScreen,
  PreviewScreen,
  CheckListOptionScreen,
  ChecklistGroupScreen,
} from "@/app/screens";
import { useAuth } from "@/app/contexts/auth";
import { AccessibleView } from '@/components';
import { ScrollView } from 'react-native-gesture-handler';

const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation }: any) {
  const [isMenuListOpen, setIsMenuListOpen] = useState<{ machine: boolean, checklist: boolean, match: boolean }>({
    machine: false,
    checklist: false,
    match: false,
  });

  const { user, role, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <AccessibleView style={styles.container}>
      <ScrollView>
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
      </ScrollView>

    </AccessibleView>
  );
}


const MenuSection = ({ title, isOpen, onToggle, items, navigation }: any) => {
  const itemHeight = 40;

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
      }, 300)
    }
  }, [isOpen, totalHeight]);

  return (
    <>
      <Pressable
        onPress={onToggle}
        style={styles.menuItem}
        android_ripple={{ color: '#f0f0f0' }}
      >
        <Text style={styles.menuText}>{title}</Text>
        <IconButton icon={isOpen ? 'chevron-up' : 'chevron-down'} size={20} />
      </Pressable>

      <Animated.View style={[animatedStyle]}>
        {items.map((item: any) => (
          <Pressable
            key={item.label}
            onPress={() => navigation.navigate(item.navigateTo)}
            style={styles.subMenuItem}
            android_ripple={{ color: '#f0f0f0' }}
          >
            <Text style={styles.subMenuText}>{item.label}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </>
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
    paddingLeft: 30,
    paddingVertical: 10,
  },
  subMenuText: {
    fontSize: 14,
    color: '#555',
  },
});
export default function App() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return null;
  }

  const adminScreens = [
    { name: "Machine_group", component: MachineGroupScreen },
    { name: "Machine", component: MachineScreen },
    { name: "Checklist", component: CheckListScreen },
    { name: "Checklist_option", component: CheckListOptionScreen },
    { name: "Checklist_group", component: ChecklistGroupScreen },
    { name: "Match_checklist_option", component: MatchCheckListOptionScreen },
    { name: "Match_form_machine", component: MatchFormMachineScreen },
    { name: "Create_form", component: CreateFormScreen },
    { name: "Expected_result", component: ExpectedResultScreen },
    { name: "Form", component: FormScreen },
    { name: "User", component: UserScreen },
    { name: "Preview", component: PreviewScreen },
    { name: "Admin", component: AdminScreen },
    { name: "ScanQR", component: ScanQR },
    { name: "GenerateQR", component: GenerateQR },
    { name: "InputFormMachine", component: InputFormMachine },
    { name: "Setting", component: SettingScreen },
    { name: "Logout", component: LogoutScreen },
  ];

  const superAdminScreens = [
    { name: "Managepermissions", component: Managepermissions },
    { name: "Super_admin", component: SuperAdminScreen },
    { name: "Test", component: TestScreen },
  ];

  const generalUserScreens = [
    { name: "ScanQR", component: ScanQR },
    { name: "Form", component: FormScreen },
    { name: "Setting", component: SettingScreen },
    { name: "Logout", component: LogoutScreen },
  ];

  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name={user ? "Home" : "Login"} component={user ? HomeScreen : LoginScreen} />

      {user && (
        <>
          {(role === "SuperAdmin" || role === "Admin") && adminScreens.map((screen) => (
            <Drawer.Screen key={screen.name} name={screen.name} component={screen.component} />
          ))}
          {role === "SuperAdmin" && superAdminScreens.map((screen) => (
            <Drawer.Screen key={screen.name} name={screen.name} component={screen.component} />
          ))}
          {role === "GeneralUser" && generalUserScreens.map((screen) => (
            <Drawer.Screen key={screen.name} name={screen.name} component={screen.component} />
          ))}
        </>
      )}
    </Drawer.Navigator>
  );
}

const LogoutScreen: React.FC = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <AccessibleView style={styles.container}>
      <Pressable disabled>
        <Text>Logging out...</Text>
      </Pressable>
    </AccessibleView>
  );
};
