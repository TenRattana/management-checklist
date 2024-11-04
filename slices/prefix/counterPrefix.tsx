import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppProps } from '@/typing/type'

const initialState: AppProps = {
    AppID: "",
    AppName: "",
    GroupMachine: "",
    Machine: "",
    CheckList: "",
    GroupCheckList: "",
    CheckListOption: "",
    MatchCheckListOption: "",
    MatchFormMachine: "",
    Form: "",
    SubForm: "",
    ExpectedResult: "",
    UsersPermission: ""
};

const prefixSlice = createSlice({
    name: "prefix",
    initialState,
    reducers: {
        setApp: (state, action: PayloadAction<{ App: AppProps }>) => {
            const { App } = action.payload

            state.AppID = App.AppID
            state.AppName = App.AppName
            state.GroupMachine = App.GroupMachine
            state.Machine = App.Machine
            state.CheckList = App.CheckList
            state.GroupCheckList = App.GroupCheckList
            state.CheckListOption = App.CheckListOption
            state.MatchCheckListOption = App.MatchCheckListOption
            state.MatchFormMachine = App.MatchCheckListOption
            state.Form = App.Form
            state.SubForm = App.SubForm
            state.ExpectedResult = App.ExpectedResult
            state.UsersPermission = App.UsersPermission
        },
        setAppName: (state, action: PayloadAction<{ AppName: string }>) => {
            const { AppName } = action.payload

            state.AppName = AppName;
        },
        setPrefixGroupMachine: (state, action: PayloadAction<{ GroupMachine: string }>) => {
            const { GroupMachine } = action.payload;

            state.GroupMachine = GroupMachine;
        },
        setPrefixMachine: (state, action: PayloadAction<{ Machine: string }>) => {
            const { Machine } = action.payload;

            state.Machine = Machine;
        },
        setPrefixCheckList: (state, action: PayloadAction<{ CheckList: string }>) => {
            const { CheckList } = action.payload;

            state.CheckList = CheckList;
        },
        setPrefixGroupCheckList: (state, action: PayloadAction<{ GroupCheckList: string }>) => {
            const { GroupCheckList } = action.payload;

            state.GroupCheckList = GroupCheckList;
        },
        setPrefixCheckListOption: (state, action: PayloadAction<{ CheckListOption: string }>) => {
            const { CheckListOption } = action.payload;

            state.CheckListOption = CheckListOption;
        },
        setPrefixMatchCheckListOption: (state, action: PayloadAction<{ MatchCheckListOption: string }>) => {
            const { MatchCheckListOption } = action.payload;

            state.MatchCheckListOption = MatchCheckListOption;
        },
        setPrefixMatchFormMachine: (state, action: PayloadAction<{ MatchFormMachine: string }>) => {
            const { MatchFormMachine } = action.payload;

            state.MatchFormMachine = MatchFormMachine;
        },
        setPrefixForm: (state, action: PayloadAction<{ Form: string }>) => {
            const { Form } = action.payload;

            state.Form = Form;
        },
        setPrefixSubForm: (state, action: PayloadAction<{ SubForm: string }>) => {
            const { SubForm } = action.payload;

            state.SubForm = SubForm;
        },
        setPrefixExpectedResult: (state, action: PayloadAction<{ ExpectedResult: string }>) => {
            const { ExpectedResult } = action.payload;

            state.ExpectedResult = ExpectedResult;
        },
        setPrefixUsersPermission: (state, action: PayloadAction<{ UsersPermission: string }>) => {
            const { UsersPermission } = action.payload;

            state.UsersPermission = UsersPermission;
        },
    },

});

export const {
    setApp,
    setAppName,
    setPrefixGroupMachine,
    setPrefixCheckList,
    setPrefixCheckListOption,
    setPrefixExpectedResult,
    setPrefixForm,
    setPrefixSubForm,
    setPrefixGroupCheckList,
    setPrefixMachine,
    setPrefixMatchCheckListOption,
    setPrefixMatchFormMachine,
    setPrefixUsersPermission
} = prefixSlice.actions;

export default prefixSlice.reducer;

