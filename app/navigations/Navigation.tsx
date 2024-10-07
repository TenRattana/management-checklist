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
  // PreviewScreen,
  CheckListOptionScreen,
  ChecklistGroupScreen,
} from "@/app/screens";
import { useAuth } from "@/app/contexts/auth";
import { AccessibleView } from '@/components';

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

  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name={user ? "Home" : "Login"} component={user ? HomeScreen : LoginScreen} />

      {user && (
        <>
          {role === "SuperAdmin" && (
            <>
              <Drawer.Screen name="Machine_group" component={MachineGroupScreen} />
              <Drawer.Screen name="Machine" component={MachineScreen} />
              <Drawer.Screen name="Checklist" component={CheckListScreen} />
              <Drawer.Screen name="Checklist_option" component={CheckListOptionScreen} />
              <Drawer.Screen name="Checklist_group" component={ChecklistGroupScreen} />
              <Drawer.Screen name="Match_checklist_option" component={MatchCheckListOptionScreen} />
              <Drawer.Screen name="Match_form_machine" component={MatchFormMachineScreen} />
              <Drawer.Screen name="Create_form" component={CreateFormScreen} />
              <Drawer.Screen name="Expected_result" component={ExpectedResultScreen} />
              <Drawer.Screen name="Form" component={FormScreen} />
              <Drawer.Screen name="Test" component={TestScreen} />
              <Drawer.Screen name="User" component={UserScreen} />
              {/* <Drawer.Screen name="Preview" component={UserScreen} /> */}
              <Drawer.Screen name="Super_admin" component={SuperAdminScreen} />
              <Drawer.Screen name="Admin" component={AdminScreen} />
              <Drawer.Screen name="Logout" component={LogoutScreen} />
            </>
          )}
          {role === "Admin" && (
            <>
              <Drawer.Screen name="Machine_group" component={MachineGroupScreen} />
              <Drawer.Screen name="Machine" component={MachineScreen} />
              <Drawer.Screen name="Checklist" component={CheckListScreen} />
              <Drawer.Screen name="Checklist_option" component={CheckListOptionScreen} />
              <Drawer.Screen name="Checklist_group" component={ChecklistGroupScreen} />
              <Drawer.Screen name="Match_checklist_option" component={MatchCheckListOptionScreen} />
              <Drawer.Screen name="Match_form_machine" component={MatchFormMachineScreen} />
              <Drawer.Screen name="Create_form" component={CreateFormScreen} />
              <Drawer.Screen name="Expected_result" component={ExpectedResultScreen} />
              <Drawer.Screen name="Form" component={FormScreen} />
              <Drawer.Screen name="Test" component={TestScreen} />
              <Drawer.Screen name="User" component={UserScreen} />
              <Drawer.Screen name="Admin" component={AdminScreen} />
              <Drawer.Screen name="Logout" component={LogoutScreen} />
            </>
          )}
          {role === "GeneralUser" && (
            <>
              <Drawer.Screen name="Machine_group" component={MachineGroupScreen} />
              <Drawer.Screen name="Machine" component={MachineScreen} />
              <Drawer.Screen name="Checklist" component={CheckListScreen} />
              <Drawer.Screen name="Checklist_option" component={CheckListOptionScreen} />
              <Drawer.Screen name="Checklist_group" component={ChecklistGroupScreen} />
              <Drawer.Screen name="Create_form" component={CreateFormScreen} />
              <Drawer.Screen name="Expected_result" component={ExpectedResultScreen} />
              <Drawer.Screen name="Form" component={FormScreen} />
              <Drawer.Screen name="Logout" component={LogoutScreen} />
            </>
          )}
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
