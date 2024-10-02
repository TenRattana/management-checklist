import React, { useEffect } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useAuth } from "@/app/contexts/auth";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import {
  HomeScreen,
  LoginScreen,
  AdminScreen,
  SuperAdminScreen,
  UserScreen,
  TestScreen,
  FormScreen,
  ExpectedResultScreen,
  Preview,
  CreateFormScreen,
} from "@/app/screens";
import AccessibleView from "@/components/AccessibleView";
import { MachineRoute } from "./Machine/MachineRoute";
import { CheckListRoute } from "./CheckList/CheckListRoute";
import { MatchRoute } from "./Match/MatchRoute";
import { Button } from "react-native-paper";
import { ThemeProvider, ToastProvider, ResponsiveProvider } from "@/app/contexts";

const Drawer = createDrawerNavigator();

const Navigation: React.FC = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <ResponsiveProvider>
          <Drawer.Navigator>
            <Drawer.Screen
              name={user ? "Home" : "Login"}
              component={user ? HomeScreen : LoginScreen}
              options={{
                title: user ? "Home" : "Login",
                drawerIcon: ({ color }) => (
                  <TabBarIcon name={user ? "home-outline" : "log-in"} color={color} />
                ),
              }}
            />
            {user && (
              <>
                {/* SuperAdmin Routes */}
                {role === "SuperAdmin" && (
                  <>
                    <Drawer.Screen
                      name="SuperAdmin"
                      component={SuperAdminScreen}
                      options={{
                        title: "SuperAdmin",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    {/* Machine Group */}
                    <Drawer.Group>
                      <Drawer.Screen
                        name="MachineList"
                        component={MachineRoute}
                        options={{
                          title: "Machine List",
                          drawerIcon: ({ color }) => (
                            <TabBarIcon name="home" color={color} />
                          ),
                        }}
                      />
                    </Drawer.Group>
                    {/* Checklist Routes */}
                    <Drawer.Screen
                      name="CheckListList"
                      component={CheckListRoute}
                      options={{
                        title: "Check List",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    {/* Match Routes */}
                    <Drawer.Screen
                      name="Match"
                      component={MatchRoute}
                      options={{
                        title: "Match List",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Form"
                      component={FormScreen}
                      options={{
                        title: "Form",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Expected_result"
                      component={ExpectedResultScreen}
                      options={{
                        title: "Expected Result",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Preview"
                      component={Preview}
                      options={{
                        title: "Preview",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Create_form"
                      component={CreateFormScreen}
                      options={{
                        title: "Create Form",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Test"
                      component={TestScreen}
                      options={{
                        title: "Test",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                  </>
                )}

                {/* Admin Routes */}
                {role === "Admin" && (
                  <>
                    <Drawer.Screen
                      name="Admin"
                      component={AdminScreen}
                      options={{
                        title: "Admin",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="code-slash" color={color} />
                        ),
                      }}
                    />
                    {/* Machine Group */}
                    <Drawer.Group>
                      <Drawer.Screen
                        name="MachineList"
                        component={MachineRoute}
                        options={{
                          title: "Machine List",
                          drawerIcon: ({ color }) => (
                            <TabBarIcon name="home" color={color} />
                          ),
                        }}
                      />
                    </Drawer.Group>

                    <Drawer.Screen
                      name="Form"
                      component={FormScreen}
                      options={{
                        title: "Form",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Expected_result"
                      component={ExpectedResultScreen}
                      options={{
                        title: "Expected Result",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Create_form"
                      component={CreateFormScreen}
                      options={{
                        title: "Create Form",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                  </>
                )}

                {/* GeneralUser Routes */}
                {role === "GeneralUser" && (
                  <Drawer.Screen
                    name="User"
                    component={UserScreen}
                    options={{
                      title: "User",
                      drawerIcon: ({ color }) => (
                        <TabBarIcon name="code-slash" color={color} />
                      ),
                    }}
                  />
                )}

                <Drawer.Screen
                  name="Logout"
                  component={LogoutScreen}
                  options={{
                    title: "Logout",
                    drawerIcon: ({ color }) => (
                      <TabBarIcon name="log-out" color={color} />
                    ),
                  }}
                />
              </>
            )}
          </Drawer.Navigator>
        </ResponsiveProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

const LogoutScreen: React.FC = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <AccessibleView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button mode="contained" disabled>
        Logging out...
      </Button>
    </AccessibleView>
  );
};

export default Navigation;

// import React, { useState, useEffect } from 'react';
// import { View, Text, Pressable, StyleSheet } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withRepeat,
// } from 'react-native-reanimated';

// interface AppProps {
//   width: number;
// }

// const Drawer = createDrawerNavigator();

// const HomeScreen: React.FC = () => (
//   <View style={styles.screen}><Text style={styles.title}>Home Screen</Text></View>
// );

// const MachineGroupScreen: React.FC = () => (
//   <View style={styles.screen}><Text style={styles.title}>Machine Group Screen</Text></View>
// );

// const MachineScreen: React.FC = () => (
//   <View style={styles.screen}><Text style={styles.title}>Machine Screen</Text></View>
// );

// const CheckListScreen: React.FC = () => (
//   <View style={styles.screen}><Text style={styles.title}>Checklist Screen</Text></View>
// );

// const CustomDrawerContent = (props: any) => {
//   const [isMachineOpen, setIsMachineOpen] = useState(false);
//   const machineHeight = useSharedValue(0);

//   const toggleMachineMenu = () => {
//     setIsMachineOpen(prev => !prev);
//   };

//   useEffect(() => {
//     machineHeight.value = withTiming(isMachineOpen ? 100 : 0, {
//       duration: 580,
//       easing: Easing.ease,
//       reduceMotion: ReduceMotion.Never,
//     }
//     );
//   }, [isMachineOpen]);

//   return (
//     <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
//       <Pressable onPress={toggleMachineMenu} style={styles.menuToggle}>
//         <Text style={styles.drawerItem}>Machine</Text>
//       </Pressable>
//       <Animated.View style={{ height: machineHeight.value, overflow: 'hidden' }}>
//         <Pressable onPress={() => props.navigation.navigate('MachineGroup')} style={styles.subMenuItem}>
//           <Text style={styles.drawerItem}>- Machine Group</Text>
//         </Pressable>
//         <Pressable onPress={() => props.navigation.navigate('Machine')} style={styles.subMenuItem}>
//           <Text style={styles.drawerItem}>- Machine</Text>
//         </Pressable>
//       </Animated.View>
//       <Pressable onPress={() => props.navigation.navigate('CheckList')} style={styles.menuToggle}>
//         <Text style={styles.drawerItem}>Checklist</Text>
//       </Pressable>
//       <DrawerItemList {...props} />
//     </DrawerContentScrollView>
//   );
// };

// const AppNavigator = () => {
//   return (
//     <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
//       <Drawer.Screen name="Home" component={HomeScreen} />
//       <Drawer.Screen name="MachineGroup" component={MachineGroupScreen} />
//       <Drawer.Screen name="Machine" component={MachineScreen} />
//       <Drawer.Screen name="CheckList" component={CheckListScreen} />
//     </Drawer.Navigator>
//   );
// };

// const App: React.FC = () => {
//   return (
//     <NavigationContainer independent={true}>
//       <AppNavigator />
//     </NavigationContainer>
//   );
// };

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   drawerContent: {
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   menuToggle: {
//     padding: 16,
//     backgroundColor: '#eaeaea',
//     borderRadius: 5,
//     marginVertical: 5,
//   },
//   drawerItem: {
//     fontSize: 18,
//     color: '#333',
//   },
//   subMenuItem: {
//     paddingLeft: 16,
//     marginVertical: 5,
//   },
// });

// export default App;
