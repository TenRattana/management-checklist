import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const screenMapping: Record<string, { name: string }[]> = {
    SuperAdmin: [
        { name: "Home" },
        { name: "Machine_group" },
        // { name: "Machine" },
        { name: "Checklist" },
        { name: "Checklist_option" },
        { name: "Checklist_group" },
        { name: "Match_checklist_option" },
        { name: "Match_form_machine" },
        { name: "Create_form" },
        { name: "Expected_result" },
        { name: "Form" },
        // { name: "User" },
        { name: "Preview" },
        // { name: "Admin" },
        { name: "ScanQR" },
        { name: "GenerateQR" },
        { name: "InputFormMachine" },
        { name: "Setting" },
        { name: "Managepermissions" },
        // { name: "SuperAdmin" },
        { name: "Permission_deny" },
        { name: "Config" }
    ],
    Admin: [
        { name: "Home" },
        { name: "Machine_group" },
        { name: "Machine" },
        { name: "Checklist" },
        { name: "Checklist_option" },
        { name: "Checklist_group" },
        { name: "Match_checklist_option" },
        { name: "Match_form_machine" },
        { name: "Create_form" },
        { name: "Expected_result" },
        { name: "Form" },
        // { name: "User" },
        { name: "Preview" },
        // { name: "Admin" },
        { name: "ScanQR" },
        { name: "GenerateQR" },
        { name: "InputFormMachine" },
        { name: "Setting" },
        { name: "Permission_deny" },
        { name: "Config" }
    ],
    GeneralUser: [
        { name: "Home" },
        { name: "ScanQR" },
        { name: "InputFormMachine" },
        { name: "Setting" },
        { name: "Permission_deny" }
    ]
};

interface User {
    username: string,
    role: string;
    isAuthenticated: boolean;
    screens: Array<{ name: string }>
}

const initialState: User = {
    username: "",
    role: "",
    isAuthenticated: false,
    screens: []
};

const middlewareStore = createSlice({
    name: "middleware",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ user: { UserID: string; UserName: string; GUserID: string; GUserName: string; IsActive: boolean } }>) => {
            const { user } = action.payload;

            state.username = user.UserName;
            state.role = user.GUserName;
            state.isAuthenticated = true;
            state.screens = screenMapping[user.GUserName] || [{ name: "Permission_deny" }];
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
