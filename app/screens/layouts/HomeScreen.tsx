import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import { convertScheduleToTimeline, getDate, parseTimeScheduleToTimeline } from '@/app/mocks/timeline';
import { AccessibleView, Customtable, LoadingSpinner } from '@/components';
import { Clock } from '@/components/common/Clock';
import Home_dialog from '@/components/screens/Home_dialog';
import axiosInstance from '@/config/axios';
import { formatTime, getCurrentTime } from '@/config/timezoneUtils';
import useMasterdataStyles from '@/styles/common/masterdata';
import { TimeScheduleProps } from '@/typing/type';
import { groupBy } from 'lodash';
import moment from 'moment-timezone';
import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { Calendar, CalendarProvider, CalendarUtils, DateData, Timeline, TimelineList, TimelineListRenderItemInfo, TimelineProps } from 'react-native-calendars';
import { Card, Checkbox, Icon, IconButton } from 'react-native-paper';
import Animated, { Easing, FadeIn, FadeOut, runOnJS } from 'react-native-reanimated';
import { useQuery } from 'react-query';

const fetchTimeSchedules = async (): Promise<TimeScheduleProps[]> => {
  const response = await axiosInstance.post("TimeSchedule_service.asmx/GetSchedules");
  return response.data.data ?? [];
};

FadeIn.duration(300).easing(Easing.out(Easing.ease))
FadeOut.duration(300).easing(Easing.out(Easing.ease))

const categories = [
  { id: '1', title: 'Schedule Daily', time: '5h00', color: '#27ae60' },
  { id: '2', title: 'Schedule Weekly', time: '3h00', color: '#2980b9' },
  { id: '3', title: 'Schedule Custom', time: '1h00', color: '#8e44ad' },
];

