// import React, { useEffect, useState, lazy, Suspense, useRef } from 'react';
// import { Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
// import { IconButton } from 'react-native-paper';
// import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
// import { useAuth } from "@/app/contexts/auth";
// import { AccessibleView } from '@/components';
// import { ScrollView } from 'react-native-gesture-handler';
// import { LoginScreen } from '../screens';

// const Drawer = createDrawerNavigator();

// function CustomDrawerContent(props: any) {
//   const { navigation } = props;
//   const [isMenuListOpen, setIsMenuListOpen] = useState({
//     machine: false,
//     checklist: false,
//     match: false,
//   });

//   const { user, loading } = useAuth();

//   if (loading) {
//     return <ActivityIndicator size="large" color="#0000ff" />;
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <DrawerContentScrollView {...props}>
//         {user ? (
//           <>
//             <Pressable
//               onPress={() => navigation.navigate('Home')}
//               style={styles.menuItem}
//               android_ripple={{ color: '#f0f0f0' }}
//             >
//               <Text style={styles.menuText}>Home</Text>
//             </Pressable>

//             <MenuSection
//               title="Machine"
//               isOpen={isMenuListOpen.machine}
//               onToggle={() => setIsMenuListOpen(prev => ({ ...prev, machine: !prev.machine }))}
//               items={[
//                 { label: 'Machine Group', navigateTo: 'Machine_group' },
//                 { label: 'Machine', navigateTo: 'Machine' },
//               ]}
//               navigation={navigation}
//             />

//             <MenuSection
//               title="Check List"
//               isOpen={isMenuListOpen.checklist}
//               onToggle={() => setIsMenuListOpen(prev => ({ ...prev, checklist: !prev.checklist }))}
//               items={[
//                 { label: 'Check List', navigateTo: 'Checklist' },
//                 { label: 'Check List Option', navigateTo: 'Checklist_option' },
//                 { label: 'Group Check List', navigateTo: 'Checklist_group' },
//               ]}
//               navigation={navigation}
//             />

//             <MenuSection
//               title="Match"
//               isOpen={isMenuListOpen.match}
//               onToggle={() => setIsMenuListOpen(prev => ({ ...prev, match: !prev.match }))}
//               items={[
//                 { label: 'Match Option & Group Check List', navigateTo: 'Match_checklist_option' },
//                 { label: 'Match Form & Machine', navigateTo: 'Match_form_machine' },
//               ]}
//               navigation={navigation}
//             />

//             {['Form', 'Expected_result', 'Test', 'ScanQR', 'GenerateQR', 'Managepermissions', 'Setting'].map(screen => (
//               <Pressable
//                 key={screen}
//                 onPress={() => navigation.navigate(screen)}
//                 style={styles.menuItem}
//                 android_ripple={{ color: '#f0f0f0' }}
//               >
//                 <Text style={styles.menuText}>{screen.replace('_', ' ')}</Text>
//               </Pressable>
//             ))}

//             <Pressable
//               onPress={LogoutScreen}
//               style={styles.menuItem}
//               android_ripple={{ color: '#f0f0f0' }}
//             >
//               <Text style={styles.menuText}>Logout</Text>
//             </Pressable>
//           </>
//         ) : (
//           <Pressable
//             onPress={() => navigation.navigate('Login')}
//             style={styles.menuItem}
//             android_ripple={{ color: '#f0f0f0' }}
//           >
//             <Text style={styles.menuText}>Login</Text>
//           </Pressable>
//         )}
//       </DrawerContentScrollView>
//     </ScrollView>
//   );
// }

// const MenuSection = ({ title, isOpen, onToggle, items, navigation }: any) => {
//   const itemHeight = 68;
//   const height = useSharedValue(0);
//   const opacity = useSharedValue(0);
//   const totalHeight = items.length * itemHeight;

//   const animatedStyle = useAnimatedStyle(() => ({
//     height: height.value,
//     opacity: opacity.value,
//     overflow: 'hidden',
//   }));

//   useEffect(() => {
//     if (isOpen) {
//       opacity.value = withTiming(1, { duration: 300 });
//       height.value = withTiming(totalHeight, { duration: 300 });
//     } else {
//       setTimeout(() => {
//         opacity.value = withTiming(0, { duration: 300 });
//         height.value = withTiming(0, { duration: 300 });
//       }, 300);
//     }
//   }, [isOpen, totalHeight]);

//   return (
//     <>
//       <Pressable onPress={onToggle} style={styles.menuItem}>
//         <Text style={styles.menuText}>{title}</Text>
//         <IconButton icon={isOpen ? 'chevron-up' : 'chevron-down'} size={20} />
//       </Pressable>
//       <Animated.View style={[animatedStyle]}>
//         {items.map((item: any) => (
//           <Pressable key={item.label} onPress={() => navigation.navigate(item.navigateTo)} style={styles.subMenuItem}>
//             <Text style={styles.subMenuText}>{item.label}</Text>
//           </Pressable>
//         ))}
//       </Animated.View>
//     </>
//   );
// };

// const LogoutScreen = () => {
//   const { logout } = useAuth();

//   useEffect(() => {
//     logout();
//   }, [logout]);

