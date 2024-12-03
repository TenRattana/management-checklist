import React, { useState, useMemo, useCallback } from 'react';
import {
  ExpandableCalendar,
  CalendarProvider,
  CalendarUtils,
  WeekCalendar,
} from 'react-native-calendars';
import { Card, FAB, IconButton, Divider } from 'react-native-paper';
import { ScrollView, Platform, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/app/contexts/useTheme';
import { getDate, parseTimeScheduleToTimeline } from '@/app/mocks/timeline';
import CustomTable from '@/components/Customtable';
import { groupBy } from 'lodash';
import { convertScheduleToTimeline, timeSchedule } from './schedule/Mock';

const HomeScreen = () => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(getDate());
  const [isWeekView, setIsWeekView] = useState(false);

  const timelineItems = parseTimeScheduleToTimeline(timeSchedule);
  console.log(timelineItems);

  const SS = convertScheduleToTimeline(timelineItems);

  const eventsByDate = useMemo(
    () => groupBy(SS, (e) => CalendarUtils.getCalendarDateString(e.start)),
    []
  );

  const onDateChanged = useCallback((date: string) => setCurrentDate(date), []);

  const filteredEvents = useMemo(
    () => eventsByDate[currentDate] || [],
    [eventsByDate, currentDate]
  );
  const handleAction = useCallback(() => { }, [])

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
      item.summary,
    ]);
  }, [filteredEvents]);

  const customtableProps = useMemo(() => ({
    Tabledata: tableData,
    Tablehead: [
      { label: "Event Title", align: "flex-start" },
      { label: "Start", align: "flex-start" },
      { label: "End", align: "flex-start" },
      { label: "Detail", align: "flex-start" },
    ],
    flexArr: [2, 2, 1, 3],
    actionIndex: [{}],
    showMessage: 2,
    searchQuery: " ",
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
          <IconButton
            icon={!isWeekView ? 'sort-calendar-descending' : 'sort-calendar-ascending'}
            size={24}
            style={styles.toggleButton}
            onPress={() => setIsWeekView(!isWeekView)}
          />
        </View>

        <ScrollView style={styles.eventsContainer}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Title
              title="Events"
              subtitle={`Ongoing events for ${currentDate}`}
              titleStyle={{ fontWeight: 'bold' }}
            />
            <Divider />
            <Card.Content>
              {filteredEvents.length > 0 ? (
                <CustomTable {...customtableProps} />
              ) : (
                <View style={styles.noEventContainer}>
                  <Text style={[styles.noEventText, { color: theme.colors.text }]}>
                    No events available for this date.
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </CalendarProvider>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        label={Platform.OS === 'web' ? 'Add Event' : undefined}
        onPress={() => console.log('Add Event')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    marginBottom: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  card: {
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },
  toggleButton: {
    alignSelf: 'flex-end',
    marginTop: 0,
    marginRight: 10,
    zIndex: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  noEventContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  noEventText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