const RenderEvent = ({ event }: { event: any }) => {
  const masterdataStyles = useMasterdataStyles();

  const styles = StyleSheet.create({
    container: {
      padding: 10,
      borderRadius: 8,
      width: event?.width ?? 100,
      height: event?.height ?? 50,
      marginVertical: 4,
    },
    title: {
      color: masterdataStyles.textFFF.color,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={[masterdataStyles.text, masterdataStyles.textFFF, styles.title]}>{event?.title || 'Untitled Event'}</Text>

      <Text style={[masterdataStyles.text, masterdataStyles.textFFF]}>
        {`${formatTime(event?.start, 'HH:mm:ss')} - ${formatTime(event?.end, 'HH:mm:ss')}`}
      </Text>
      {event?.summary && <Text style={[masterdataStyles.text, masterdataStyles.textFFF]}>{event.summary}</Text>}
    </View>
  );
}

const HomeScreen = () => {
  const { theme, darkMode } = useTheme();
  const { responsive, spacing } = useRes();
  const [currentDate, setCurrentDate] = useState<string>(getDate());
  const [filterStatus, setFilterStatus] = useState<'all' | 'end' | 'running' | 'wait' | 'stop'>('all');
  const [filterTitle, setFilterTitle] = useState<string[]>(["Daily", "Weekly", "Custom"]);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const masterdataStyles = useMasterdataStyles()

  const { data: timeSchedule = [] } = useQuery<TimeScheduleProps[], Error>(
    'timeSchedule',
    fetchTimeSchedules,
    { refetchOnWindowFocus: true }
  );

  const [checkedItems, setCheckedItems] = useState<Record<any, boolean>>({ 1: true, 2: true, 3: true });

  const toggleCheckbox = useCallback((id: string, title: string) => {
    const secondPart = title.split(" ")[1] || "";

    setCheckedItems((prevState) => {
      const updatedCheckedState = { ...prevState, [id]: !prevState[id] };

      if (updatedCheckedState[id]) {
        runOnJS(setFilterTitle)((prevFilter) =>
          prevFilter.includes(secondPart) ? prevFilter : [...prevFilter, secondPart]
        );
      } else {
        runOnJS(setFilterTitle)((prevFilter) => prevFilter.filter((value) => value !== secondPart));
      }

      return updatedCheckedState;
    });
  }, [filterTitle, checkedItems]);

  const timelineItems = useMemo(() => parseTimeScheduleToTimeline(timeSchedule), [timeSchedule]);

  const { markedDates, timeline } = useMemo(() => convertScheduleToTimeline(timelineItems), [timelineItems]);

  const eventsByDate = useMemo(
    () => groupBy(timeline, (e) => CalendarUtils.getCalendarDateString(e.start)),
    [timeline]
  );

  const markedDatesS = useMemo(() => {
    return {
      ...markedDates,
      [currentDate]: { selected: true, selectedColor: theme.colors.drag, selectedTextColor: theme.colors.fff },
    };
  }, [currentDate, markedDates]);

  const initialTime = {
    hour: getCurrentTime().getHours(),
    minutes: getCurrentTime().getMinutes(),
  };

  const eventsByDateS = useMemo(() => {
    const filteredEvents = eventsByDate[currentDate]?.filter(event => {
      const statusMatches = filterStatus === "all" || event.statustype === filterStatus;

      const typeMatches = filterTitle.includes(event.type as string);

      return statusMatches && typeMatches;
    }) || [];


    const groupedEvents = groupBy(filteredEvents, (event) => {
      if (event.start && typeof event.start === 'string') {
        const datePart = moment(event.start).format('YYYY-MM-DD');
        return datePart;
      }
      return 'invalid_date';
    });

    return groupedEvents;
  }, [timeSchedule, filterStatus, currentDate, filterTitle]);


  const styles = StyleSheet.create({
    calendarContainer: {
      flex: 1,
      width: responsive === "small" ? 0 : responsive === "medium" ? 300 : 450,
      borderRightWidth: 1,
      borderColor: '#eaeaea',
      padding: 10,
    },
    calendar: {
      borderRadius: 10,
      padding: 10,
    },
    cardcontent: {
      paddingTop: 10,
      paddingBottom: 10,
    },
    timelineContainer: {
      flex: 1,
      padding: 10,
    },
    timelineListContainer: {
      flex: 1,
    },
    filterContainer: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    filterButton: {
      color: theme.colors.blue,
      fontSize: spacing.small,
      marginHorizontal: 10,
      marginTop: 10
    },
    filterButtonActive: {
      color: theme.colors.field,
      fontSize: spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.drag,
      marginHorizontal: 10,
      marginTop: 10,
    },
    containerCata: {
      padding: 20,
      borderRadius: 10,
      backgroundColor: '#f8f9fa',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      marginLeft: 10
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  const toggleSwitch = useCallback(() => {
    runOnJS(setShowCalendar)(!showCalendar);
  }, [showCalendar]);

  const handleEventClick = (event: any) => {
    runOnJS(setSelectedEvent)(event);
    runOnJS(setDialogVisible)(true);
  };

  const renderItem = (timelineProps: TimelineProps, info: TimelineListRenderItemInfo) => {
    return (
      <Timeline
        {...timelineProps}
        theme={getTheme()}
        onEventPress={handleEventClick}
        renderEvent={(event) => <RenderEvent event={event} />}
      />
    );
  };

  const hideDialog = () => runOnJS(setDialogVisible)(false);

  const timelineProps = useMemo(() => {
    return {
      format24h: true,
      overlapEventsSpacing: 8,
      rightEdgeSpacing: 8,
      start: 0,
      end: 24,
      unavailableHours: [{ start: 0, end: getCurrentTime().getHours() }],
      unavailableHoursColor: darkMode ? '#484848' : "#f0f0f0",
      styles: {
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        timelineContainer: {
          backgroundColor: theme.colors.background,
          borderRadius: 8
        },
        event: {
          backgroundColor: '#e3f2fd',
          borderRadius: 8,
          padding: 8,
          margin: 4,
        },
        eventTitle: {
          color: theme.colors.fff,
          fontSize: spacing.small,
          fontWeight: 'bold',
        },
        eventSummary: {
          color: theme.colors.fff,
          fontSize: spacing.small,
        },
        eventTimes: {
          color: theme.colors.fff,
          fontSize: spacing.small,
        },

      },
    }
  }, [])

  function getTheme() {
    return {
      calendarBackground: theme.colors.background,

      textMonthFontFamily: 'Poppins',
      monthTextColor: theme.colors.onBackground,
      textMonthFontSize: spacing.medium,

      textSectionTitleColor: theme.colors.onBackground,
      textDayHeaderFontFamily: 'Poppins',
      textDayHeaderFontSize: spacing.small,

      dayTextColor: theme.colors.onBackground,
      textDayFontFamily: 'Poppins',
      todayTextColor: theme.colors.primary,
      textDayFontSize: spacing.small,

      selectedDayTextColor: theme.colors.blue,
      selectedDayBackgroundColor: theme.colors.primary,

      textDisabledColor: theme.colors.drag,

      dotColor: theme.colors.primary,
      selectedDotColor: theme.colors.accent,
    };
  }

  return (
    <AccessibleView name="container-Home" style={{ flex: 1 }}>
      <CalendarProvider
        date={currentDate}
        onDateChanged={runOnJS(setCurrentDate)}
        disabledOpacity={0.6}
        theme={getTheme()}
        showTodayButton
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {showCalendar && (
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
            >
              <View style={styles.calendarContainer}>
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                      <Checkbox
                        status={checkedItems?.[item.id] ? 'checked' : 'unchecked'}
                        onPress={() => runOnJS(toggleCheckbox)(item.id, item.title)}
                        color={item.color}
                      />
                      <Text style={[masterdataStyles.text, { color: item.color, paddingLeft: 5 }]}>{item.title}</Text>
                    </View>
                  )}
                  ListHeaderComponent={() => (
                    <>
                      <Calendar
                        onDayPress={(day: DateData) => runOnJS(setCurrentDate)(day.dateString)}
                        markedDates={markedDatesS}
                        markingType="multi-dot"
                        style={styles.calendar}
                        theme={getTheme()}
                      />
                      <Text style={[masterdataStyles.text, masterdataStyles.textBold, { marginBottom: 15 }]}>Schedule Type</Text>
                    </>
                  )}
                  style={{ marginTop: 20, flex: 1 }}
                />
              </View>
            </Animated.View>
          )}

          <View style={styles.timelineContainer}>
            <TouchableOpacity onPress={toggleSwitch} style={{ flexDirection: 'row', alignItems: 'center', width: 100 }}>
              <Icon source={!showCalendar ? "chevron-double-right" : "chevron-double-left"} size={spacing.large} color={theme.colors.drag} />
              <Text style={[styles.filterButton, { alignSelf: 'center', marginVertical: 10, fontSize: spacing.small + 2 }]}>show</Text>
            </TouchableOpacity>

            <View style={styles.filterContainer}>
              <TouchableOpacity onPress={() => runOnJS(setFilterStatus)('all')}>
                <Text style={filterStatus === "all" ? styles.filterButtonActive : styles.filterButton}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => runOnJS(setFilterStatus)('end')}>
                <Text style={filterStatus === "end" ? styles.filterButtonActive : styles.filterButton}>Ended</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => runOnJS(setFilterStatus)('running')}>
                <Text style={filterStatus === "running" ? styles.filterButtonActive : styles.filterButton}>Running</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => runOnJS(setFilterStatus)('wait')}>
                <Text style={filterStatus === "wait" ? styles.filterButtonActive : styles.filterButton}>Waiting</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => runOnJS(setFilterStatus)('stop')}>
                <Text style={filterStatus === "stop" ? styles.filterButtonActive : styles.filterButton}>Stop</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timelineListContainer}>
              <Text style={[masterdataStyles.text, masterdataStyles.textBold, { marginBottom: 10, fontSize: spacing.medium }]}>
                {currentDate} - {Clock()} - Timeline
              </Text>
              <TimelineList
                events={eventsByDateS}
                timelineProps={timelineProps}
                showNowIndicator
                scrollToNow
                initialTime={initialTime}
                renderItem={renderItem}
              />
            </View>
          </View>
        </View>

        <Home_dialog dialogVisible={dialogVisible} hideDialog={hideDialog} selectedEvent={selectedEvent} key={`Home_dialog`} />

      </CalendarProvider>
    </AccessibleView>
  );
};

export default HomeScreen;
