import React, { useState, useMemo } from 'react';
import {
  ExpandableCalendar,
  CalendarProvider,
  CalendarUtils,
  WeekCalendar,
} from 'react-native-calendars';
import { AccessibleView, LoadingSpinner, Text } from "@/components";
import groupBy from 'lodash/groupBy';
import { useRes } from '@/app/contexts/useRes';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useTheme } from '@/app/contexts/useTheme';
import { Icon } from 'react-native-paper';
import { getDate, timelineEvents } from '@/app/mocks/timeline';
import { getCurrentTime } from '@/config/timezoneUtils';
const Customtable = React.lazy(() => import('@/components/Customtable'))

const HomeScreen = React.memo(() => {
  const [currentDate, setCurrentDate] = useState(getDate());
  const [eventsByDate, setEventsByDate] = useState(() =>
    groupBy(timelineEvents, (e) => CalendarUtils.getCalendarDateString(e.start))
  );
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const masterdataStyles = useMasterdataStyles();
  const [week, setWeek] = useState<boolean>(false)
  const { spacing, fontSize } = useRes()
  const { theme } = useTheme()

  const markedDates = {
    [`${getDate(-1)}`]: { marked: true },
    [`${getDate()}`]: { marked: true },
    [`${getDate(1)}`]: { marked: true },
  };

  const onDateChanged = (date: string) => {
    setCurrentDate(date);
  };

  const onMonthChange = (month: any) => {
  };

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  const filteredEvents = Object.keys(eventsByDate).reduce((acc, date) => {
    const eventsForDate = eventsByDate[date].filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      const eventStartHour = eventStart.getHours();
      const eventEndHour = eventEnd.getHours();

      const isEventOngoing =
        (currentHour > eventStartHour || (currentHour === eventStartHour && currentMinute >= eventStart.getMinutes())) &&
        (currentHour < eventEndHour || (currentHour === eventEndHour && currentMinute <= eventEnd.getMinutes()));

      return isEventOngoing;
    });

    if (eventsForDate.length > 0) {
      acc[date] = eventsForDate;
    }

    return acc;
  }, {} as Record<string, typeof timelineEvents>);

  const tableData = useMemo(() => {
    return filteredEvents[currentDate]?.map((item) => [
      item.title,
      item.start,
      item.end,
      item.status ? "running" : "wait",
      item.summary,
    ]) || [];
  }, [filteredEvents, currentDate]);

  const customtableProps = useMemo(() => ({
    Tabledata: tableData,
    Tablehead: [
      { label: "Even title", align: "flex-start" },
      { label: "Start", align: "flex-start" },
      { label: "End", align: "flex-start" },
      { label: "Status", align: "center" },
      { label: "Detail", align: "flex-start" },
    ],
    flexArr: [2, 2, 2, 2, 2],
    actionIndex: [{}],
    showMessage: 1,
    searchQuery: debouncedSearchQuery,
  }), [tableData, debouncedSearchQuery]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      fontSize: spacing.large,
      marginTop: spacing.small,
      paddingVertical: fontSize === "large" ? 7 : 5
    },
    functionname: {
      textAlign: 'center'
    },
    cardcontent: {
      padding: 2,
      flex: 1
    }
  })

  return (
    <AccessibleView name="container-home" style={styles.container}>
      <CalendarProvider
        date={currentDate}
        onDateChanged={onDateChanged}
        onMonthChange={onMonthChange}
        showTodayButton
        disabledOpacity={0.6}
      >
        {week ? (
          <WeekCalendar firstDay={1} markedDates={markedDates} />
        ) : (
          <ExpandableCalendar firstDay={1} markedDates={markedDates} />
        )}

        {Platform.OS === "web" && (
          <>
            <TouchableOpacity onPress={() => setWeek(!week)} style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginVertical: 10 }}>
              <Icon source={week ? "chevron-double-down" : "chevron-double-up"} size={spacing.large} />
              <Text style={[masterdataStyles.text, { paddingHorizontal: 10 }]}>{week ? "Weekly" : "Monthly"}</Text>
            </TouchableOpacity>
          </>
        )}

        <AccessibleView name="container-table" style={styles.cardcontent}>
          {false ? <LoadingSpinner /> : <Customtable {...customtableProps} />}
        </AccessibleView>
      </CalendarProvider>
    </AccessibleView>
  );
});

export default HomeScreen;
