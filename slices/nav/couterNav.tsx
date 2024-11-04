import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const Screen = [
    { name: "Home", route: "screens/layouts/HomeScreen", permissions: ["view_home"] },
    { name: "Login", route: "screens/layouts/LoginScreen", permissions: ["view_login"] },
    // { name: "Machine_group", permissions: ["view_machine_group"] },
    // { name: "Machine", permissions: ["view_machine"] },
    // { name: "Checklist", permissions: ["view_checklist"] },
    // { name: "Checklist_option", permissions: ["view_checklist_option"] },
    // { name: "Checklist_group", permissions: ["view_checklist_group"] },
    // { name: "Match_checklist_option", permissions: ["view_match_checklist_option"] },
    // { name: "Match_form_machine", permissions: ["view_match_form_machine"] },
    // { name: "Create_form", permissions: ["create_form"] },
    // { name: "Expected_result", permissions: ["view_expected_result"] },
    // { name: "Form", permissions: ["view_form"] },
    // { name: "Preview", permissions: ["view_preview"] },
    // { name: "ScanQR", permissions: ["view_scan_qr"] },
    // { name: "GenerateQR", permissions: ["generate_qr"] },
    // { name: "InputFormMachine", permissions: ["input_form_machine"] },
    // { name: "Setting", permissions: ["manage_settings"] },
    // { name: "Managepermissions", permissions: ["manage_permissions"] },
    // { name: "Permission_deny", permissions: [] },
    // { name: "Config", permissions: ["view_config"] }
];

const superAdminScreens = ["view_hom ,view_login"]
const adminScreens = ["view_home"]
const generalUserScreens = ["view_home"]

const getPermissionRole = (role: string) => {
    switch (role) {
        case 'SuperAdmin':
            return superAdminScreens;
        case 'Admin':
            return adminScreens;
        case 'GeneralUser':
            return generalUserScreens;
        default:
            return [];
    }
};


interface User {
    username: string;
    role: string;
    isAuthenticated: boolean;
    screens: { name: string; route: string; permissions: string[] }[];
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
    screens: [],
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
            state.screens = Screen;
            state.permissions = getPermissionRole(user.GUserName)
        },
        logout: (state) => {
            state.username = "";
            state.role = "";
            state.isAuthenticated = false;
            state.screens = [];
        },
    },
});

export const { setUser, logout } = middlewareStore.actions;

export default middlewareStore.reducer;