//   return (
//     <AccessibleView name="navigation" style={styles.container}>
//       <Pressable disabled>
//         <Text>Logging out...</Text>
//       </Pressable>
//     </AccessibleView>
//   );
// };
// type ComponentNames = 'Test' | 'Form' | 'Expected_result' | 'Create_form' | 'Machine_group' |
//   'Machine' | 'Match_checklist_option' | 'Match_form_machine' | 'Checklist' |
//   'InputFormMachine' | 'Preview' | 'Checklist_option' | 'Checklist_group' | 'Home';

// const components: Record<ComponentNames, () => Promise<{ default: React.ComponentType<any> }>> = {
//   Home: () => import('@/app/screens/layouts/HomeScreen'),
//   Test: () => import('@/app/screens/TestScreen'),
//   Form: () => import('@/app/screens/layouts/forms/form/FormScreen'),
//   Expected_result: () => import('@/app/screens/layouts/transitions/expected_result/ExpectedResultScreen'),
//   Create_form: () => import('@/app/screens/layouts/forms/create/CreateFormScreen'),
//   Machine_group: () => import('@/app/screens/layouts/machines/machine_group/MachineGroupScreen'),
//   Machine: () => import('@/app/screens/layouts/machines/machine/MachineScreen'),
//   Match_checklist_option: () => import('@/app/screens/layouts/matchs/match_checklist_option/MatchCheckListOptionScreen'),
//   Match_form_machine: () => import('@/app/screens/layouts/matchs/match_form_machine/MatchFormMachineScreen'),
//   Checklist: () => import('@/app/screens/layouts/checklists/checklist/CheckListScreen'),
//   InputFormMachine: () => import('@/app/screens/layouts/forms/Scan/InputFormMachine'),
//   Preview: () => import('@/app/screens/layouts/forms/view/Preview'),
//   Checklist_option: () => import('@/app/screens/layouts/checklists/checklist_option/CheckListOptionScreen'),
//   Checklist_group: () => import('@/app/screens/layouts/checklists/checklist_group/ChecklistGroupScreen'),
// };

// const App = () => {
//   const { user, role, loading } = useAuth();
//   const [loadedComponents, setLoadedComponents] = useState(new Set<string>());
//   const cachedComponents = useRef<{ [key: string]: React.ComponentType<any> }>({});

//   if (loading) {
//     return <ActivityIndicator size="large" color="#0000ff" />;
//   }

//   const renderComponent = (name: ComponentNames) => {
//     const Component = React.lazy(components[name]);
//     return (props: any) => <Component {...props} />;
//   };

//   return (
//     <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
//       <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
//         {user ? (
//           <>
//             {(role === "SuperAdmin" || role === "Admin") && (
//               <>
//                 {[
//                   'Home',
//                   'Machine_group',
//                   'Machine',
//                   'Checklist',
//                   'Checklist_option',
//                   'Checklist_group',
//                   'Match_checklist_option',
//                   'Match_form_machine',
//                   'Create_form',
//                   'Expected_result',
//                   'Form',
//                   'User',
//                   'Preview',
//                   'Admin',
//                   'ScanQR',
//                   'GenerateQR',
//                   'InputFormMachine',
//                   'Setting'
//                 ].map(screen => (
//                   <Drawer.Screen
//                     key={screen}
//                     name={screen}
//                     component={renderComponent(screen as ComponentNames)}
//                   />
//                 ))}
//               </>
//             )}

//             {role === "SuperAdmin" && (
//               <>
//                 {[
//                   'Managepermissions',
//                   'SuperAdmin',
//                   'Test'
//                 ].map(screen => (
//                   <Drawer.Screen
//                     key={screen}
//                     name={screen}
//                     component={renderComponent(screen as ComponentNames)}
//                   />
//                 ))}
//               </>
//             )}
//             {role === "GeneralUser" && (
//               <>
//                 {[
//                   'ScanQR',
//                   'InputFormMachine',
//                   'Setting'
//                 ].map(screen => (
//                   <Drawer.Screen
//                     key={screen}
//                     name={screen}
//                     component={renderComponent(screen as ComponentNames)}
//                   />
//                 ))}
//               </>
//             )}
//           </>
//         ) : (
//           <Drawer.Screen name={"Login"} component={LoginScreen} />
//         )}
//       </Drawer.Navigator>
//     </Suspense>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingVertical: 10,
//   },
//   menuItem: {
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     minHeight: 68,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   menuText: {
//     fontSize: 16,
//   },
//   subMenuItem: {
//     paddingLeft: 40,
//     minHeight: 68,
//     paddingVertical: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   subMenuText: {
//     fontSize: 16,
//     color: '#5e5e5e',
//   },
// });

// export default App;

import React, { useEffect, useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ActivityIndicator, IconButton } from 'react-native-paper';
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

const App = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
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
            <Drawer.Screen key={screen.name} name={screen.name} component={screen.component as any} />
          ))}
          {role === "SuperAdmin" && superAdminScreens.map((screen) => (
            <Drawer.Screen key={screen.name} name={screen.name} component={screen.component as any} />
          ))}
          {role === "GeneralUser" && generalUserScreens.map((screen) => (
            <Drawer.Screen key={screen.name} name={screen.name} component={screen.component as any} />
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
    <AccessibleView name="logout" style={styles.container}>
      <Pressable disabled>
        <Text>Logging out...</Text>
      </Pressable>
    </AccessibleView>
  );
};

export default App;

