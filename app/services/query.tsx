import axiosInstance from "@/config/axios";
import { AppProps, DataType, GroupUsers, TimeScheduleMachine, Users, UsersPermission } from "@/typing/type";
import { Machine } from "@/typing/screens/Machine";
import { GroupMachine } from "@/typing/screens/GroupMachine";
import { GroupCheckListOption } from "@/typing/screens/GroupCheckList";
import { CheckListOption } from "@/typing/screens/CheckListOption";
import { MatchCheckListOption } from "@/typing/screens/MatchCheckListOption";
import { MatchForm } from "@/typing/screens/MatchFormMachine";
import { Form } from "@/typing/screens/Form";
import { ExpectedResult } from "@/typing/screens/ExpectedResult";
import { CheckList, GroupCheckListType } from "@/typing/screens/CheckList";
import { TimeScemaScheduleProps } from "@/typing/screens/TimeSchedule";
import { convertToDateTime, convertToThaiDateTime } from "@/components/screens/Schedule";
import { getCurrentTime } from "@/config/timezoneUtils";

// App Config S
export const fetchAppConfig = async (): Promise<AppProps> => {
    const response = await axiosInstance.post('AppConfig/GetAppConfigs');
    return response.data.data[0] ?? [];
};

// Check List Type
export const fetchCheckListType = async (): Promise<GroupCheckListType[]> => {
    const response = await axiosInstance.post("CheckListType/GetCheckListTypes")
    return response.data.data ?? [];
};

// Data Type
export const fetchDataType = async (): Promise<DataType[]> => {
    const response = await axiosInstance.post("DataType/GetDataTypes");
    return response.data.data ?? [];
};

