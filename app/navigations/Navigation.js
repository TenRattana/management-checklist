import React, { useEffect } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useAuth } from "@/app/contexts/auth";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import {
  HomeScreen,
  LoginScreen,
  AdminScreen,
  GuestScreen,
  UserScreen,
} from "@/app/screens";
import { View } from "react-native";
import { Button } from "react-native-paper";
import { ResponsiveProvider } from "@/app/contexts/responsive";
import { ThemeProvider } from "@/app/contexts/theme";
import { ToastProvider } from "@/app/contexts/toastify";

const Drawer = createDrawerNavigator();

export default function Navigation() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <ResponsiveProvider>
      <ThemeProvider>
        <ToastProvider>
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
                {role === "admin" && (
                  <Drawer.Screen
                    name="Admin"
                    component={AdminScreen}
                    options={{
                      title: "Admin",
                      drawerIcon: ({ color }) => (
                        <TabBarIcon name="home" color={color} />
                      ),
                    }}
                  />
                )}
                {role === "user" && (
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
                {role === "guest" && (
                  <Drawer.Screen
                    name="Guest"
                    component={GuestScreen}
                    options={{
                      title: "Guest",
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
        </ToastProvider>
      </ThemeProvider>
    </ResponsiveProvider>
  );
}

function LogoutScreen() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button mode="contained" disabled>
        Logging out...
      </Button>
    </View>
  );
}
