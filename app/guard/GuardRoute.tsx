import React from 'react';
import { useSelector } from 'react-redux';
import { Stack } from 'expo-router';
import { NotFoundScreen } from '@/components';

interface RouteGuardProps {
    children: React.ReactNode;
    permissions: string[];
    route: string;
    name: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, permissions, route, name }) => {
    const user = useSelector((state: any) => state.user);

    console.log("RouteGuard");

    const hasPermission = Array.isArray(user.permissions) &&
        permissions.some(permission => user.permissions.includes(permission));

    console.log(hasPermission);

    if (!user.isAuthenticated) {
        console.log("User not authenticated");
        return <NotFoundScreen navigation={navigation: NavigationProp<any></any>
    } />

}

if (!hasPermission) {
    console.log("User lacks permission");
    return <NotFoundScreen />
}

return <>{children}</>;
};

export default RouteGuard;
