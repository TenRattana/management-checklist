import React from 'react';
import { useSelector } from 'react-redux';
import PermissionDeny from '../screens/layouts/PermissionDeny';
import { useAuth } from '../contexts';

interface RouteGuardProps {
    children: React.ReactNode;
    permissions: string[];
    route: string;
    name: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, permissions }) => {
    const user = useSelector((state: any) => state.user);
    console.log("RouteGuard");
    console.log("User permissions:", user.permissions);
    console.log("Required permissions:", permissions);
    
    const hasPermission = Array.isArray(user.permissions) &&  permissions.every(permission => user.permissions.includes(permission));

    if (!user.isAuthenticated) {
        console.log("User not authenticated");
        return <PermissionDeny />;
    }

    if (!hasPermission) {
        console.log("User lacks permission");
        return <PermissionDeny />;
    }

    return children;
};


export default RouteGuard;
