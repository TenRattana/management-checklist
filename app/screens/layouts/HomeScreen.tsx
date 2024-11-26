import React, { useState, useEffect, useMemo } from 'react';
import {
  ExpandableCalendar,
  TimelineEventProps,
  CalendarProvider,
  CalendarUtils,
} from 'react-native-calendars';
import { AccessibleView, Customtable, LoadingSpinner, Text } from "@/components";
import groupBy from 'lodash/groupBy';

const EVENT_COLOR = '#e6add8';
const today = new Date();
const getDate = (offset = 0) => CalendarUtils.getCalendarDateString(new Date().setDate(today.getDate() + offset));

const timelineEvents: TimelineEventProps[] = [
  {
    start: `${getDate(-1)} 09:20:00`,
    end: `${getDate(-1)} 12:00:00`,
    title: 'Merge Request to React Native Calendars',
    summary: 'Merge Timeline Calendar to React Native Calendars',
  },
  {
    start: `${getDate()} 01:15:00`,
    end: `${getDate()} 02:30:00`,
    title: 'Meeting A',
    summary: 'Summary for meeting A',
    color: EVENT_COLOR,
  },
  {
    start: `${getDate(-1)} 09:20:00`,
    end: `${getDate(-1)} 12:00:00`,
    title: 'Merge Request to React Native Calendars',
    summary: 'Merge Timeline Calendar to React Native Calendars',
  },
  {
    start: `${getDate()} 01:15:00`,
    end: `${getDate()} 02:30:00`,
    title: 'Meeting A',
    summary: 'Summary for meeting A',
    color: EVENT_COLOR,
  },
  {
    start: `${getDate()} 04:30:00`,
    end: `${getDate()} 05:30:00`,
    title: 'Meeting F',
    summary: 'Summary for meeting F',
    color: EVENT_COLOR,
  },
  {
    start: `${getDate(1)} 00:30:00`,
    end: ` ${getDate(1)} 01:30:00`,
    title: 'Visit Grand Mother',
    summary: 'Visit Grand Mother and bring some fruits.',
    color: 'lightblue',
  },
  {
    start: `${getDate()} 00:30:00`,
    end: `${getDate()} 23:30:00`,
    title: 'Visit Grand Mother',
    summary: 'Visit Grand Mother and bring some fruits.',
    color: 'lightblue',
  },
  {
    start: `${getDate()} 00: 30:00`,
    end: `${getDate()} 23: 30:00`,
    title: 'Visit Grand Mother',
    summary: 'Visit Grand Mother and bring some fruits.',
    color: 'lightblue',
  },
  {
    start: `${getDate()} 00: 30:00`,
    end: `${getDate()} 23: 30:00`,
    title: 'Visit Grand Mother',
    summary: 'Visit Grand Mother and bring some fruits.',
    color: 'lightblue',
  },
  {
    start: `${getDate()} 00: 30:00`,
    end: `${getDate()} 23: 30:00`,
    title: 'Visit Grand Mother',
    summary: 'Visit Grand Mother and bring some fruits.',
    color: 'lightblue',
  },
  {
    start: ` ${getDate()} 00: 30:00`,
    end: `${getDate()} 23: 30:00`,
    title: 'Visit Grand Mother',
    summary: 'Visit Grand Mother and bring some fruits.',
    color: 'lightblue',
  },
  {
    start: `${getDate(-1)} 00: 30:00`,
    end: `${getDate(-1)} 23: 30:00`,
    title: 'Visit Grand Mother',
    summary: 'Visit Grand Mother and bring some fruits.',
    color: 'lightblue',
  },
];

const HomeScreen = () => {
  const [currentDate, setCurrentDate] = useState(getDate());
  const [eventsByDate, setEventsByDate] = useState(() =>
    groupBy(timelineEvents, (e) => CalendarUtils.getCalendarDateString(e.start))
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const markedDates = {
    [`${getDate(-1)}`]: { marked: true },
    [`${getDate()}`]: { marked: true },
    [`${getDate(1)}`]: { marked: true },
  };

  const onDateChanged = (date: string) => {
    console.log('Date changed:', date);
    setCurrentDate(date);
  };

  const onMonthChange = (month: any) => {
    console.log('Month changed:', month);
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
  }, {} as Record<string, TimelineEventProps[]>);

  const tableData = useMemo(() => {
    return filteredEvents[currentDate]?.map((item) => [
      item.title,
      item.start,
      item.end,
      item.summary,
    ])  || [];
  }, [filteredEvents]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  const customtableProps = useMemo(() => ({
    Tabledata: tableData,
    Tablehead: [
      { label: "Even title", align: "flex-start" },
      { label: "Start", align: "flex-start" },
      { label: "End", align: "flex-start" },
      { label: "Summary", align: "flex-start" },
    ],
    flexArr: [2, 2, 2, 2],
    actionIndex: [{ }],
    showMessage: 1,
    searchQuery: debouncedSearchQuery,
  }), [tableData ,debouncedSearchQuery]);

  return (
    <CalendarProvider
      date={currentDate}
      onDateChanged={onDateChanged}
      onMonthChange={onMonthChange}
      showTodayButton
      disabledOpacity={0.6}
    >
      <ExpandableCalendar firstDay={1} markedDates={markedDates} />

      <AccessibleView name="Current" style={{ padding: 10 }}>
        <Text style={{ fontSize: 18 }}>
          Current Time: {currentTime.toLocaleTimeString()}
        </Text>
      </AccessibleView>

      {false ? <LoadingSpinner /> : <Customtable {...customtableProps} />}

    </CalendarProvider>
  );
};

export default HomeScreen;
