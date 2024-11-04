// import React, { useEffect } from 'react';
// import { ActivityIndicator } from 'react-native';
// import { Drawer } from 'expo-router/drawer';
// import CustomDrawerContent from '@/components/navigation/CustomDrawer';
// import { useSelector } from "react-redux";
// import { useAuth, useRes, useTheme } from '@/app/contexts';
// import RouteGuard from '@/app/guard/GuardRoute';

// const Navigation: React.FC = () => {
//   const prefix = useSelector((state: any) => state.prefix);
//   const user = useSelector((state: any) => state.user);
//   const screens = user.screens;
//   const { loading } = useAuth();
//   const { fontSize } = useRes();
//   const { theme } = useTheme();

//   const drawerWidth = fontSize === "small" ? 300 : fontSize === "medium" ? 350 : 400;

//   if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

//   return (
//     <Drawer
//       drawerContent={(props) => <CustomDrawerContent {...props} />}
//       screenOptions={{
//         drawerStyle: {
//           backgroundColor: theme.colors.background,
//           width: drawerWidth,
//         },
//         drawerHideStatusBarOnOpen: true,
//       }}
//     >
//       {user.isAuthenticated && screens.length > 0 ? (
//         screens.map((screen: { name: string; route: string; permissions: string[] }) => (
//           <RouteGuard key={screen.name} permissions={screen.permissions}>
//             <Drawer.Screen
//               name={screen.name}
//               options={{
//                 headerTitle: prefix.AppName || "",
//                 drawerLabel: screen.name,
//               }}
//             />
//           </RouteGuard>
//         ))
//       ) : (
//         <Drawer.Screen
//           name="Permission_deny"
//           options={{
//             drawerLabel: 'Permission Denied',
//           }}
//         />
//       )}
//     </Drawer>
//   );
// };

// export default Navigation;
