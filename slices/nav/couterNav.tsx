import axiosInstance from "@/config/axios";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchMenu = createAsyncThunk(
    "user/fetchMenu",
    async (GUserID: string) => {
        console.log(GUserID);

        const response = await axiosInstance.get("GetMenus", {
            params: {
                GUserID
            }
        });
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
    loadgin: boolean;
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
    initialRoute: "",
    loadgin: false
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
                state.loadgin = true
            })
            .addCase(fetchMenu.rejected, (state) => {
                state.Screen = [];
            })
    }
});

export const { setUser, logout } = middlewareStore.actions;

export default middlewareStore.reducer;
