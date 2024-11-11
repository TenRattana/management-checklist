import { saveUserData, loadUserData } from '@/app/services/storage';
import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import axiosInstance from '@/config/axios';
import { AppProps, GroupUsers, UsersPermission } from '@/typing/type';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { setUser, setApp, logout, fetchMenu } from "@/slices";
import { AppDispatch } from '@/stores';

const fetchAppConfig = async (): Promise<AppProps> => {
  const response = await axiosInstance.post('AppConfig_service.asmx/GetAppConfigs');
  return response.data.data[0] ?? [];
};

const fetchUserPermission = async (): Promise<UsersPermission[]> => {
  const response = await axiosInstance.post('User_service.asmx/GetUsersPermission');
  return response.data.data ?? [];
};

const fetchGroupUser = async (): Promise<GroupUsers[]> => {
  const response = await axiosInstance.post('GroupUser_service.asmx/GetGroupUsers');
  return response.data.data ?? [];
};

export interface AuthContextType {
  loading: boolean;
  login: (username: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(true);

  const { data: user = [], isLoading: isUserLoading } = useQuery<UsersPermission[], Error>(
    'userPermission',
    fetchUserPermission,
    { refetchOnWindowFocus: false, keepPreviousData: true }
  );

  const { data, isLoading: isAppLoading } = useQuery<AppProps, Error>(
    'appConfig',
    fetchAppConfig,
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    }
  );
  useEffect(() => {
    if (data) {
      dispatch(setApp({ App: data }));
    }
  }, [data, dispatch]);

  const { data: groupUser = [], isLoading: isGroupUserLoading } = useQuery<GroupUsers[], Error>(
    'groupUser',
    fetchGroupUser,
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10
    }
  );

  useEffect(() => {
    if (!isUserLoading && !isAppLoading && !isGroupUserLoading) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [isUserLoading, isAppLoading, isGroupUserLoading]);

  const updateSession = useCallback((UserName: string) => {
    const userData = user.find(v => v.UserName === UserName);
    if (userData) {
      const newSession = {
        UserID: userData.UserID,
        UserName: userData.UserName,
        GUserID: userData.GUserID,
        GUserName: groupUser.find(v => v.GUserID === userData.GUserID)?.GUserName || "",
        IsActive: userData.IsActive
      };
      dispatch(fetchMenu(userData.GUserID));
      dispatch(setUser({ user: newSession }));
    } else {
      dispatch(logout());
    }
    saveUserData({ UserName: UserName });
  }, [user, groupUser, dispatch]);

  useEffect(() => {
    const loadUserDataAsync = async () => {
      try {
        updateSession("Rattana Chomwihok");

        // Optional loading of persisted user data (commented out for now)
        // const userInfo = await loadUserData();
        // if (userInfo) {
        //   updateSession(userInfo.UserName);
        // }

      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserDataAsync();
  }, [updateSession]);

  const login = useCallback((username: string) => {
    updateSession(username);
  }, [updateSession]);

  const value = useMemo(() => ({ loading, login }), [loading, login]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
