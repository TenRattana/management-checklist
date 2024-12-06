import React, { useState, useMemo, useCallback } from 'react';
import {
  ExpandableCalendar,
  CalendarProvider,
  CalendarUtils,
  WeekCalendar,
} from 'react-native-calendars';
import { Card, IconButton } from 'react-native-paper';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useTheme } from '@/app/contexts/useTheme';
import { convertScheduleToTimeline, getDate, getTheme, parseTimeScheduleToTimeline } from '@/app/mocks/timeline';
import CustomTable from '@/components/Customtable';
import { groupBy } from 'lodash';
import { AccessibleView, Customtable, LoadingSpinner } from '@/components';
import { useRes } from '@/app/contexts/useRes';
import useMasterdataStyles from '@/styles/common/masterdata';
import { formatTime } from '@/config/timezoneUtils';
import { TimeScheduleProps } from '@/typing/type';
import axiosInstance from '@/config/axios';
import { useQuery } from 'react-query';

const fetchTimeSchedules = async (): Promise<TimeScheduleProps[]> => {
  const response = await axiosInstance.post("TimeSchedule_service.asmx/GetSchedules");
  return response.data.data ?? [];
};

const HomeScreen = React.memo(() => {
  const { theme } = useTheme();
  const { spacing, fontSize } = useRes()
  const [currentDate, setCurrentDate] = useState<string>(getDate());
  const [isWeekView, setIsWeekView] = useState(true);
  const masterdataStyles = useMasterdataStyles();

  const { data: timeSchedule = [], isLoading } = useQuery<TimeScheduleProps[], Error>(
    'timeSchedule',
    fetchTimeSchedules,
    { refetchOnWindowFocus: true }
  );

  const timelineItems = useMemo(() => parseTimeScheduleToTimeline(timeSchedule), [timeSchedule, parseTimeScheduleToTimeline])

  const { markedDates, timeline } = useMemo(() => convertScheduleToTimeline(timelineItems), [timelineItems, convertScheduleToTimeline])

  const eventsByDate = useMemo(
    () => groupBy(timeline, (e) => CalendarUtils.getCalendarDateString(e.start)),
    [timeline]
  );

  const filteredEvents = eventsByDate[currentDate] || [];

  const tableData = filteredEvents.map((item) => [
    item.title,
    formatTime(item.start),
    formatTime(item.end),
    item.summary || "",
    item.statustype,
  ]);

  const customtableProps = {
    Tabledata: tableData,
    Tablehead: [
      { label: "Event Title", align: "flex-start" },
      { label: "Start", align: "flex-start" },
      { label: "End", align: "flex-start" },
      { label: "Detail", align: "flex-start" },
      { label: "Status", align: "center" },
    ],
    flexArr: [2, 2, 2, 3, 1],
    actionIndex: [{}],
    showMessage: 2,
    searchQuery: " ",
    showFilter: true,
    showData: filteredEvents,
    showColumn: "statustype",
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    calendarContainer: {
      borderRadius: 10,
    },
    eventsContainer: {
      flex: 1,
      paddingHorizontal: 10,
    },
    toggleButton: {
      alignSelf: 'flex-end',
      marginTop: 0,
      marginRight: 10,
      zIndex: 2,
    },
    noEventContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 100,
    },
    cardcontent: {
      marginTop: 3,
      padding: 2,
      flex: 1
    },
    header: {
      fontSize: spacing.large,
      marginTop: spacing.small,
      paddingVertical: fontSize === "large" ? 7 : 5
    },
  });

  const markedDatesS = useMemo(() => {
    return {
      ...markedDates,
      [currentDate]: { selected: true, selectedColor: theme.colors.drag, selectedTextColor: theme.colors.fff },
    };
  }, [currentDate, markedDates]);

  ExpandableCalendar.defaultProps = undefined

  const handleDateChange = useCallback((date: string) => {
    setCurrentDate(date);
  }, []);

  return (
    <AccessibleView name="container-home" style={styles.container}>
      <Card.Title
        title={`Schedule`}
        titleStyle={[masterdataStyles.textBold, styles.header]}
      />

      <CalendarProvider date={currentDate} key={`calendar-${currentDate}`} onDateChanged={handleDateChange} theme={getTheme()}>
        <View style={styles.calendarContainer} key={`calendar-view-${currentDate}`}>
          {isWeekView ? (
            <WeekCalendar
              firstDay={1}
              initialDate={currentDate}
              markedDates={markedDatesS}
              markingType="multi-dot"
              key={`week-calendar-${currentDate}`}
              theme={getTheme()}
            />
          ) : (
            <ExpandableCalendar
              firstDay={1}
              initialDate={currentDate}
              markedDates={markedDatesS}
              markingType="multi-dot"
              theme={getTheme()}
              animateScroll
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={5}
            />
          )}

          {Platform.OS === "web" && (
            <IconButton
              icon={!isWeekView ? "sort-calendar-descending" : "sort-calendar-ascending"}
              iconColor={theme.colors.onBackground}
              size={spacing.large}
              style={styles.toggleButton}
              onPress={() => setIsWeekView(!isWeekView)}
              key={`toggle-button-${currentDate}`}
            />
          )}
        </View>

        <Card.Content style={styles.cardcontent}>
          {isLoading ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
        </Card.Content>
      </CalendarProvider>
    </AccessibleView>
  );
});

export default HomeScreen;
