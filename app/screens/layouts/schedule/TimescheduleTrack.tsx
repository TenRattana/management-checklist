import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import { Card } from 'react-native-paper';
import { useQuery } from 'react-query';
import { AccessibleView } from '@/components';
import axiosInstance from '@/config/axios';
import useMasterdataStyles from '@/styles/common/masterdata';

interface Log {
  start: string | null;
  stop: string | null;
}

interface GMachine {
  GMachineID: string;
  GMachineName: string;
}

interface TimeTrack {
  ScheduleID: string;
  ScheduleName: string;
  GroupMachines: GMachine[];
  Track: Log[];
}

const fetchTimeTrack = async (): Promise<TimeTrack[]> => {
  const response = await axiosInstance.post("TimeSchedule_service.asmx/GetScheduleTracks");
  return response.data.data ?? [];
};

const Render = React.memo(({ group }: { group: TimeTrack }) => {
  return (
    <FlatList
      data={group.Track}
      keyExtractor={(item, index) => `${index}-start-end`}
      renderItem={({ item: track }) => (
        <View style={styles.logRow}>
          <Text style={styles.logText}>{track.start || '-'}</Text>
          <Text style={styles.logText}>{track.stop || '-'}</Text>
          <Text
            style={[
              styles.logText,
              { color: track.start && track.stop ? 'green' : 'red' },
            ]}
          >
            {track.start && track.stop ? 'Finished' : 'In Progress'}
          </Text>
        </View>
      )}
      ListEmptyComponent={() => (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      )}
      ListHeaderComponent={() => (
        <View>
          <Text style={styles.groupName}>{group.ScheduleName}</Text>
          <Text style={styles.groupSubtitle}>Tracking: {group.Track?.length}</Text>
          <View style={styles.logHeader}>
            <Text style={styles.logHeaderText}>Start</Text>
            <Text style={styles.logHeaderText}>Stop</Text>
            <Text style={styles.logHeaderText}>Status</Text>
          </View>
        </View>
      )}
      nestedScrollEnabled={false}
    />
  );
});

const TimescheduleTrack = () => {
  const masterdataStyles = useMasterdataStyles();

  const { data: timeTrack = [] } = useQuery<TimeTrack[], Error>(
    'timeTrack',
    fetchTimeTrack,
  );

  return (
    <AccessibleView name="container-timetrack" style={styles.container}>
      <Card.Title
        title="Time Tracking"
        titleStyle={[masterdataStyles.textBold, styles.header]}
      />

      <FlatList
        data={timeTrack}
        keyExtractor={(item) => `${item.ScheduleID}-key`}
        renderItem={({ item: group }) => (
          <View key={group.ScheduleID} style={styles.groupCard}>
            <Render group={group} />
          </View>
        )}
      />
    </AccessibleView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  header: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
    color: '#333',
  },
  groupCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  groupSubtitle: {
    color: '#666',
    marginVertical: 5,
    fontSize: 14,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
    marginTop: 10,
  },
  logHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#444',
    width: '33%',
    textAlign: 'center',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    paddingVertical: 5,
    backgroundColor: '#f7f7f7',
    borderRadius: 5,
  },
  logText: {
    fontSize: 13,
    width: '33%',
    textAlign: 'center',
    color: '#555',
  },
  emptyState: {
    alignSelf: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#aaa',
    textAlign: 'center',
  },
});

export default TimescheduleTrack;
