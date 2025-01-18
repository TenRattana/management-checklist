import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts/useToast";
import { useRes } from "@/app/contexts/useRes";
import { LoadingSpinner, Searchbar, Text } from "@/components";
import { Card } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import Managepermisstion_dialog from "@/components/screens/Managepermisstion_dialog";
import { Users, GroupUsers, UsersPermission } from '@/typing/type'
import { InitialValuesManagepermission } from '@/typing/value'
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { fetchGroupUser, fetchUserPermission, fetchUsers, saveUserPermission } from "@/app/services";
import { useTheme } from "@/app/contexts/useTheme";

const LazyCustomtable = lazy(() => import("@/components").then(module => ({ default: module.Customtable })));

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
  const { theme } = useTheme();
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
      Prefix: state.PF_UsersPermission ?? "",
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

  const MemoManagepermisstion_dialog = React.memo(Managepermisstion_dialog)

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 10,
      paddingHorizontal: 20
    },
    header: {
      fontSize: spacing.large,
      paddingVertical: fontSize === "large" ? 7 : 5,
      fontWeight: 'bold'
    },
    functionname: {
      textAlign: 'center'
    },
    cardcontent: {
      marginTop: 10,
      paddingVertical: 10,
      paddingHorizontal: 0,
      flex: 1,
      borderRadius: 10,
      backgroundColor: theme.colors.background,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.onBackground,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        android: {
          elevation: 6,
        },
        web: {
          boxShadow: '2px 5px 10px rgba(0, 0, 0, 0.24)',
        },
      }),
    },
    containerSearch: {
      paddingHorizontal: 20,
      paddingVertical: 5,
      flexDirection: 'row'
    },
    contentSearch: {
      alignContent: 'center',
      alignItems: 'center',
      flexDirection: 'row'
    },
    containerTable: {
      flex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center'
    }
  });

  return (
    <View id="container-managerpermission" style={styles.container}>
      <View id="container-search" style={masterdataStyles.containerSearch}>
        <Text style={[masterdataStyles.textBold, styles.header]}>{`List ${state.UsersPermission}` || "List"}</Text>
      </View>

      <Card.Content style={styles.cardcontent}>
        <View style={styles.containerSearch}>
          <View style={styles.contentSearch}>
            <Searchbar
              placeholder={`Search ${state.UsersPermission}...`}
              value={searchQuery}
              onChange={setSearchQuery}
              testId="search-user"
            />
          </View>

          <TouchableOpacity onPress={handleNewData} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold, styles.functionname]}>{`Create ${state.UsersPermission}`}</Text>
          </TouchableOpacity>
        </View>

        <Suspense fallback={<LoadingSpinner />}>
          <LazyCustomtable {...customtableProps} />
        </Suspense>
      </Card.Content>

      {isVisible && (
        <MemoManagepermisstion_dialog
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          isEditing={isEditing}
          initialValues={initialValues}
          saveData={saveData}
          users={user}
          groupUser={groupUser}
        />
      )}
    </View>
  );
});

export default Managepermissions
