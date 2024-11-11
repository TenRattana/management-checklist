import axiosInstance from "@/config/axios";
import { Menu } from "@/typing/type";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchMenu = createAsyncThunk(
    "user",
    async (data: string) => {
        const response = await axiosInstance.post('Menu_service.asmx/GetMenus', { GUserID: data });
        return response.data.data ?? [];
    }
);

interface User {
    username: string;
    role: string;
    roleID: string;
    isAuthenticated: boolean;
    screen: { name: string }[];
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
    roleID: "",
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
            state.roleID = user.GUserID;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.username = "";
            state.role = "";
            state.roleID = "";
            state.isAuthenticated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenu.pending, (state) => {
                state.screen = [];
                state.permissions = [];
            })
            .addCase(fetchMenu.fulfilled, (state, action) => {
                state.screen = action.payload;
                state.permissions = action.payload.map((menu: Menu) => menu.MenuPermission);
            })
            .addCase(fetchMenu.rejected, (state) => {
                state.screen = [];
                state.permissions = [];
            });
    }
});

export const { setUser, logout } = middlewareStore.actions;

export default middlewareStore.reducer;
