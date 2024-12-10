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
}

interface Machine {
  MachineID: string;
  MachineName: string;
  Track: Log[];
}

interface GroupMachine {
  GMachineID: string;
  GMachineName: string;
  Machines: Machine[];
}

const TimescheduleTrack = () => {
  const [screenSize, setScreenSize] = useState<'large' | 'medium' | 'small'>(
    'large'
  );

  const groupData: GroupMachine[] = [
    {
      GMachineID: "GM0000001",
      GMachineName: 'Group A',
      Machines: [
        {
          MachineID: "M00000001",
          MachineName: 'Machine A1',
          Track: [
            { start: '08:00 AM', end: '09:00 AM', status: 'Stopped' },
            { start: '09:30 AM', end: '10:00 AM', status: 'Stopped' },
            { start: '10:15 AM', end: null, status: 'Running' },
          ],
        },
        {
          MachineID: "M00000002",
          MachineName: 'Machine A2',
          Track: [
            { start: '07:30 AM', end: '08:15 AM', status: 'Stopped' },
            { start: '08:30 AM', end: '09:00 AM', status: 'Running' },
          ],
        },
      ],
    },
    {
      GMachineID: "GM0000002",
      GMachineName: 'Group B',
      Machines: [
        {
          MachineID: "M00000003",
          MachineName: 'Machine B1',
          Track: [
            { start: '08:15 AM', end: '08:45 AM', status: 'Stopped' },
            { start: '09:00 AM', end: '09:30 AM', status: 'Running' },
          ],
        },
      ],
    },
  ];

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
        <View key={group.GMachineID} style={styles.groupCard}>
          <Text style={styles.groupName}>{group.GMachineName}</Text>
          <Text style={styles.groupSubtitle}>
            Total Machines: {group.Machines.length}
          </Text>
          <FlatList
            data={group.Machines}
            keyExtractor={(item) => item.MachineID.toString()}
            renderItem={({ item: machine }) => (
              <View style={styles.machineCard}>
                <Text style={styles.machineName}>{machine.MachineName}</Text>
                <View style={styles.logHeader}>
                  <Text style={styles.logHeaderText}>Start</Text>
                  <Text style={styles.logHeaderText}>End</Text>
                  <Text style={styles.logHeaderText}>Status</Text>
                </View>
                {machine.Track.map((log, index) => (
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