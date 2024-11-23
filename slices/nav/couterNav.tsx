import axiosInstance from "@/config/axios";
import { Permissions } from "@/typing/type";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchMenu = createAsyncThunk(
    "user/fetchMenu",
    async (data: string) => {
        const response = await axiosInstance.post('Menu_service.asmx/GetMenus', { GUserID: data });
        return response.data.data ?? [];
    }
);

export const fetchPermission = createAsyncThunk(
    "user/fetchPermission",
    async (data: string) => {
        const response = await axiosInstance.post('Menu_service.asmx/GetPermissions', { GUserID: data });
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
    initialRoute?: string;
}

export interface UserPayload {
    UserID: string;
    Full_Name: string;
    Position: string;
    DepartMent: string;
    GUserID: string;
    GUserName: string;
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
    Permissions: [],
    initialRoute: ""
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
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenu.pending, (state) => {
                state.Screen = [];
            })
            .addCase(fetchMenu.fulfilled, (state, action) => {
                state.Screen = action.payload;
            })
            .addCase(fetchMenu.rejected, (state) => {
                state.Screen = [];
            })
            .addCase(fetchPermission.pending, (state) => {
                state.Permissions = [];
            })
            .addCase(fetchPermission.fulfilled, (state, action) => {
                state.Permissions = action.payload.map((permisson: Permissions) => permisson.PermissionName);
                state.initialRoute = "Home"
            })
            .addCase(fetchPermission.rejected, (state) => {
                state.Permissions = [];
            });
    }
});

export const { setUser, logout } = middlewareStore.actions;

export default middlewareStore.reducer;
