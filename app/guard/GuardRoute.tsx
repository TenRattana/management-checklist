import React from 'react';
import { useSelector } from 'react-redux';
import PermissionDeny from '../screens/layouts/PermissionDeny';

const screens = [
    { name: "Home", route: 'screens/layouts/HomeScreen', permissions: ["view_home"] },
    { name: "Login", route: 'screens/layouts/LoginScreen', permissions: ["view_login"] },
    { name: "Machine_group", route: 'screens/layouts/machines/machine_group/MachineGroupScreen', permissions: ["view_machine_group"] },
    { name: "Machine", route: 'screens/layouts/machines/machine/MachineScreen', permissions: ["view_machine"] },
    { name: "Checklist", route: 'screens/layouts/checklists/checklist/CheckListScreen', permissions: ["view_checklist"] },
    { name: "Checklist_option", route: 'screens/layouts/checklists/checklist_option/CheckListOptionScreen', permissions: ["view_checklist_option"] },
    { name: "Checklist_group", route: 'screens/layouts/checklists/checklist_group/CheckListGroupScreen', permissions: ["view_checklist_group"] },
    { name: "Match_checklist_option", route: 'screens/layouts/matchs/match_checklist_option/MatchCheckListOptionScreen', permissions: ["view_match_checklist_option"] },
    { name: "Match_form_machine", route: 'screens/layouts/matchs/match_form_machine/MatchFormMachineScreen', permissions: ["view_match_form_machine"] },
    { name: "Create_form", route: 'screens/layouts/forms/create/CreateFormScreen', permissions: ["create_form"] },
    { name: "Expected_result", route: 'screens/layouts/transitions/expected_result/ExpectedResultScreen', permissions: ["view_expected_result"] },
    { name: "Form", route: 'screens/layouts/forms/form/FormScreen', permissions: ["view_form"] },
    { name: "Preview", route: 'screens/layouts/forms/view/Preview', permissions: ["view_preview"] },
    { name: "ScanQR", route: 'screens/layouts/actions/camera/ScanQR', permissions: ["view_scan_qr"] },
    { name: "GenerateQR", route: 'screens/layouts/actions/action/GenerateQR', permissions: ["generate_qr"] },
    { name: "InputFormMachine", route: 'screens/layouts/forms/scan/InputFormMachine', permissions: ["input_form_machine"] },
    { name: "Setting", route: 'screens/layouts/SettingScreen', permissions: ["manage_settings"] },
    { name: "Managepermissions", route: 'screen/SAdmin/Managepermissions', permissions: ["manage_permissions"] },
    { name: "Permission_deny", route: 'screens/layouts/PermiossionDeny', permissions: [] },
    { name: "Config", route: 'screens/layouts/Configulation', permissions: ["view_config"] },
];

interface RouteGuardProps {
    children: React.ReactNode;
    route?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, route }) => {
    const user = useSelector((state: any) => state.user);

    const hasPermission = route
        ? screens
            .find(screen => screen.route === route)
            ?.permissions.some(permission => user.permissions.includes(permission))
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
