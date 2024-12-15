import axiosInstance from "@/config/axios";
import { Checklist, CheckListOption, CheckListType, DataType, GroupCheckListOption } from "@/typing/type";

export const saveCheckList = async (data: {
    Prefix: any;
    CListID: string;
    CListName: string;
    IsActive: boolean;
    Disables: boolean;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("CheckList_service.asmx/SaveCheckList", data);
    return response.data;
};

export const saveCheckListOption = async (data: {
    Prefix: any;
    CLOptionID: string;
    CLOptionName: string;
    IsActive: boolean;
    Disables: boolean;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("CheckListOption_service.asmx/SaveCheckListOption", data);
    return response.data;
};

export const saveGroupCheckListOption = async (data: {
    Prefix: any;
    PrefixMatch: any,
    GCLOptionID: string;
    GCLOptionName: string;
    IsActive: boolean;
    Disables: boolean;
    Options: string
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("GroupCheckListOption_service.asmx/SaveGroupCheckListAndOptionMatch", data);
    return response.data;
};

export const fetchCheckList = async (): Promise<Checklist[]> => {
    const response = await axiosInstance.post("CheckList_service.asmx/GetCheckLists");
    return response.data.data ?? [];
};

export const fetchGroupCheckList = async (): Promise<GroupCheckListOption[]> => {
    const response = await axiosInstance.post("GroupCheckListOption_service.asmx/GetGroupCheckListOptions");
    return response.data.data ?? [];
};

export const fetchCheckListType = async (): Promise<CheckListType[]> => {
    const response = await axiosInstance.post("CheckListType_service.asmx/GetCheckListTypes")
    return response.data.data ?? [];
};

export const fetchDataType = async (): Promise<DataType[]> => {
    const response = await axiosInstance.post("DataType_service.asmx/GetDataTypes");
    return response.data.data ?? [];
};

export const fetchTimeSchedules = async () => {
    const response = await axiosInstance.post("TimeSchedule_service.asmx/GetSchedules");
    return response.data.data ?? [];
};

export const fetchCheckListOption = async (): Promise<CheckListOption[]> => {
    const response = await axiosInstance.post("CheckListOption_service.asmx/GetCheckListOptions");
    return response.data.data ?? [];
};