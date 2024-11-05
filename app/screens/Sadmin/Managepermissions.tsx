import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pressable } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast, useRes } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import Managepermisstion_dialog from "@/components/screens/Managepermisstion_dialog";
import { Users, GroupUsers, UsersPermission } from '@/typing/type'
import { InitialValuesManagepermission } from '@/typing/value'
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';

const fetchUsers = async (): Promise<Users[]> => {
  const response = await axiosInstance.post("User_service.asmx/GetUsers");
  return response.data.data ?? [];
};

const fetchGroupUser = async (): Promise<GroupUsers[]> => {
  const response = await axiosInstance.post('GroupUser_service.asmx/GetGroupUsers');
  return response.data.data ?? [];
};

const fetchUserPermission = async (): Promise<UsersPermission[]> => {
  const response = await axiosInstance.post("User_service.asmx/GetUsersPermission");
  return response.data.data ?? [];
};

const saveUserPermission = async (data: { Prefix: any; UserID: string | undefined; UserName: string; GUserID: string; IsActive: boolean; }): Promise<{ message: string }> => {
  const response = await axiosInstance.post("User_service.asmx/SaveUser", data);
  return response.data;
};

const Managepermissions = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<InitialValuesManagepermission>({
    UserID: "",
    UserName: "",
    IsActive: true,
    GUserID: "",
  });

  const masterdataStyles = useMasterdataStyles();
  const state = useSelector((state: any) => state.prefix);
  const { showSuccess, handleError } = useToast();
  const { spacing, fontSize } = useRes();
  const queryClient = useQueryClient();

  const { data: userPermission = [], isLoading } = useQuery<UsersPermission[], Error>(
    'userPermission',
    fetchUserPermission,
    {
      refetchOnWindowFocus: true,
    }
  );

  const { data: user = [] } = useQuery<Users[], Error>(
    'user',
    fetchUsers,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10
    });

  const { data: groupUser = [] } = useQuery<GroupUsers[], Error>(
    'groupUser',
    fetchGroupUser,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10
    });

  const mutation = useMutation(saveUserPermission, {
    onSuccess: (data) => {
      showSuccess(data.message);
      setIsVisible(false)
      queryClient.invalidateQueries('userPermission');
    },
    onError: handleError,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const saveData = useCallback(async (values: InitialValuesManagepermission) => {
    const data = {
      Prefix: state.UsersPermission ?? "",
      UserID: values.UserID,
      UserName: values.UserName,
      GUserID: values.GUserID,
      IsActive: values.IsActive
    };

    mutation.mutate(data);
  }, [mutation, state]);

  const handleAction = useCallback(async (action?: string, item?: string) => {
    try {
      if (action === "editIndex") {
        const response = await axiosInstance.post("User_service.asmx/GetUser", {
          UserID: item,
        });
        const userData = response.data.data[0] ?? {};
        setInitialValues({
          UserID: userData.UserID,
          UserName: userData.UserName ?? "",
          GUserID: userData.GUserID ?? "",
          IsActive: userData.IsActive,
        });
        setIsVisible(true);
        setIsEditing(true);
      } else {
        const endpoint = action === "activeIndex" ? "ChangeUser" : "DeleteUser";
        const response = await axiosInstance.post(`User_service.asmx/${endpoint}`, { UserID: item });
        showSuccess(String(response.data.message));
        queryClient.invalidateQueries('machineGroups');
      }
    } catch (error) {
      handleError(error);
    }
  }, [handleError, queryClient]);

  const tableData = useMemo(() => {
    return userPermission.map((item) => [
      item.UserName,
      groupUser.find((group) => group.GUserID === item.GUserID)?.GUserName || "",
      item.IsActive,
      item.UserID,
    ])
  }, [userPermission, groupUser]);

  const handleNewData = useCallback(() => {
    setInitialValues({
      UserID: "",
      UserName: "",
      IsActive: true,
      GUserID: "",
    });
    setIsEditing(false);
    setIsVisible(true);
  }, [setInitialValues, setIsEditing, setIsVisible]);

  const customtableProps = useMemo(() => ({
    Tabledata: tableData,
    Tablehead: [
      { label: "User Name", align: "flex-start" },
      { label: "Role Name", align: "flex-start" },
      { label: "Status", align: "center" },
      { label: "", align: "flex-end" }
    ],
    flexArr: [3, 3, 1, 1],
    actionIndex: [
      {
        editIndex: 3,
        delIndex: 4,
      },
    ],
    handleAction,
    showMessage: 1,
    searchQuery: debouncedSearchQuery,
  }), [tableData, debouncedSearchQuery, handleAction]);

  return (
    <AccessibleView name="container-checklist" style={{ flex: 1 }}>
      <Card.Title
        title="List User"
        titleStyle={[masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small, paddingVertical: fontSize === "large" ? 7 : 5 }]}
      />
      <AccessibleView name="match-form-machine" style={masterdataStyles.containerSearch}>
        <Searchbar
          placeholder="Search User..."
          value={searchQuery}
          onChange={setSearchQuery}
          testId="search-user"
        />
        <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
          <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, { textAlign: 'center' }]}>Add Permission</Text>
        </Pressable>
      </AccessibleView>
      <Card.Content style={{ padding: 2, flex: 1 }}>
        {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
      </Card.Content>

      <Managepermisstion_dialog
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        isEditing={isEditing}
        initialValues={initialValues}
        saveData={saveData}
        users={user}
        groupUser={groupUser}
      />
    </AccessibleView>
  );
});

export default Managepermissions
