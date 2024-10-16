import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { ScrollView, Pressable, Text } from "react-native";
import axiosInstance from "@/config/axios";
import { useToast } from "@/app/contexts";
import { AccessibleView, LoadingSpinner, Searchbar, Customtable } from "@/components";
import { Card, Divider } from "react-native-paper";
import useMasterdataStyles from "@/styles/common/masterdata";
import { useRes } from "@/app/contexts";
import { Machine, MatchForm } from '@/typing/type';
import { useFocusEffect } from "expo-router";
import { ScanQRProps } from "@/typing/tag";
// const Customtable = lazy(() => import('@/components/Customtable'));

const HomeScreen: React.FC<ScanQRProps> = ({ navigation }) => {
  const [machine, setMachine] = useState<Machine[]>([]);
  const [matchForm, setMatchForm] = useState<MatchForm[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const masterdataStyles = useMasterdataStyles();
  const { handleError } = useToast();
  const { spacing } = useRes();

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
      const pollingInterval = setInterval(() => {
        fetchData();
      }, 5000);

      return () => clearInterval(pollingInterval);
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
    return matchForm.map((item) => [
      item.MachineName,
      item.FormName,
      item.IsActive ? "Wait" : "Success",
    ]);
  }, [machine, debouncedSearchQuery]);

  const handleSacnQR = useCallback(() => {
    navigation.navigate("ScanQR")
  }, []);

  const customtableProps = useMemo(() => ({
    Tabledata: tableData,
    Tablehead: [
      { label: "Machine Name", align: "flex-start" },
      { label: "FormName", align: "flex-start" },
      { label: "Status", align: "center" },
    ],
    flexArr: [4, 2, 1],
    actionIndex: [{ editIndex: 4, delIndex: 5 }],
    searchQuery: debouncedSearchQuery,
  }), [tableData, debouncedSearchQuery]);

  return (
    <ScrollView style={{ paddingHorizontal: 15 }}>
      <Text style={[masterdataStyles.text, masterdataStyles.textBold,
      { fontSize: spacing.large, marginTop: spacing.small, marginBottom: 10 }]}>List Diary
      </Text>
      <Divider style={{ marginBottom: 20 }} />
      <Card style={{ borderRadius: 5 }}>
        <AccessibleView name="machine" style={masterdataStyles.containerSearch}>
          <Searchbar
            placeholder="Search List Form..."
            value={searchQuery}
            onChange={setSearchQuery}
            testId="search-list-form"
          />
          <Pressable onPress={handleSacnQR} style={[masterdataStyles.backMain, masterdataStyles.buttonCreate]}>
            <Text style={[masterdataStyles.textBold, masterdataStyles.textLight]}>Scan QR</Text>
          </Pressable>
        </AccessibleView>
        <Card.Content style={{ padding: 2, paddingVertical: 10 }}>
          {/* <Suspense fallback={<LoadingSpinner />}> */}
          {!isLoading ? <Customtable {...customtableProps} /> : <LoadingSpinner />}
          {/* </Suspense> */}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default React.memo(HomeScreen);