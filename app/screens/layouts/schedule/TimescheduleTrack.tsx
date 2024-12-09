import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';

interface Log {
  start: string;
  end: string | null;
  status: 'Running' | 'Stopped';
  reason: string | null;
}

interface Machine {
  id: number;
  name: string;
  logs: Log[];
}

interface GroupMachine {
  id: number;
  name: string;
  machines: Machine[];
}

const TimescheduleTrack = () => {
  const [screenSize, setScreenSize] = useState<'large' | 'medium' | 'small'>(
    'large'
  );

  const groupData: GroupMachine[] = [
    {
      id: 1,
      name: 'Group A',
      machines: [
        {
          id: 1,
          name: 'Machine A1',
          logs: [
            { start: '08:00 AM', end: '09:00 AM', status: 'Stopped', reason: 'Maintenance' },
            { start: '09:30 AM', end: '10:00 AM', status: 'Stopped', reason: 'Power Issue' },
            { start: '10:15 AM', end: null, status: 'Running', reason: null },
          ],
        },
        {
          id: 2,
          name: 'Machine A2',
          logs: [
            { start: '07:30 AM', end: '08:15 AM', status: 'Stopped', reason: 'Calibration' },
            { start: '08:30 AM', end: '09:00 AM', status: 'Running', reason: null },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Group B',
      machines: [
        {
          id: 3,
          name: 'Machine B1',
          logs: [
            { start: '08:15 AM', end: '08:45 AM', status: 'Stopped', reason: 'Error in Component' },
            { start: '09:00 AM', end: '09:30 AM', status: 'Running', reason: null },
          ],
        },
      ],
    },
  ];

  // Function to determine screen size
  const updateScreenSize = () => {
    const { width } = Dimensions.get('window');
    if (width > 1200) {
      setScreenSize('large');
    } else if (width > 768) {
      setScreenSize('medium');
    } else {
      setScreenSize('small');
    }
  };

  useEffect(() => {
    updateScreenSize();
    Dimensions.addEventListener('change', updateScreenSize);

    return () => {
      Dimensions.removeEventListener('change', updateScreenSize);
    };
  }, []);

  return (
    <ScrollView
      style={[
        styles.container,
        screenSize === 'large' && styles.largeContainer,
        screenSize === 'medium' && styles.mediumContainer,
        screenSize === 'small' && styles.smallContainer,
      ]}
    >
      <Text style={styles.header}>Group Machine Time Tracking</Text>
      {groupData.map((group) => (
        <View key={group.id} style={styles.groupCard}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupSubtitle}>
            Total Machines: {group.machines.length}
          </Text>
          <FlatList
            data={group.machines}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: machine }) => (
              <View style={styles.machineCard}>
                <Text style={styles.machineName}>{machine.name}</Text>
                <View style={styles.logHeader}>
                  <Text style={styles.logHeaderText}>Start</Text>
                  <Text style={styles.logHeaderText}>End</Text>
                  <Text style={styles.logHeaderText}>Status</Text>
                  <Text style={styles.logHeaderText}>Reason</Text>
                </View>
                {machine.logs.map((log, index) => (
                  <View key={index} style={styles.logRow}>
                    <Text style={styles.logText}>{log.start}</Text>
                    <Text style={styles.logText}>{log.end || '-'}</Text>
                    <Text
                      style={[
                        styles.logText,
                        { color: log.status === 'Running' ? 'green' : 'red' },
                      ]}
                    >
                      {log.status}
                    </Text>
                    <Text style={styles.logText}>{log.reason || '-'}</Text>
                  </View>
                ))}
              </View>
            )}
          />
        </View>
      ))}
    </ScrollView>
  );
};

export default TimescheduleTrack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 10,
  },
  largeContainer: {
    padding: 30,
  },
  mediumContainer: {
    padding: 20,
  },
  smallContainer: {
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  groupCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
  },
  groupSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 10,
  },
  machineCard: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
  },
  machineName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  logHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    width: '25%',
    textAlign: 'center',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  logText: {
    fontSize: 14,
    color: '#555',
    width: '25%',
    textAlign: 'center',
  },
});
