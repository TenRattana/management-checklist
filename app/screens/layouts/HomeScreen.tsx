import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import { convertScheduleToTimeline, getDate, getTheme, parseTimeScheduleToTimeline, TimeLine } from '@/app/mocks/timeline';
import { Customtable, LoadingSpinner } from '@/components';
import axiosInstance from '@/config/axios';
import { formatTime } from '@/config/timezoneUtils';
import useMasterdataStyles from '@/styles/common/masterdata';
import { TimeScheduleProps } from '@/typing/type';
import { groupBy } from 'lodash';
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, CalendarProvider, CalendarUtils, DateData, Timeline, TimelineList, TimelineListRenderItemInfo, TimelineProps } from 'react-native-calendars';
import { Card } from 'react-native-paper';
import { useQuery } from 'react-query';

interface EventItem {
  start: string;
  end: string;
  title: string;
  summary: string;
  color?: string;
  statustype: 'end' | 'running' | 'wait'; // Added status type
}

const fetchTimeSchedules = async (): Promise<TimeScheduleProps[]> => {
  const response = await axiosInstance.post("TimeSchedule_service.asmx/GetSchedules");
  return response.data.data ?? [];
};

const Render = ({ item }: any) => {
  const masterdataStyles = useMasterdataStyles();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      flexBasis: 300
    },
    eventBlock: {
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      marginHorizontal: 8,
      width: '100%',
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.eventBlock}>
      <Text style={[masterdataStyles.text, masterdataStyles.textBold]}>{item.title}</Text>
      <Text style={masterdataStyles.text}>
        {formatTime(item.start, "HH:mm:ss")} - {formatTime(item.end, "HH:mm:ss")}
      </Text>
      <Text style={masterdataStyles.text}>{item.summary}</Text>
    </View>
  );
}

const HomeScreen = () => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState<string>(getDate());
  const [filterStatus, setFilterStatus] = useState<'all' | 'end' | 'running' | 'wait' | 'stop'>('all');

  const { data: timeSchedule = [], isLoading } = useQuery<TimeScheduleProps[], Error>(
    'timeSchedule',
    fetchTimeSchedules,
    { refetchOnWindowFocus: true }
  );

  const timelineItems = useMemo(() => parseTimeScheduleToTimeline(timeSchedule), [timeSchedule]);

  const { markedDates, timeline } = useMemo(() => convertScheduleToTimeline(timelineItems), [timelineItems]);

  const eventsByDate = useMemo(
    () => groupBy(timeline, (e) => CalendarUtils.getCalendarDateString(e.start)),
    [timeline]
  );

  const filteredEvents = useMemo(() => {
    const events = eventsByDate[currentDate] || [];
    if (filterStatus === 'all') return events;

    return events.filter(event => event.statustype === filterStatus);
  }, [eventsByDate, currentDate, filterStatus]);

  const markedDatesS = useMemo(() => {
    return {
      ...markedDates,
      [currentDate]: { selected: true, selectedColor: theme.colors.drag, selectedTextColor: theme.colors.fff },
    };
  }, [currentDate, markedDates]);

  const timelineProps = {
    format24h: true,
    overlapEventsSpacing: 8,
    scrollToNow: true,
    rightEdgeSpacing: 24,
  };

  const customTheme = {
    timelineContainer: {
      maxWidth: 200,
      width: '100%',
      overflow: 'hidden',
    },
    contentStyle: {
      maxWidth: 200,
      flex: 1,
    },
    timelineListContainer: {
      flexDirection: 'column',
      paddingHorizontal: 10,
      paddingTop: 10,
    }
  };

  const renderItem = (timelineProps: TimelineProps, info: TimelineListRenderItemInfo) => {
    return (
      <Timeline
        {...timelineProps}
        renderEvent={(item) => <Render item={item} />}
      />
    );
  };

  const tableData = filteredEvents.map((item) => [
    item.title,
    item.summary || "",
    item.statustype,
  ]);

  const customtableProps = {
    Tabledata: tableData,
    Tablehead: [
      { label: "Event Title", align: "flex-start" },
      { label: "Detail", align: "flex-start" },
      { label: "Status", align: "center" },
    ],
    flexArr: [2, 2, 2, 3, 1],
    actionIndex: [{}],
    showMessage: 2,
    searchQuery: " ",
  };

  const eventsByDateS = useMemo(() => {
    const filteredEvents = eventsByDate[currentDate].filter(event => event.statustype === filterStatus);

    const groupedEvents = groupBy(filteredEvents, (event) => {
      if (event.start && typeof event.start === 'string') {
        const datePart = event.start.split('T')[0];
        return datePart;
      }
      return 'invalid_date';
    });

    return groupedEvents;
  }, [timeSchedule, filterStatus, currentDate]);

  return (
    <CalendarProvider
      date={currentDate}
      onDateChanged={setCurrentDate}
      showTodayButton
      disabledOpacity={0.6}
      theme={{ ...getTheme(), ...customTheme }}
    >
      <View style={styles.container}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day: DateData) => setCurrentDate(day.dateString)}
            markedDates={markedDatesS}
            markingType="multi-dot"
            style={styles.calendar}
          />
          <Card.Content style={styles.cardcontent}>
            {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
          </Card.Content>
        </View>

        <View style={styles.timelineContainer}>
          <View style={styles.filterContainer}>
            <TouchableOpacity onPress={() => setFilterStatus('all')}>
              <Text style={styles.filterButton}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterStatus('end')}>
              <Text style={styles.filterButton}>Ended</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterStatus('running')}>
              <Text style={styles.filterButton}>Running</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterStatus('wait')}>
              <Text style={styles.filterButton}>Waiting</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterStatus('stop')}>
              <Text style={styles.filterButton}>Stop</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.timelineTitle}>
            {currentDate} - Timeline
          </Text>

          <View style={styles.timelineListContainer}>
            <TimelineList
              events={eventsByDateS}
              timelineProps={timelineProps}
              showNowIndicator
              renderItem={renderItem}
            />
          </View>
        </View>
      </View>
    </CalendarProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
  },
  calendarContainer: {
    width: 450,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    backgroundColor: '#fff',
    padding: 10,
  },
  calendar: {
    borderRadius: 8,
    width: 430,
  },
  timelineContainer: {
    flex: 2,
    padding: 16,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timelineListContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  cardcontent: {
    marginTop: 10,
    flex: 1
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterButton: {
    padding: 8,
    marginHorizontal: 5,
    backgroundColor: '#ddd',
    borderRadius: 4,
  },
});

export default HomeScreen;
