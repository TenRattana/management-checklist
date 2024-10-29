import { saveUserData, loadUserData, removeUserData } from '@/app/services/storage';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import axiosInstance from '@/config/axios';
import { useToast } from "@/app/contexts/toastify";
import { GroupUsers, UsersPermission } from '@/typing/type';

interface AuthContextType {
  session: { UserID: string, UserName: string, GUserID: string, GUserName: string, IsActive: boolean };
  loading: boolean;
  screens: { name: string }[];
  login: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log("AuthProvider");

  const [user, setUser] = useState<UsersPermission[]>([]);
  const [groupUser, setGroupUser] = useState<GroupUsers[]>([]);
  const [session, setSession] = useState<{ UserID: string, UserName: string, GUserID: string, GUserName: string, IsActive: boolean }>({ UserID: "", UserName: "", GUserID: "", GUserName: "", IsActive: false });
  const [loading, setLoading] = useState<boolean>(true);
  const { showSuccess, handleError } = useToast();
  const [screens, setScreens] = useState<{ name: string }[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [userResponse, groupUserResponse] = await Promise.all([
        axiosInstance.post('User_service.asmx/GetUsersPermission'),
        axiosInstance.post('GroupUser_service.asmx/GetGroupUsers')
      ]);
      setUser(userResponse.data.data ?? []);
      setGroupUser(groupUserResponse.data.data ?? []);
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const updateSession = (username: string) => {
    const userData = user.find(v => v.UserName === username);
    if (userData) {
      const newSession = {
        UserID: userData.UserID,
        UserName: userData.UserName,
        GUserID: userData.GUserID,
        GUserName: groupUser.find(v => v.GUserID === userData.GUserID)?.GUserName || "",
        IsActive: userData.IsActive
      };
      setSession(newSession);
    }
  };

  const login = useCallback((username: string) => {
    updateSession(username);
  }, [user, groupUser]);

  useEffect(() => {
    if (session.UserName) {
      const screenMapping: Record<string, string[]> = {
        SuperAdmin: ["Home", "Machine_group", "Machine", "Checklist", "Checklist_option", "Checklist_group", "Match_checklist_option", "Match_form_machine", "Create_form", "Expected_result", "Form", "User", "Preview", "Admin", "ScanQR", "GenerateQR", "InputFormMachine", "Setting", "Managepermissions", "SuperAdmin", "TestScreen", "Permission_deny", "Config"],
        Admin: ["Home", "Machine_group", "Machine", "Checklist", "Checklist_option", "Checklist_group", "Match_checklist_option", "Match_form_machine", "Create_form", "Expected_result", "Form", "User", "Preview", "Admin", "ScanQR", "GenerateQR", "InputFormMachine", "Setting", "Permission_deny", "Config"],
        GeneralUser: ["Home", "ScanQR", "InputFormMachine", "Setting", "Permission_deny"]
      };

      setScreens(screenMapping[session.GUserName] ? screenMapping[session.GUserName].map(name => ({ name })) : [{ name: "Permission_deny" }]);
    }
  }, [session]);

  const value = useMemo(() => ({ session, loading, screens, login }), [session, loading, screens, login]);

  return (
    <AuthContext.Provider value={value}>
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
