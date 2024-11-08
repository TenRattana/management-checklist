import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const superAdmin = [
    "view_home", "view_login", "view_machine_group", "view_machine", "view_checklist"
    , "view_checklist_option", "view_checklist_group", "view_match_checklist_option", "view_match_form_machine", "create_form"
    , "view_expected_result", "view_form", "view_preview", "view_scan_qr", "generate_qr", "input_form_machine", "manage_settings"
    , "manage_permissions", "view_config", "view_approved"
]
const admin = [
    "view_home", "view_machine_group", "view_machine", "view_checklist"
    , "view_checklist_option", "view_checklist_group", "view_match_checklist_option", "view_match_form_machine", "create_form"
    , "view_expected_result", "view_form", "view_preview", "view_scan_qr", "generate_qr", "input_form_machine", "manage_settings"
    , "view_config", "view_approved"
]
const generalUser = ["view_home", "view_scan_qr", "input_form_machine", "manage_settings"]
const Head = ["view_home", "view_expected_result", "view_approved", "manage_settings"]

const getPermissionRole = (role: string) => {
    switch (role) {
        case 'SuperAdmin':
            return superAdmin;
        case 'Admin':
            return admin;
        case 'GeneralUser':
            return generalUser;
        case 'Head':
            return Head;
        default:
            return [];
    }
};

const setScreen = (GUserName: string) => {
    const screenMapping: Record<string, string[]> = {
        SuperAdmin: ["Home", "Machine_group", "Machine", "Checklist", "Checklist_option", "Checklist_group", "Match_checklist_option", "Match_form_machine", "Create_form", "Expected_result", "Approve", "Form", "User", "Preview", "Admin", "ScanQR", "GenerateQR", "InputFormMachine", "Setting", "Managepermissions", "SuperAdmin", "Test", "Permission_deny", "Config"],
        Admin: ["Home", "Machine_group", "Machine", "Checklist", "Checklist_option", "Checklist_group", "Match_checklist_option", "Match_form_machine", "Create_form", "Expected_result", "Approve", "Form", "User", "Preview", "Admin", "ScanQR", "GenerateQR", "InputFormMachine", "Setting", "Permission_deny", "Config"],
        GeneralUser: ["Home", "ScanQR", "InputFormMachine", "Approve", "Setting", "Permission_deny"],
        Head: ["Home", "Expected_result", "Approve", "Setting"]
    };

    const permittedScreens = screenMapping[GUserName] || [];
    return permittedScreens.map(name => ({ name }))

}
interface User {
    username: string;
    role: string;
    isAuthenticated: boolean;
    screen: { name: string }[],
    permissions: string[];
}

interface UserPayload {
    UserID: string;
    UserName: string;
    GUserID: string;
    GUserName: string;
    IsActive: boolean;
}

const initialState: User = {
    username: "",
    role: "",
    isAuthenticated: false,
    screen: [],
    permissions: []
};

const middlewareStore = createSlice({
    name: "middleware",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ user: UserPayload }>) => {
            const { user } = action.payload;
            state.username = user.UserName;
            state.role = user.GUserName;
            state.isAuthenticated = true;
            state.permissions = getPermissionRole(user.GUserName)
            state.screen = setScreen(user.GUserName)
        },
        logout: (state) => {
            state.username = "";
            state.role = "";
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, logout } = middlewareStore.actions;

export default middlewareStore.reducer;
