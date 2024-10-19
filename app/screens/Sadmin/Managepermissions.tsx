import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Pressable, Text, Role } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { Customtable, LoadingSpinner, AccessibleView, Searchbar } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import Managepermisstion_dialog from "@/components/screens/Managepermisstion_dialog";
import { Users, GroupUsers, UsersPermission } from '@/typing/type'
import { InitialValuesManagepermission } from '@/typing/value'
import { useFocusEffect } from "expo-router";

const Managepermissions = () => {
  const [user, setUser] = useState<Users[]>([]);
  const [userPermission, setUserPermission] = useState<UsersPermission[]>([]);
  const [groupUser, setGroupUser] = useState<GroupUsers[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<InitialValuesManagepermission>({
    UserID: "",
    UserName: "",
    IsActive: true,
    GUserID: "",
  });

  const masterdataStyles = useMasterdataStyles();
  const { showSuccess, handleError } = useToast();
  const { spacing } = useRes();

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [userResponse, groupUserResponse, userPermission] = await Promise.all([
        axiosInstance.post("User_service.asmx/GetUsers"),
        axiosInstance.post("GroupUser_service.asmx/GetGroupUsers"),
        axiosInstance.post("User_service.asmx/GetUsersPermission")
      ]);
      setUser(userResponse.data.data ?? []);
      setGroupUser(groupUserResponse.data.data ?? []);
      setUserPermission(userPermission.data.data ?? [])
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const saveData = useCallback(async (values: InitialValuesManagepermission) => {
    const data = {
      UserID: values.UserID,
      UserName: values.UserName,
      GUserID: values.GUserID,
      IsActive: values.IsActive
    };

    try {
      const response = await axiosInstance.post("User_service.asmx/SaveUser", data);
      setIsVisible(!response.data.status);
      showSuccess(String(response.data.message));

      await fetchData();
    } catch (error) {
      handleError(error);
    }
  }, [fetchData, handleError]);

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
          IsActive: userData.IsActive
        });
        setIsVisible(true);
        setIsEditing(true);
      } else {
        const endpoint = action === "activeIndex" ? "ChangeUser" : "DeleteUser";
        const response = await axiosInstance.post(`User_service.asmx/${endpoint}`, { UserID: item });
        showSuccess(String(response.data.message));

        await fetchData();
      }
    } catch (error) {
      handleError(error);
    }
  }, [fetchData, handleError]);

  const tableData = useMemo(() => {
    return userPermission.map((item) => [
      item.UserName,
      groupUser.find((group) => group.GUserID === item.GUserID)?.GUserName || "",
      item.IsActive,
      item.UserID,
    ])
  }, [userPermission,groupUser]);

  const handleNewData = useCallback(() => {
    setInitialValues({
      UserID: "",
      UserName: "",
      IsActive: true,
      GUserID: "",
    });
    setIsEditing(false);
    setIsVisible(true);
  }, []);

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
    searchQuery: debouncedSearchQuery,
  }), [tableData, debouncedSearchQuery, handleAction]);

  return (
    <ScrollView style={{ paddingHorizontal: 15 }}>
      <Text style={[masterdataStyles.text, masterdataStyles.textBold,
      { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>List User
      </Text>
      <Divider style={{ marginBottom: 20 }} />
      <Card style={{ borderRadius: 5 }}>
        <AccessibleView name="match-form-machine" style={masterdataStyles.containerSearch}>
          <Searchbar
            placeholder="Search User..."
            value={searchQuery}
            onChange={setSearchQuery}
            testId="search-user"
          />
          <Pressable onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
            <Text style={[masterdataStyles.textBold, masterdataStyles.textLight]}>Add Permission</Text>
          </Pressable>
        </AccessibleView>
        <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
          {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
        </Card.Content>
      </Card>

      <Managepermisstion_dialog
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        isEditing={isEditing}
        initialValues={initialValues}
        saveData={saveData}
        users={user}
        groupUser={groupUser}
      />
    </ScrollView>
  );
};

export default React.memo(Managepermissions)
