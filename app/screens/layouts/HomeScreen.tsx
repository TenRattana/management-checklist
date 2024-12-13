import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';
import { convertScheduleToTimeline, getDate, parseTimeScheduleToTimeline } from '@/app/mocks/timeline';
import { Text } from '@/components';
// import { Clock } from '@/components/common/Clock';
import Home_dialog from '@/components/screens/Home_dialog';
import Timelines from '@/components/screens/TimeLines';
import axiosInstance from '@/config/axios';
import { formatTime, getCurrentTime } from '@/config/timezoneUtils';
import useMasterdataStyles from '@/styles/common/masterdata';
import { TimeScheduleProps } from '@/typing/type';
import { groupBy } from 'lodash';
import moment from 'moment-timezone';
import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Calendar, CalendarProvider, CalendarUtils, DateData, Timeline, TimelineListRenderItemInfo, TimelineProps } from 'react-native-calendars';
import { Checkbox, Icon } from 'react-native-paper';
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

const HomeScreen = React.memo(() => {
  const { theme, darkMode } = useTheme();
  const { responsive, spacing } = useRes();
  const [currentDate, setCurrentDate] = useState<string>(getDate());
  const [filterStatus, setFilterStatus] = useState<string>('running');
  const [filterTitle, setFilterTitle] = useState<string[]>(["Daily", "Weekly", "Custom"]);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const masterdataStyles = useMasterdataStyles()

  const { data: timeSchedule = [] } = useQuery<TimeScheduleProps[], Error>('timeSchedule', fetchTimeSchedules);

  const [checkedItems, setCheckedItems] = useState<Record<any, boolean>>({ 1: true, 2: true, 3: true });

  const toggleCheckbox = useCallback((id: string, title: string) => {
    setCheckedItems((prevState) => {
      const updatedCheckedState = { ...prevState, [id]: !prevState[id] };
      const secondPart = title.split(" ")[1] || "";

      setFilterTitle((prevFilter) => {
        if (updatedCheckedState[id]) {
          return prevFilter.includes(secondPart) ? prevFilter : [...prevFilter, secondPart];
        }
        return prevFilter.filter((value) => value !== secondPart);
      });

      return updatedCheckedState;
    });
  }, []);

  const timelineItems = parseTimeScheduleToTimeline(timeSchedule);

  const { markedDates, timeline } = convertScheduleToTimeline(timelineItems);

  const eventsByDate = groupBy(timeline, (e) => CalendarUtils.getCalendarDateString(e.start))

  const markedDatesS = useMemo(() => ({
    ...markedDates,
    [currentDate]: { selected: true, selectedColor: theme.colors.drag, selectedTextColor: theme.colors.fff },
  }), [currentDate, markedDates]);

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
  }, [filterStatus, currentDate, filterTitle, eventsByDate]);


  const styles = StyleSheet.create({
    calendarContainer: {
      flex: 1,
      width: responsive === "small" ? "100%" : responsive === "medium" ? 300 : 450,
      borderRightWidth: 1,
      borderColor: '#eaeaea',
      padding: 10,
    },
    calendar: {
      borderRadius: 10,
      padding: 10,
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
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      marginLeft: 10
    },
  });

  const toggleSwitch = useCallback(() => {
    setShowCalendar(!showCalendar);
  }, [showCalendar]);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setDialogVisible(true);
  };

  const renderItem = (timelineProps: TimelineProps, info: TimelineListRenderItemInfo) => {
    return (
      <Timeline
        {...timelineProps}
        theme={getTheme}
        onEventPress={handleEventClick}
        renderEvent={(event) => <RenderEvent event={event} />}
      />
    );
  };

  const getTheme = useMemo(() => {
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
  }, [darkMode])

  const MemoTimelines = React.memo(Timelines)
  const MemoHome_dialog = React.memo(Home_dialog)

  return (
    <View id="container-Home" style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CalendarProvider
        date={currentDate}
        onDateChanged={runOnJS(setCurrentDate)}
        disabledOpacity={0.6}
        theme={getTheme}
        showTodayButton
      >
        <View style={{ flex: 1, flexDirection: responsive === "small" ? 'column' : 'row' }}>
          {showCalendar && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <View style={styles.calendarContainer}>
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item.id}
                  getItemLayout={(data, index) => ({ length: 50, offset: 50 * index, index })}
                  renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                      <Checkbox
                        status={checkedItems?.[item.id] ? 'checked' : 'unchecked'}
                        onPress={() => toggleCheckbox(item.id, item.title)}
                        color={item.color}
                      />
                      <Text style={[masterdataStyles.text, { color: item.color, paddingLeft: 5 }]}>{item.title}</Text>
                    </View>
                  )}
                  ListHeaderComponent={() => (
                    <>
                      <Calendar
                        onDayPress={(day: DateData) => setCurrentDate(day.dateString)}
                        markedDates={markedDatesS}
                        markingType="multi-dot"
                        style={styles.calendar}
                        theme={getTheme}
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
              {[{ la: "All", va: "all" }, { la: "End", va: "end" }, { la: "Running", va: "running" }, { la: "Waiting", va: "wait" }, { la: "Stop", va: "stop" }].map((item) => (
                <TouchableOpacity onPress={() => setFilterStatus(item.va)} key={item.va}>
                  <Text style={filterStatus === item.va ? styles.filterButtonActive : styles.filterButton}>{item.la}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.timelineListContainer}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[masterdataStyles.text, masterdataStyles.textBold, { marginBottom: 10, fontSize: spacing.medium }]}>
                  {`${currentDate} Time : `}
                </Text>
                <Text style={[masterdataStyles.text, masterdataStyles.textBold, { marginBottom: 10, fontSize: spacing.medium }]}>
                  {/* {Clock()} */}
                </Text>
              </View>

              {eventsByDateS && initialTime && (
                <MemoTimelines eventsByDateS={eventsByDateS} initialTime={initialTime} renderItem={renderItem} />
              )}
            </View>
          </View>
        </View>

        {dialogVisible && (
          <MemoHome_dialog
            dialogVisible={dialogVisible}
            hideDialog={() => setDialogVisible(false)}
            selectedEvent={selectedEvent}
            key={`Home_dialog`}
          />
        )}

      </CalendarProvider>
    </View>
  );
});

export default HomeScreen;
