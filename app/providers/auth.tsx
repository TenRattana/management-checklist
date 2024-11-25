import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo, useContext } from "react";
import { getData, saveData, deleteData } from '@/app/services/storage';
import axiosInstance from '@/config/axios';
import { AppProps } from '@/typing/type';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { setUser, setApp, fetchMenu, logout, UserPayload, fetchPermission } from "@/slices";
import { AppDispatch } from '@/stores';
import { jwtDecode } from 'jwt-decode';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { ToastContext, ToastContextProps } from "@/app/providers/toastify";

const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

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

export const initializeApp = createAsyncThunk('app/initialize', async (payload: { UserData: UserPayload }, { dispatch }) => {
  dispatch(fetchMenu(payload.UserData.GUserID));
  dispatch(fetchPermission(payload.UserData.GUserID));
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

export const initializeLogout = createAsyncThunk('app/initialize', async (_, { dispatch }) => {
  dispatch(logout());
  await deleteData('userToken');

  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (config.headers instanceof AxiosHeaders) {

        config.headers.delete('Authorization');
      } else {
        config.headers = new AxiosHeaders();
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
  const { handleError, showSuccess } = useToast();

  const { data, isLoading: LoadingApp } = useQuery<AppProps, Error>(
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
    if (!LoadingApp && data) {
      dispatch(setApp({ App: data }));
    }
  }, [LoadingApp, dispatch])

  useEffect(() => {
    const loadUserDataAsync = async () => {
      try {
        const userInfo = await getData('userToken');
        if (userInfo !== undefined && userInfo) {
          updateSession("", "", userInfo);
        } else {
          return
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
            return
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
  }, []);

  useEffect(() => {
    if (UserData) {
      dispatch(initializeApp({ UserData }));
      setLoading(true)
      showSuccess("Login Success!")
    }
  }, [UserData, dispatch]);

  const login = useCallback(async (username: string, password: string) => {
    await updateSession(username, password, "");
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
