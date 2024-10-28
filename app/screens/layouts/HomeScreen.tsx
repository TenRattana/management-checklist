import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { ScrollView, Pressable, View } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { AccessibleView, LoadingSpinner, Searchbar, Customtable, Text } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import { Machine, MatchForm } from '@/typing/type';
import { useFocusEffect } from "expo-router";
import { ScanQRProps } from "@/typing/tag";

const HomeScreen: React.FC<ScanQRProps> = ({ navigation }) => {

  const [machine, setMachine] = useState<Machine[]>([]);
  const [matchForm, setMatchForm] = useState<MatchForm[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const masterdataStyles = useMasterdataStyles();
  const { handleError } = useToast();
  const { spacing, fontSize } = useRes();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [machineResponse, matchFormResponse] = await Promise.all([
        axiosInstance.post("Machine_service.asmx/GetMachines"),
        axiosInstance.post("MatchFormMachine_service.asmx/GetMatchFormMachines"),
      ]);
      setMachine(machineResponse.data.data ?? []);
      setMatchForm(matchFormResponse.data.data ?? [])
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

  const tableData = useMemo(() => {
    return matchForm.map((item) => [
      item.MachineName,
      item.FormName,
      item.IsActive ? "Wait" : "Success",
    ]);
  }, [matchForm, debouncedSearchQuery]);

  const handleSacnQR = useCallback(() => {
    navigation.navigate("ScanQR")
  }, []);

  const customtableProps = useMemo(() => {
    return {
      Tabledata: tableData,
      Tablehead: [
        { label: "Machine Name", align: "flex-start" },
        { label: "FormName", align: "flex-start" },
        { label: "Status", align: "center" },
      ],
      flexArr: [4, 2, 1],
      actionIndex: [{ editIndex: 4, delIndex: 5 }],
      searchQuery: debouncedSearchQuery,
    }
  }, [tableData, debouncedSearchQuery]);


  return (
    <AccessibleView name="container-home" style={{ flex: 1 }}>
      <Card.Title
        title="Home"
        titleStyle={[masterdataStyles.textBold, { fontSize: spacing.large, marginTop: spacing.small, paddingVertical: fontSize === "large" ? 7 : 5 }]}
      />
      <AccessibleView name="container-search" style={masterdataStyles.containerSearch}>
        <Pressable onPress={handleSacnQR} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
          <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>Scan QR Code</Text>
        </Pressable>
      </AccessibleView>

    </AccessibleView>
  );
};

export default React.memo(HomeScreen);