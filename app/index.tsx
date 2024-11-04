import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { useSelector } from 'react-redux';
import RouteGuard from './guard/GuardRoute';
import CustomDrawerContent from '@/components/navigation/CustomDrawer';
import { useRes, useTheme } from '@/app/contexts';

const App = () => {
  const { theme } = useTheme();
  const user = useSelector((state: any) => state.user);
  const screens = user.screens || [];
  const { fontSize } = useRes();
  const prefix = useSelector((state: any) => state.prefix);

  const drawerWidth = fontSize === "small" ? 300 : fontSize === "medium" ? 350 : 400;

  return (
    <NavigationContainer independent={true}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerStyle: {
            backgroundColor: theme.colors.background,
            width: drawerWidth,
          },
          drawerHideStatusBarOnOpen: true,
        }}
      >
        {user.isAuthenticated ? (
          screens.map((screen: { name: string; route: string; permissions: string[] }) => {
            const hasPermission = Array.isArray(user.permissions) &&
              screen.permissions.some(permission => user.permissions.includes(permission));

            if (!hasPermission) {
              return null;
            }

            return (
              <RouteGuard key={screen.name} permissions={screen.permissions} route={screen.route} name={screen.name}>
                <Drawer.Screen
                  name={screen.route}
                  options={{
                    headerTitle: prefix.AppName || "",
                    drawerLabel: screen.name,
                  }}
                />
              </RouteGuard>
            );
          })
        ) : (
          <Drawer.Screen
            name="screens/layouts/NotFoundScreen"
            options={{
              drawerLabel: 'Permission Denied',
            }}
          />
        )}
      </Drawer>
    </NavigationContainer>
  );
};

export default App;
