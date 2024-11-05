import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { string } from "yup";

const superAdminScreens = ["view_home", "view_login"]
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

const setScreen = (GUserName: string) => {
    const screenMapping: Record<string, string[]> = {
        SuperAdmin: ["Home", "Machine_group", "Machine", "Checklist", "Checklist_option", "Checklist_group", "Match_checklist_option", "Match_form_machine", "Create_form", "Expected_result", "Form", "User", "Preview", "Admin", "ScanQR", "GenerateQR", "InputFormMachine", "Setting", "Managepermissions", "SuperAdmin", "Permission_deny", "Config"],
        Admin: ["Home", "Machine_group", "Machine", "Checklist", "Checklist_option", "Checklist_group", "Match_checklist_option", "Match_form_machine", "Create_form", "Expected_result", "Form", "User", "Preview", "Admin", "ScanQR", "GenerateQR", "InputFormMachine", "Setting", "Permission_deny", "Config"],
        GeneralUser: ["Home", "ScanQR", "InputFormMachine", "Setting", "Permission_deny"]
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
