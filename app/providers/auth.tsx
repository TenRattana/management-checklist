import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { getData, saveData, deleteData } from '@/app/services/storage';
import axiosInstance from '@/config/axios';
import { AppProps } from '@/typing/type';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { setUser, setApp, logout, fetchMenu, UserPayload } from "@/slices";
import { AppDispatch } from '@/stores';
import { useToast } from '../contexts';
import { jwtDecode } from 'jwt-decode';
import { LoginScreen } from "../screens";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosHeaders, InternalAxiosRequestConfig } from "axios";

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
const initializeApp = createAsyncThunk('app/initialize', async (payload: { App: AppProps, UserData: UserPayload }, { dispatch }) => {
  dispatch(setApp({ App: payload.App }));
  dispatch(fetchMenu(payload.UserData.GUserID));
  dispatch(setUser({ user: payload.UserData }));

  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (payload.UserData) {
        if (!(config.headers instanceof AxiosHeaders)) {
          config.headers = new AxiosHeaders(config.headers);
        }

        config.headers.set('Authorization', payload.UserData.Full_Name);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(false);
  const [UserData, setUserData] = useState<any>(undefined)
  const { handleError } = useToast();

  const { data } = useQuery<AppProps, Error>(
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
    const loadUserDataAsync = async () => {
      try {
        const userInfo = await getData('userToken');
        console.log(userInfo);

        if (userInfo !== undefined && userInfo) {
          updateSession("", "", userInfo);
        } else {
          return LoginScreen
        }
      } catch (error) {
        handleError(error)
      }
    };

    loadUserDataAsync();
  }, []);

  const updateSession = useCallback(async (UserName: string, Password: string, TokenAuth: string) => {
    const token = TokenAuth;

    if (token && token.split('.').length === 3) {
      try {
        const payload = jwtDecode(token);

        if (payload.exp) {
          const expirationTime = payload.exp * 1000;
          const currentTime = Date.now();

          if (currentTime < expirationTime) {
            setUserData(payload)
          } else {
            await deleteData('userToken');
            console.log("LoginSIn U");

            return LoginScreen
          }
        }
      } catch (error) {
        handleError(error);
      }
    } else {
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
          setUserData(payload)
        }
      } catch (error) {
        handleError(error);
      }
    }
  }, [LoginScreen, handleError]);

  useEffect(() => {
    if (UserData && data) {
      dispatch(initializeApp({ App: data, UserData }));
      setLoading(true)
    }
  }, [UserData, data, dispatch]);

  const login = useCallback((username: string, password: string) => {
    updateSession(username, password, "");
  }, []);

  const value = useMemo(() => ({ loading, login }), [loading, login]);

  return (
    <>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </>
  );
};
