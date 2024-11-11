import React from 'react';
import { useSelector } from 'react-redux';
import PermissionDeny from '../screens/layouts/PermissionDeny';
import { Menu } from '@/typing/type';

interface RouteGuardProps {
    children: React.ReactNode;
    route?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, route }) => {
    const user = useSelector((state: any) => state.user);

    const hasPermission = route
        ? user.screen
            .find((screen: Menu) => screen.Path === route)
            ?.MenuPermission &&
        user.permissions.includes(user.screen.find((screen: Menu) => screen.Path === route)?.MenuPermission)
        : false;

    if (!user.isAuthenticated) {
        return <PermissionDeny />;
    }

    if (!hasPermission) {
        return <PermissionDeny />;
    }

    return <>{children}</>;
};

export default RouteGuard;
