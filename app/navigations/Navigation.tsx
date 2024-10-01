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
  MachineGroupScreen,
  CheckListOptionScreen,
  CheckListScreen,
  MachineScreen,
  MatchCheckListOptionScreen,
  TestScreen,
  MatchFormMachineScreen,
  ChecklistGroupScreen,
  FormScreen,
  ExpectedResultScreen,
  Preview
} from "@/app/screens";
import AccessibleView from "@/components/AccessibleView";

import { Button } from "react-native-paper";
import { ThemeProvider, ToastProvider, ResponsiveProvider } from "@/app/contexts";

const Drawer = createDrawerNavigator();

const Navigation: React.FC = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return null;
  }
  console.log("createDrawerNavigator");

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
                  <TabBarIcon
                    name={user ? "home-outline" : "log-in"}
                    color={color}
                  />
                ),
              }}
            />
            {user && (
              <>
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
                    <Drawer.Screen
                      name="Macine_group"
                      component={MachineGroupScreen}
                      options={{
                        title: "Machine Group",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Machine"
                      component={MachineScreen}
                      options={{
                        title: "Machine",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Checklist"
                      component={CheckListScreen}
                      options={{
                        title: "Checklist",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Checklist_option"
                      component={CheckListOptionScreen}
                      options={{
                        title: "Checklist Option",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Checklist_group"
                      component={ChecklistGroupScreen}
                      options={{
                        title: "Checklist Group",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Match_checklist_option"
                      component={MatchCheckListOptionScreen}
                      options={{
                        title: "Match Checklist Option",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Match_form_machine"
                      component={MatchFormMachineScreen}
                      options={{
                        title: "Match Form Machine",
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
                    <Drawer.Screen
                      name="Macine_group"
                      component={MachineGroupScreen}
                      options={{
                        title: "Machine Group",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Machine"
                      component={MachineScreen}
                      options={{
                        title: "Machine",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Checklist"
                      component={CheckListScreen}
                      options={{
                        title: "Checklist",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Checklist_option"
                      component={CheckListOptionScreen}
                      options={{
                        title: "Checklist Option",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Checklist_group"
                      component={ChecklistGroupScreen}
                      options={{
                        title: "Checklist Group",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Match_checklist_option"
                      component={MatchCheckListOptionScreen}
                      options={{
                        title: "Match Checklist Option",
                        drawerIcon: ({ color }) => (
                          <TabBarIcon name="home" color={color} />
                        ),
                      }}
                    />
                    <Drawer.Screen
                      name="Match_form_machine"
                      component={MatchFormMachineScreen}
                      options={{
                        title: "Match Form Machine",
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
                  </>
                )}
                {role === "GeneralUser" && (
                  <>
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
                  </>
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
