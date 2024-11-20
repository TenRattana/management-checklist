import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { getData, saveData, deleteData } from '@/app/services/storage';
import axiosInstance from '@/config/axios';
import { AppProps, GroupUsers, UsersPermission } from '@/typing/type';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { setUser, setApp, logout, fetchMenu } from "@/slices";
import { AppDispatch } from '@/stores';
import { useToast } from '../contexts';
import { jwtDecode } from 'jwt-decode';
import { useNavigation } from "expo-router";

const fetchAppConfig = async (): Promise<AppProps> => {
  const response = await axiosInstance.post('AppConfig_service.asmx/GetAppConfigs');
  return response.data.data[0] ?? [];
};

export interface AuthContextType {
  loading: boolean;
  login: (username: string, password: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(true);
  const { handleError, showSuccess } = useToast();
  const navigation = useNavigation();

  console.log("Auth");

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
      console.log("data");

      dispatch(setApp({ App: data }));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (!isAppLoading) {
      console.log("setLoading F");

      setLoading(false);
    } else {
      console.log("setLoading T");

      setLoading(true);
    }
  }, [isAppLoading, data]);

  const updateSession = useCallback(async (UserName: string, Password: string, TokenAuth: string) => {
    console.log("updateSession");

    const token = TokenAuth;
    let DataUser: any = undefined

    if (token && token.split('.').length === 3) {
      try {
        const payload = jwtDecode(token);
        console.log("Decoded Payload:", payload);

        if (payload.exp) {
          const expirationTime = payload.exp * 1000;
          const currentTime = Date.now();

          if (currentTime < expirationTime) {
            DataUser = payload
            console.log("Token is still valid.");
          } else {
            console.log("Token has expired. Requesting a new token...");

            await deleteData('userToken');
            navigation.navigate('Login');
          }
        }
      } catch (error) {
        handleError(error);
      }
    } else {
      console.log("No valid token found. Requesting a new token...");

      const data = {
        UserName: UserName,
        Password: Password,
        TokenAuth: TokenAuth
      };

      try {
        const response = await axiosInstance.post("User_service.asmx/GetAD", data);
        if (response.data && response.data.token) {
          await saveData('userToken', response.data.token);
          const payload = jwtDecode(response.data.token);
          DataUser = payload

          console.log("New token saved.");
        }
      } catch (error) {
        handleError(error);
      }
    }
    dispatch(fetchMenu(DataUser.GUserID))
    dispatch(setUser({ user: DataUser }));
    navigation.navigate('Home');

  }, [dispatch]);

  useEffect(() => {
    const loadUserDataAsync = async () => {
      try {
        const userInfo = await getData('userToken');
        console.log(userInfo);

        if (userInfo !== undefined && userInfo) {
          updateSession("", "", userInfo);
        }

      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserDataAsync();
  }, []);

  const login = useCallback((username: string, password: string) => {
    console.log("login");
    console.log(username, password);

    updateSession(username, password, "");
  }, []);

  const value = useMemo(() => ({ loading, login }), [loading, login]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
