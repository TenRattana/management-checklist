import { saveUserData, loadUserData, removeUserData } from '@/app/services/storage';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axiosInstance from '@/config/axios';
import { useToast } from "@/app/contexts/toastify";
import { GroupUsers, Users, Userset } from '@/typing/type';
import { useFocusEffect } from 'expo-router';

interface AuthContextType {
  session: { UserName: string, GUserName: string }
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Users[]>([]);
  const [groupUser, setGroupUser] = useState<GroupUsers[]>([]);
  const [session, setSession] = useState<{ UserName: string, GUserName: string }>({ UserName: "", GUserName: "" })
  const [loading, setLoading] = useState<boolean>(true);
  const { showSuccess, handleError } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [userResponse, groupUserResponse] = await Promise.all([
        axiosInstance.post('User_service.asmx/GetUsers'),
        axiosInstance.post('GroupUser_service.asmx/GetGroupUsers')
      ])
      setUser(userResponse.data.data ?? [])
      setGroupUser(groupUserResponse.data.data ?? []);
    } catch (error) {
      handleError(error);
    }

  }, [handleError])

  useEffect(() => {
    fetchData()
    setSession({
      UserName: "Rattana Chomwihok",
      GUserName: "SuperAdmin"
    })
    setLoading(false)
  }, [fetchData])

  // useEffect(() => {
  //   if (data && data.length > 0) {
  //     axiosInstance.post('User_service.asmx/SaveUsers', { Datausers: JSON.stringify(data) })

  //     fetchData()
  //   }
  // }, [data])

  // useFocusEffect(
  //   useCallback(() => {
  //     console.log(data);
  //     console.log(user);

  //     if (data && data.length > 0) {
  //       const dataUser = data.map(item => item.UserName)

  //       console.log(dataUser);
  //     }
  //     setLoading(false)
  //   }, [fetchData])
  // );
  // useEffect(() => {
  //   fetchData()

  // const fetchUserData = async () => {
  //   const storedUser = await loadUserData();
  //   if (storedUser) {
  //     setUser(storedUser.username);
  //     setRole(storedUser.role);
  //   }
  //   setLoading(false);
  // };

  // fetchUserData();
  // }, [fetchData]);

  // const logout = () => {
  //   removeUserData();
  //   setUser(null);
  //   setRole(null);
  // };

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