// Time Schedule
export const fetchTimeSchedules = async (): Promise<TimeScemaScheduleProps[]> => {
    try {
        const response = await axiosInstance.post("TimeSchedule/GetSchedules");
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchSearchTimeSchedules = async (
    debouncedSearchQuery: string
): Promise<TimeScemaScheduleProps[]> => {
    try {
        const response = await axiosInstance.post("TimeSchedule/SearchTimeSchedule", {
            Messages: debouncedSearchQuery
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
}

export const fetchTimeMachines = async (data: { ScheduleID: string }): Promise<TimeScheduleMachine[]> => {
    const response = await axiosInstance.post("TimeSchedule/GetScheduleMachine", data);
    return response.data.data ?? [];
};

export const saveTimeSchedule = async (data: { Prefix: any; Schedule: string; }): Promise<{ message: string }> => {
    const response = await axiosInstance.post("TimeSchedule/SaveSchedule", data);
    return response.data;
};
// Machine
export const fetchMachines = async (
    currentPage: number,
    pageSize: number,
): Promise<Machine[]> => {
    try {
        const response = await axiosInstance.post("Machine/GetMachines", {
            page: currentPage,
            pageSize: pageSize,
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch ');
    }
};

export const fetchSearchMachines = async (
    debouncedSearchQuery: string
): Promise<Machine[]> => {
    try {
        const response = await axiosInstance.post("Machine/SearchMachines", {
            Messages: debouncedSearchQuery
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
}

export const saveMachine = async (data: {
    Prefix: any;
    MachineID: string;
    GMachineID: string;
    MachineCode: string;
    Building: string | null;
    Floor: string | null;
    Area: string | null;
    MachineName: string;
    Description: string;
    IsActive: boolean;
    Disables: boolean;
    FormID: string | null;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("Machine/SaveMachine", data);
    return response.data;
};

// Group Machine
export const fetchMachineGroups = async (
    currentPage: number,
    pageSize: number,
): Promise<GroupMachine[]> => {
    try {
        const response = await axiosInstance.post("GroupMachine/GetGroupMachines", {
            page: currentPage,
            pageSize: pageSize,
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchSearchMachineGroups = async (
    debouncedSearchQuery: string
): Promise<GroupMachine[]> => {
    try {
        const response = await axiosInstance.post("GroupMachine/SearchGroupMachines", {
            Messages: debouncedSearchQuery
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
}

export const saveGroupMachine = async (data: {
    Prefix: any;
    GMachineID: string;
    GMachineName: string;
    Description: string;
    IsActive: boolean;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("GroupMachine/SaveGroupMachine", data);
    return response.data;
};

// Check List
export const fetchCheckList = async (
    currentPage: number,
    pageSize: number,
): Promise<CheckList[]> => {
    try {
        const response = await axiosInstance.post("CheckList/GetCheckLists", {
            page: currentPage,
            pageSize: pageSize,
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchSearchCheckList = async (
    debouncedSearchQuery: string
): Promise<CheckList[]> => {
    try {
        const response = await axiosInstance.post("CheckList/SearchCheckLists", {
            Messages: debouncedSearchQuery
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
}

export const saveCheckList = async (data: {
    Prefix: any;
    CListID: string;
    CListName: string;
    IsActive: boolean;
    Disables: boolean;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("CheckList/SaveCheckList", data);
    return response.data;
};

// Check List Option
export const fetchCheckListOption = async (
    currentPage: number,
    pageSize: number,
): Promise<CheckListOption[]> => {
    try {
        const response = await axiosInstance.post("CheckListOption/GetCheckListOptions", {
            page: currentPage,
            pageSize: pageSize,
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchSearchCheckListOption = async (
    debouncedSearchQuery: string
): Promise<CheckListOption[]> => {
    try {
        const response = await axiosInstance.post("CheckListOption/SearchCheckListOptions", {
            Messages: debouncedSearchQuery
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
}

export const saveCheckListOption = async (data: {
    Prefix: any;
    CLOptionID: string;
    CLOptionName: string;
    IsActive: boolean;
    Disables: boolean;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("CheckListOption/SaveCheckListOption", data);
    return response.data;
};

// Group Check List 
export const fetchGroupCheckListOption = async (
    currentPage: number,
    pageSize: number,
): Promise<GroupCheckListOption[]> => {
    try {
        const response = await axiosInstance.post("GroupCheckListOption/GetGroupCheckListOptions", {
            page: currentPage,
            pageSize: pageSize,
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchSearchGroupCheckListOption = async (
    debouncedSearchQuery: string
): Promise<GroupCheckListOption[]> => {
    try {
        const response = await axiosInstance.post("GroupCheckListOption/SearchGroupCheckListOptions", {
            Messages: debouncedSearchQuery
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
}

export const saveGroupCheckListNoOption = async (data: {
    Prefix: any;
    GCLOptionID: string;
    GCLOptionName: string;
    IsActive: boolean;
    Disables: boolean;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("GroupCheckListOption/SaveGroupCheckListOption", data);
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
    const response = await axiosInstance.post("GroupCheckListOption/SaveGroupCheckListAndOptionMatch", data);
    return response.data;
};

export const fetchGroupCheckList = async (
    currentPage: number,
    pageSize: number,
): Promise<GroupCheckListOption[]> => {
    try {
        const response = await axiosInstance.post("GroupCheckListOption/GetGroupCheckListOptions", {
            page: currentPage,
            pageSize: pageSize,
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

// Match Check List Option
export const fetchMatchCheckListOptions = async (
    currentPage: number,
    pageSize: number,
): Promise<MatchCheckListOption[]> => {
    try {
        const response = await axiosInstance.post("MatchCheckListOption/GetMatchCheckListOptions", {
            page: currentPage,
            pageSize: pageSize,
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchSearchMatchCheckListOptions = async (
    debouncedSearchQuery: string
): Promise<MatchCheckListOption[]> => {
    try {
        const response = await axiosInstance.post("MatchCheckListOption/SearchMatchCheckListOptions", {
            Messages: debouncedSearchQuery
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
}

export const saveMatchCheckListOptions = async (
    data: {
        Prefix: string;
        MCLOptionID: string;
        GCLOptionID: string;
        CLOptionID: string;
        IsActive: boolean;
        Disables: boolean;
    }): Promise<{ message: string }> => {
    const response = await axiosInstance.post("MatchCheckListOption/SaveMatchCheckListOption", data);
    return response.data;
};

// Forms
export const fetchForms = async (
    currentPage: number,
    pageSize: number,
): Promise<Form[]> => {
    try {
        const response = await axiosInstance.post("Form/GetForms", {
            page: currentPage,
            pageSize: pageSize,
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchSearchFomrs = async (
    debouncedSearchQuery: string
): Promise<Form[]> => {
    try {
        const response = await axiosInstance.post("Form/SearchFomrs", {
            Messages: debouncedSearchQuery
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
}

// Expected Result 
export const fetchExpectedResults = async (
    currentPage: number,
    pageSize: number,
): Promise<ExpectedResult[]> => {
    try {
        const response = await axiosInstance.post("ExpectedResult/GetExpectedResults", {
            page: currentPage,
            pageSize: pageSize,
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchExpectedResultsWithTime = async (
    StartTime: string,
): Promise<ExpectedResult[]> => {
    try {
        const start = StartTime && convertToDateTime(StartTime)
        const end = convertToDateTime(convertToThaiDateTime(new Date(getCurrentTime()).toISOString(), undefined, true))

        const response = await axiosInstance.post("ExpectedResult/GetExpectedResultsWithTime", {
            StartTime: start,
            EndTime: end
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchSearchExpectedResult = async (
    debouncedSearchQuery: string
): Promise<ExpectedResult[]> => {
    try {
        const response = await axiosInstance.post("ExpectedResult/SearchExpectedResults", {
            Messages: debouncedSearchQuery
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
}

// Approved
export const fetchApproved = async (
    currentPage: number,
    pageSize: number,
): Promise<ExpectedResult[]> => {
    try {
        const response = await axiosInstance.post("ExpectedResult/GetApproveds", {
            page: currentPage,
            pageSize: pageSize,
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchApprovedWithTime = async (
    StartTime: string,
): Promise<ExpectedResult[]> => {
    try {
        const start = StartTime && convertToDateTime(StartTime)
        const end = convertToDateTime(convertToThaiDateTime(new Date(getCurrentTime()).toISOString(), undefined, true))

        const response = await axiosInstance.post("ExpectedResult/GetApproveWithTime", {
            StartTime: start,
            EndTime: end
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchSearchApproved = async (
    debouncedSearchQuery: string
): Promise<ExpectedResult[]> => {
    try {
        const response = await axiosInstance.post("ExpectedResult/SearchApproveds", {
            Messages: debouncedSearchQuery
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
}

export const SaveApproved = async (data: {
    TableID: string[], UserData: {
        UserID: any;
        UserName: any;
        GUserID: any;
    }
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("ExpectedResult/SaveApproved", { TableID: JSON.stringify(data.TableID), UserInfo: JSON.stringify(data.UserData) });
    return response.data;
};

// Match Form Machine
export const fetchMatchFormMchines = async (
    currentPage: number,
    pageSize: number,
): Promise<MatchForm[]> => {
    try {
        const response = await axiosInstance.post("MatchFormMachine/GetMatchFormMachines", {
            page: currentPage,
            pageSize: pageSize,
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
};

export const fetchSearchMatchFormMchine = async (
    debouncedSearchQuery: string
): Promise<MatchForm[]> => {
    try {
        const response = await axiosInstance.post("MatchFormMachine/SearchMatchCheckListOptions", {
            Messages: debouncedSearchQuery
        });
        return response.data.data ?? [];
    } catch (error) {
        console.error("Error fetching :", error);
        throw new Error('Failed to fetch');
    }
}

export const SaveMatchFormMachine = async (data: {
    Prefix: any;
    MachineID: string;
    FormID: string;
    Mode: string;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("MatchFormMachine/SaveMatchFormMachine", data);
    return response.data;
};

// User manager
export const fetchUserLDAP = async (): Promise<Users[]> => {
    const response = await axiosInstance.post("Ldap/GetUserLdaps");
    return response.data.data ?? [];
};

export const saveUserPermission = async (data: { Prefix: any; UserID: string | undefined; UserName: string; GUserID: string; IsActive: boolean; }): Promise<{ message: string }> => {
    const response = await axiosInstance.post("User/SaveUser", data);
    return response.data;
};

export const fetchUsers = async (): Promise<UsersPermission[]> => {
    const response = await axiosInstance.post("User/GetUsers");
    return response.data.data ?? [];
};

export const fetchGroupUsers = async (): Promise<GroupUsers[]> => {
    const response = await axiosInstance.post('GroupUser/GetGroupUsers');
    return response.data.data ?? [];
};

// Group Permission
export const SaveGroupUser = async (data: {
    GUserID: string;
    GUserName: string;
    isActive: boolean;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("GroupUser/SaveGroupUser", data);
    return response.data;
};

export const SavePermisson = async (data: {
    GUserID: string;
    Permissions: string;
}): Promise<{ message: string }> => {
    const response = await axiosInstance.post("Permisson/SavePermission", data);
    return response.data;
};