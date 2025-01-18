import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { useQuery } from 'react-query';
import axiosInstance from '@/config/axios';
import useMasterdataStyles from '@/styles/common/masterdata';
import { Customtable, LoadingSpinner } from '@/components';
import { useTheme } from '@/app/contexts/useTheme';
import { TimeTrack } from '@/typing/screens/TimeTrack';

const fetchTimeTrack = async (): Promise<TimeTrack[]> => {
  const response = await axiosInstance.post("TimeSchedule_service.asmx/GetScheduleTracks");
  return response.data.data ?? [];
};

const TimescheduleTrack = React.memo(() => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const masterdataStyles = useMasterdataStyles();
  const { theme } = useTheme()

  const { data: timeTrack = [], isLoading } = useQuery<TimeTrack[], Error>(
    'timeTrack',
    fetchTimeTrack, {
    refetchOnWindowFocus: true,
    refetchOnMount: true
  }
  );

  const handleTrackSelect = (ScheduleID: string) => {
    setSelectedTrack(ScheduleID);
  };

  const convertToThaiDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear() + 543;
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} เวลา ${hours}:${minutes}`;
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      flex: 1,
      backgroundColor: theme.colors.background,
      height: '100%',
    },
    leftPanel: {
      width: '30%',
      backgroundColor: theme.colors.background,
      padding: 15,
      borderRightWidth: 1,
      borderRightColor: '#D0D0D0',
      height: '100%',
    },
    header: {
      fontSize: 22,
      textAlign: 'center',
      color: '#333',
      marginTop: 15,
    },
    card: {
      marginBottom: 20,
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      elevation: 4,
      padding: 15,
    },
    timeTrackItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#D0D0D0',
    },
    timeTrackName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
  });

  const tableData = useMemo(() => {
    const selectedSchedule = timeTrack.find((item) => item.ScheduleID === selectedTrack);

    if (!selectedSchedule) {
      return [];
    }

    return selectedSchedule.Track?.map((log, index) => [
      `Detail ${index + 1}`,
      selectedSchedule.ScheduleName,
      convertToThaiDateTime(log.start),
      convertToThaiDateTime(log.stop),
    ]) || [];
  }, [timeTrack, selectedTrack]);

  const customtableProps = useMemo(() => ({
    Tabledata: tableData,
    Tablehead: [
      { label: "", align: "flex-start" },
      { label: "Schedule Name", align: "flex-start" },
      { label: "Start", align: "flex-start" },
      { label: "End", align: "flex-start" },
    ],
    flexArr: [1, 2, 2, 2],
    actionIndex: [{}],
    showMessage: 1,
    searchQuery: " ",
  }), [tableData]);

  return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
        <Card.Title
          title="Time Tracking"
          titleStyle={[masterdataStyles.textBold, styles.header]}
        />

        <FlatList
          data={timeTrack}
          keyExtractor={(item) => item.ScheduleID}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleTrackSelect(item.ScheduleID)}>
              <View style={styles.timeTrackItem}>
                <Text style={styles.timeTrackName}>{item.ScheduleName}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={{ flex: 1, marginHorizontal: 24 }}>
        {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
      </View>
    </View>
  );
});

export default TimescheduleTrack;
