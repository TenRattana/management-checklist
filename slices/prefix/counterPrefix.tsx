import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppProps } from '@/typing/type'

const initialState: AppProps = {
    AppName: "Default Name",
    GroupMachine: "GM",
    Location: "L",
    Machine: "M",
    CheckList: "CL",
    GroupCheckList: "GCL",
    CheckListOption: "CLO",
    MatchCheckListOption: "MCLO",
    MatchFormMachine: "MFM",
    Form: "F",
    SubForm: "SF",
    ExpectedResult: "ER",
    UsersPermission: "U"
};

const prefixSlice = createSlice({
    name: "prefix",
    initialState,
    reducers: {
        setAppName: (state, action: PayloadAction<{ AppName?: string }>) => {
            const { AppName } = action.payload

            state.AppName = AppName || "";
        },
        setPrefixGroupMachine: (state, action: PayloadAction<{ GroupMachine?: string }>) => {
            const { GroupMachine } = action.payload;

            state.GroupMachine = GroupMachine || "";
        },
        setPrefixMachine: (state, action: PayloadAction<{ Machine?: string }>) => {
            const { Machine } = action.payload;

            state.Machine = Machine || "";
        },
        setPrefixLocation: (state, action: PayloadAction<{ Location?: string }>) => {
            const { Location } = action.payload;

            state.Location = Location || "";
        },
        setPrefixCheckList: (state, action: PayloadAction<{ CheckList?: string }>) => {
            const { CheckList } = action.payload;

            state.CheckList = CheckList || "";
        },
        setPrefixGroupCheckList: (state, action: PayloadAction<{ GroupCheckList?: string }>) => {
            const { GroupCheckList } = action.payload;

            state.GroupCheckList = GroupCheckList || "";
        },
        setPrefixCheckListOption: (state, action: PayloadAction<{ CheckListOption?: string }>) => {
            const { CheckListOption } = action.payload;

            state.CheckListOption = CheckListOption || "";
        },
        setPrefixMatchCheckListOption: (state, action: PayloadAction<{ MatchCheckListOption?: string }>) => {
            const { MatchCheckListOption } = action.payload;

            state.MatchCheckListOption = MatchCheckListOption || "";
        },
        setPrefixMatchFormMachine: (state, action: PayloadAction<{ MatchFormMachine?: string }>) => {
            const { MatchFormMachine } = action.payload;

            state.MatchFormMachine = MatchFormMachine || "";
        },
        setPrefixForm: (state, action: PayloadAction<{ Form?: string }>) => {
            const { Form } = action.payload;

            state.Form = Form || "";
        },
        setPrefixSubForm: (state, action: PayloadAction<{ SubForm?: string }>) => {
            const { SubForm } = action.payload;

            state.SubForm = SubForm || "";
        },
        setPrefixExpectedResult: (state, action: PayloadAction<{ ExpectedResult?: string }>) => {
            const { ExpectedResult } = action.payload;

            state.ExpectedResult = ExpectedResult || "";
        },
        setPrefixUsersPermission: (state, action: PayloadAction<{ UsersPermission?: string }>) => {
            const { UsersPermission } = action.payload;

            state.UsersPermission = UsersPermission || "";
        },
    },

});

export const {
    setAppName,
    setPrefixGroupMachine,
    setPrefixCheckList,
    setPrefixCheckListOption,
    setPrefixExpectedResult,
    setPrefixForm,
    setPrefixSubForm,
    setPrefixGroupCheckList,
    setPrefixLocation,
    setPrefixMachine,
    setPrefixMatchCheckListOption,
    setPrefixMatchFormMachine,
    setPrefixUsersPermission
} = prefixSlice.actions;

export default prefixSlice.reducer;

