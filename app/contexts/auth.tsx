import { saveUserData, loadUserData, removeUserData } from '@/app/services/storage';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import axiosInstance from '@/config/axios';
import { useToast } from "@/app/contexts/toastify";
import { GroupUsers, Users, Userset } from '@/typing/type';

interface AuthContextType {
  session: { UserName: string, GUserName: string }
  loading: boolean;
  screens: { name: string }[];
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
  const [screens, setScreens] = useState<{ name: string }[]>([]);

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

  }, [handleError, setUser, setGroupUser])

  useEffect(() => {
    console.log("session set");

    fetchData()
    setSession({
      UserName: "Rattana Chomwihok",
      GUserName: "SuperAdmin"
    })
    setLoading(false)
  }, [fetchData, setSession])

  useEffect(() => {

    if (session.UserName) {
      if (session.GUserName === "SuperAdmin") {
        setScreens([
          { name: "Home" },
          { name: "Machine_group" },
          { name: "Machine" },
          { name: "Checklist" },
          { name: "Checklist_option" },
          { name: "Checklist_group" },
          { name: "Match_checklist_option" },
          { name: "Match_form_machine" },
          { name: "Create_form" },
          { name: "Expected_result" },
          { name: "Form" },
          { name: "User" },
          { name: "Preview" },
          { name: "Admin" },
          { name: "ScanQR" },
          { name: "GenerateQR" },
          { name: "InputFormMachine" },
          { name: "Setting" },
          { name: "Managepermissions" },
          { name: "SuperAdmin" },
          { name: "Test" },
          { name: "Permission_deny" },
        ]);
      } else if (session.GUserName === "Admin") {
        setScreens([
          { name: "Home" },
          { name: "Machine_group" },
          { name: "Machine" },
          { name: "Checklist" },
          { name: "Checklist_option" },
          { name: "Checklist_group" },
          { name: "Match_checklist_option" },
          { name: "Match_form_machine" },
          { name: "Create_form" },
          { name: "Expected_result" },
          { name: "Form" },
          { name: "User" },
          { name: "Preview" },
          { name: "Admin" },
          { name: "ScanQR" },
          { name: "GenerateQR" },
          { name: "InputFormMachine" },
          { name: "Setting" },
          { name: "Permission_deny" },
        ]);
      } else if (session.GUserName === "GeneralUser") {
        setScreens([
          { name: "Home" },
          { name: "ScanQR" },
          { name: "InputFormMachine" },
          { name: "Setting" },
          { name: "Permission_deny" },
        ]);
      } else {
        setScreens([{ name: "Permission_deny" }]);
      }
    }
  }, [session, setSession, setScreens]);

  const value = useMemo(
    () => ({ session, loading, screens }),
    [session, loading, screens]
  );

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
