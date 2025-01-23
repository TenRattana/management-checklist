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
    UsersPermission: "",
    TimeSchedule: "",

    PF_CheckList: "",
    PF_CheckListOption: "",
    PF_ExpectedResult: "",
    PF_Form: "",
    PF_GroupCheckList: "",
    PF_GroupMachine: "",
    PF_Machine: "",
    PF_MatchCheckListOption: "",
    PF_MatchFormMachine: "",
    PF_SubForm: "",
    PF_TimeSchedule: "",
    PF_UsersPermission: "",
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
            state.MatchFormMachine = App.MatchFormMachine
            state.Form = App.Form
            state.SubForm = App.SubForm
            state.ExpectedResult = App.ExpectedResult
            state.UsersPermission = App.UsersPermission
            state.TimeSchedule = App.TimeSchedule

            state.PF_GroupMachine = App.PF_GroupMachine
            state.PF_Machine = App.PF_Machine
            state.PF_CheckList = App.PF_CheckList
            state.PF_GroupCheckList = App.PF_GroupCheckList
            state.PF_CheckListOption = App.PF_CheckListOption
            state.PF_MatchCheckListOption = App.PF_MatchCheckListOption
            state.PF_MatchFormMachine = App.PF_MatchFormMachine
            state.PF_Form = App.PF_Form
            state.PF_SubForm = App.PF_SubForm
            state.PF_ExpectedResult = App.PF_ExpectedResult
            state.PF_UsersPermission = App.PF_UsersPermission
            state.PF_TimeSchedule = App.PF_TimeSchedule
        },
        setAppName: (state, action: PayloadAction<{ AppName: string }>) => {
            const { AppName } = action.payload

            state.AppName = AppName;
        },
        setPrefixGroupMachine: (state, action: PayloadAction<{ PF_GroupMachine: string }>) => {
            const { PF_GroupMachine } = action.payload;

            state.PF_GroupMachine = PF_GroupMachine;
        },
        setPrefixMachine: (state, action: PayloadAction<{ PF_Machine: string }>) => {
            const { PF_Machine } = action.payload;

            state.PF_Machine = PF_Machine;
        },
        setPrefixCheckList: (state, action: PayloadAction<{ PF_CheckList: string }>) => {
            const { PF_CheckList } = action.payload;

            state.PF_CheckList = PF_CheckList;
        },
        setPrefixGroupCheckList: (state, action: PayloadAction<{ PF_GroupCheckList: string }>) => {
            const { PF_GroupCheckList } = action.payload;

            state.PF_GroupCheckList = PF_GroupCheckList;
        },
        setPrefixCheckListOption: (state, action: PayloadAction<{ PF_CheckListOption: string }>) => {
            const { PF_CheckListOption } = action.payload;

            state.PF_CheckListOption = PF_CheckListOption;
        },
        setPrefixMatchCheckListOption: (state, action: PayloadAction<{ PF_MatchCheckListOption: string }>) => {
            const { PF_MatchCheckListOption } = action.payload;

            state.PF_MatchCheckListOption = PF_MatchCheckListOption;
        },
        setPrefixMatchFormMachine: (state, action: PayloadAction<{ PF_MatchFormMachine: string }>) => {
            const { PF_MatchFormMachine } = action.payload;

            state.PF_MatchFormMachine = PF_MatchFormMachine;
        },
        setPrefixForm: (state, action: PayloadAction<{ PF_Form: string }>) => {
            const { PF_Form } = action.payload;

            state.PF_Form = PF_Form;
        },
        setPrefixSubForm: (state, action: PayloadAction<{ PF_SubForm: string }>) => {
            const { PF_SubForm } = action.payload;

            state.PF_SubForm = PF_SubForm;
        },
        setPrefixExpectedResult: (state, action: PayloadAction<{ PF_ExpectedResult: string }>) => {
            const { PF_ExpectedResult } = action.payload;

            state.PF_ExpectedResult = PF_ExpectedResult;
        },
        setPrefixUsersPermission: (state, action: PayloadAction<{ PF_UsersPermission: string }>) => {
            const { PF_UsersPermission } = action.payload;

            state.PF_UsersPermission = PF_UsersPermission;
        },
        setPrefixTimeSchedule: (state, action: PayloadAction<{ PF_TimeSchedule: string }>) => {
            const { PF_TimeSchedule } = action.payload;

            state.PF_TimeSchedule = PF_TimeSchedule;
        },

        setGroupMachine: (state, action: PayloadAction<{ GroupMachine: string }>) => {
            const { GroupMachine } = action.payload;

            state.GroupMachine = GroupMachine;
        },
        setMachine: (state, action: PayloadAction<{ Machine: string }>) => {
            const { Machine } = action.payload;

            state.Machine = Machine;
        },
        setCheckList: (state, action: PayloadAction<{ CheckList: string }>) => {
            const { CheckList } = action.payload;

            state.CheckList = CheckList;
        },
        setGroupCheckList: (state, action: PayloadAction<{ GroupCheckList: string }>) => {
            const { GroupCheckList } = action.payload;

            state.GroupCheckList = GroupCheckList;
        },
        setCheckListOption: (state, action: PayloadAction<{ CheckListOption: string }>) => {
            const { CheckListOption } = action.payload;

            state.CheckListOption = CheckListOption;
        },
        setMatchCheckListOption: (state, action: PayloadAction<{ MatchCheckListOption: string }>) => {
            const { MatchCheckListOption } = action.payload;

            state.MatchCheckListOption = MatchCheckListOption;
        },
        setMatchFormMachine: (state, action: PayloadAction<{ MatchFormMachine: string }>) => {
            const { MatchFormMachine } = action.payload;

            state.MatchFormMachine = MatchFormMachine;
        },
        setForm: (state, action: PayloadAction<{ Form: string }>) => {
            const { Form } = action.payload;

            state.Form = Form;
        },
        setSubForm: (state, action: PayloadAction<{ SubForm: string }>) => {
            const { SubForm } = action.payload;

            state.SubForm = SubForm;
        },
        setExpectedResult: (state, action: PayloadAction<{ ExpectedResult: string }>) => {
            const { ExpectedResult } = action.payload;

            state.ExpectedResult = ExpectedResult;
        },
        setUsersPermission: (state, action: PayloadAction<{ UsersPermission: string }>) => {
            const { UsersPermission } = action.payload;

            state.UsersPermission = UsersPermission;
        },
        setTimeSchedule: (state, action: PayloadAction<{ TimeSchedule: string }>) => {
            const { TimeSchedule } = action.payload;

            state.TimeSchedule = TimeSchedule;
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
    setPrefixUsersPermission,
    setPrefixTimeSchedule,


    setGroupMachine,
    setCheckList,
    setCheckListOption,
    setExpectedResult,
    setForm,
    setSubForm,
    setGroupCheckList,
    setMachine,
    setMatchCheckListOption,
    setMatchFormMachine,
    setUsersPermission,
    setTimeSchedule
} = prefixSlice.actions;

export default prefixSlice.reducer;

