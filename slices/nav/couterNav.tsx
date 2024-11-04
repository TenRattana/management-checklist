import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const superAdminScreens = ["view_home" ,"view_login"]
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
