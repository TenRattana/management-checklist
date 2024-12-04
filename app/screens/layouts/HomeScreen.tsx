import React, { useState, useMemo, useEffect } from 'react';
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
import { timeSchedule } from './schedule/Mock';
import { AccessibleView } from '@/components';
import { useRes } from '@/app/contexts/useRes';
import useMasterdataStyles from '@/styles/common/masterdata';
import { formatTime, getCurrentTime } from '@/config/timezoneUtils';
import { Clock } from '@/components/common/Clock';

const HomeScreen = React.memo(() => {
  const { theme } = useTheme();
  const { spacing, fontSize } = useRes()
  const [currentDate, setCurrentDate] = useState<string>(getDate());
  const [isWeekView, setIsWeekView] = useState(false);
  const masterdataStyles = useMasterdataStyles();

  const timelineItems = parseTimeScheduleToTimeline(timeSchedule);
  const { markedDates, timeline } = convertScheduleToTimeline(timelineItems);

  const eventsByDate = useMemo(
    () => groupBy(timeline, (e) => CalendarUtils.getCalendarDateString(e.start)), []
  );

  const filteredEvents = useMemo(
    () => eventsByDate[currentDate] || [],
    [eventsByDate, currentDate]
  );

  // const time = useMemo(() => Clock(), [Clock])

  const tableData = useMemo(() => {
    return filteredEvents.map((item) => [
      item.title,
      formatTime(item.start),
      formatTime(item.end),
      item.summary || "",
      item.statustype
    ]);
  }, [filteredEvents]);

  const customtableProps = useMemo(() => {
    return {
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
  }, [tableData, filteredEvents]);

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
  }, [currentDate]);


  return (
    <AccessibleView name="container-home" style={styles.container}>
      <Card.Title
        title={`List  `}
        titleStyle={[masterdataStyles.textBold, styles.header]}
      />

      <CalendarProvider date={currentDate} key={`calendar-${currentDate}`} onDateChanged={setCurrentDate} theme={getTheme()} >
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
              key={`expand-calendar-${getCurrentTime()}`}
              theme={getTheme()}
              keyExtractor={(item, index) => `${item}-index-${index}`}
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
          {filteredEvents.length > 0 ? (
            <CustomTable {...customtableProps} />
          ) : (
            <View style={styles.noEventContainer} key={`view-nodata`}>
              <Text style={[masterdataStyles.text, { color: theme.colors.text }]}>
                No events available for this date.
              </Text>
            </View>
          )}
        </Card.Content>
      </CalendarProvider>
    </AccessibleView>
  );
});

export default HomeScreen;
