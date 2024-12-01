import React, { useState, useMemo, useCallback } from 'react';
import {
  ExpandableCalendar,
  CalendarProvider,
  CalendarUtils,
  WeekCalendar,
} from 'react-native-calendars';
import { Card, FAB, IconButton, Divider } from 'react-native-paper';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/contexts/useTheme';
import { getDate, timelineEvents } from '@/app/mocks/timeline';
import CustomTable from '@/components/Customtable';
import { groupBy } from 'lodash';

const HomeScreen = () => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(getDate());
  const [isWeekView, setIsWeekView] = useState(false);

  // Group events by date
  const eventsByDate = useMemo(
    () => groupBy(timelineEvents, (e) => CalendarUtils.getCalendarDateString(e.start)),
    []
  );

  const onDateChanged = useCallback((date: string) => setCurrentDate(date), []);

  // Filtered events for the selected date
  const filteredEvents = useMemo(
    () => eventsByDate[currentDate] || [],
    [eventsByDate, currentDate]
  );

  // Marked dates for calendar
  const markedDates = useMemo(() => {
    return {
      [`${getDate(-1)}`]: { marked: true, dotColor: theme.colors.primary },
      [`${getDate(0)}`]: { marked: true, dotColor: theme.colors.secondary },
      [`${getDate(1)}`]: { marked: true, dotColor: theme.colors.accent },
    };
  }, [theme]);

  const tableData = useMemo(() => {
    return filteredEvents.map((item) => [
      item.title,
      item.start,
      item.end,
      item.status ? "Running" : "Waiting",
      item.summary,
    ]);
  }, [filteredEvents]);

  console.log(tableData);
  
  const customtableProps = useMemo(() => ({
    Tabledata: tableData,
    Tablehead: [
      { label: "Event Title", align: "flex-start" },
      { label: "Start", align: "flex-start" },
      { label: "End", align: "flex-start" },
      { label: "Status", align: "center" },
      { label: "Detail", align: "flex-start" },
    ],
    flexArr: [2, 2, 2, 1, 3],
    actionIndex: [{}],
    showMessage: true, 
    searchQuery: ""
  }), [tableData]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CalendarProvider date={currentDate} onDateChanged={onDateChanged}>
        <View style={styles.calendarContainer}>
          {isWeekView ? (
            <WeekCalendar firstDay={1} markedDates={markedDates} />
          ) : (
            <ExpandableCalendar firstDay={1} markedDates={markedDates} />
          )}
        </View>

        {Platform.OS === 'web' && (
          <IconButton
            icon={isWeekView ? 'calendar-month-outline' : 'calendar-week-outline'}
            size={24}
            style={styles.toggleButton}
            onPress={() => setIsWeekView(!isWeekView)}
          />
        )}

        <Card style={styles.card}>
          <Card.Title title="Events" subtitle="Today's ongoing events" />
          <Divider />
          <Card.Content>
            <CustomTable {...customtableProps} />
          </Card.Content>
        </Card>

        <FAB
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          icon="plus"
          onPress={() => console.log('Add Event')}
        />
      </CalendarProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  calendarContainer: {
    marginBottom: 10,
  },
  card: {
    marginVertical: 10,
    elevation: 3,
  },
  toggleButton: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default HomeScreen;
