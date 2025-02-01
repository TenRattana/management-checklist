import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo, useContext } from "react";
import { getData, saveData, deleteData } from '@/app/services/storage';
import axiosInstance from '@/config/axios';
import { useDispatch } from 'react-redux';
import { setUser, setApp, fetchMenu, logout, UserPayload } from "@/slices";
import { AppDispatch } from '@/stores';
import { jwtDecode } from 'jwt-decode';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { ToastContext, ToastContextProps } from "@/app/providers/toastify";
import { fetchAppConfig } from "../services";

const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
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
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const userInfo = await getData('userToken');
      if (userInfo) {
        const payload: any = jwtDecode(userInfo);
        if (payload && payload.Full_Name) {
          if (!(config.headers instanceof AxiosHeaders)) {
            config.headers = new AxiosHeaders(config.headers);
          }
          config.headers.set('Authorization', payload.Full_Name);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  console.log(payload.UserData);

  dispatch(fetchMenu(payload.UserData.GUserID));
  dispatch(setUser({ user: payload.UserData }));

  return
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

  useEffect(() => {
    let isMounted = true;

    const loadUserDataAsync = async () => {
      try {
        const userInfo = await getData('userToken');
        if (isMounted && userInfo) {
          updateSession("", "", userInfo);
        }
      } catch (error) {
        if (isMounted) handleError(error);
      }
    };

    loadUserDataAsync();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSession = useCallback(async (UserName: string, Password: string, TokenAuth: string) => {
    try {
      const token = TokenAuth;
      if (token && token.split('.').length === 3) {
        const payload: any = jwtDecode(token);

        if (payload.UserID) {
          setUserData(payload);
        }
      } else {
        const response = await axiosInstance.get("AuthenticateUser", {
          params: {
            UserName,
            Password,
            TokenAuth
          }
        });

        if (response.data && response.data.token) {
          await saveData('userToken', response.data.token);
          const payload = jwtDecode(response.data.token);
          setUserData(payload);
        }
      }
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (UserData) {
      (async () => {
        await dispatch(initializeApp({ UserData }));
        showSuccess("Login Success!");
        const dataApp = await fetchAppConfig();
        dispatch(setApp({ App: dataApp }));
        setLoading(false);
      })();
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
