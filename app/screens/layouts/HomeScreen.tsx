import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, Text } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { AccessibleView, Customtable, LoadingSpinner, Searchbar } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import { Machine, MachineGroup } from '@/typing/type';
import { InitialValuesMachine } from '@/typing/value';
import { useFocusEffect } from "expo-router";

const HomeScreen = () => {
  console.log("HomeScreen");

  const [machine, setMachine] = useState<Machine[]>([]);
  const [machineGroup, setMachineGroup] = useState<MachineGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<InitialValuesMachine>({
    machineId: "",
    machineGroupId: "",
    machineName: "",
    description: "",
    isActive: true,
  });

  const masterdataStyles = useMasterdataStyles();
  const { showSuccess, handleError } = useToast();
  const { spacing } = useRes();
  console.log(spacing);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [machineResponse, machineGroupResponse] = await Promise.all([
        axiosInstance.post("Machine_service.asmx/GetMachines"),
        axiosInstance.post("MachineGroup_service.asmx/GetMachineGroups"),
      ]);
      setMachine(machineResponse.data.data ?? []);
      setMachineGroup(machineGroupResponse.data.data ?? []);
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

  const tableData = useMemo(() => {
    return machine.map((item) => [
      machineGroup.find((group) => group.MGroupID === item.MGroupID)?.MGroupName || "",
      item.MachineName,
      item.Description,
      item.IsActive,
      item.MachineID,
    ])
  }, [machine, machineGroup, debouncedSearchQuery]);


  const customtableProps = useMemo(() => ({
    Tabledata: tableData,
    Tablehead: [
      { label: "Machine Group Name", align: "flex-start" },
      { label: "Machine Name", align: "flex-start" },
      { label: "Description", align: "flex-start" },
      { label: "Status", align: "center" },
      { label: "", align: "flex-end" },
    ],
    flexArr: [2, 2, 2, 1, 1],
    actionIndex: [{ editIndex: 4, delIndex: 5 }],
    searchQuery: debouncedSearchQuery,
  }), [tableData, debouncedSearchQuery]);

  return (
    <ScrollView style={{ paddingHorizontal: 15 }}>
      <Text>Welcome Home</Text>
    </ScrollView>
  );
}

export default React.memo(HomeScreen)
