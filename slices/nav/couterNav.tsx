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
    UserID: string;
    Full_Name: string;
    Position: string;
    DepartMent: string;
    GUserID: string;
    GUserName: string;
    IsAuthenticated: boolean;
    Screen: { name: string }[];
    Permissions: string[];
}

interface UserPayload {
    UserID: string;
    Full_Name: string;
    Position: string;
    DepartMent: string;
    GUserID: string;
    GUserName: string;
    IsActive: boolean;
}

const initialState: User = {
    UserID: "",
    Full_Name: "",
    Position: "",
    DepartMent: "",
    GUserID: "",
    GUserName: "",
    IsAuthenticated: false,
    Screen: [],
    Permissions: []
};

const middlewareStore = createSlice({
    name: "middleware",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ user: UserPayload }>) => {
            const { user } = action.payload;

            state.UserID = user.UserID;
            state.Full_Name = user.Full_Name;
            state.Position = user.Position;
            state.DepartMent = user.DepartMent;
            state.GUserID = user.GUserID;
            state.GUserName = user.GUserName;
            state.IsAuthenticated = true;
        },
        logout: (state) => {
            state.UserID = ""
            state.Full_Name = ""
            state.Position = ""
            state.DepartMent = ""
            state.GUserID = ""
            state.GUserName = ""
            state.IsAuthenticated = false;
            state.Screen = []
            state.Permissions = []
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenu.pending, (state) => {
                state.Screen = [];
                state.Permissions = [];
            })
            .addCase(fetchMenu.fulfilled, (state, action) => {
                state.Screen = action.payload;
                state.Permissions = action.payload.map((menu: Menu) => menu.MenuPermission);
            })
            .addCase(fetchMenu.rejected, (state) => {
                state.Screen = [];
                state.Permissions = [];
            });
    }
});

export const { setUser, logout } = middlewareStore.actions;

export default middlewareStore.reducer;
