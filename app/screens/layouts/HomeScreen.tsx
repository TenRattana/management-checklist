import { ActivityIndicator, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { lazy, Suspense, useCallback, useState, useMemo, useEffect } from 'react';
import { CalendarUtils } from 'react-native-calendars';
import { getCurrentTime } from '@/config/timezoneUtils';
import { useTheme } from '@/app/contexts/useTheme';
import { FlatList } from 'react-native-gesture-handler';
import useMasterdataStyles from '@/styles/common/masterdata';
import { Card, Checkbox, Divider, Icon } from 'react-native-paper';
import { useRes } from '@/app/contexts/useRes';
import { useQuery } from 'react-query';
import { fetchTimeSchedules } from '@/app/services';
import { convertSchedule, MarkedDates } from '@/app/mocks/convertSchedule';
import { Calendar } from 'react-native-calendars';
import { TimeLine } from '@/app/mocks/timeline';
import Animated, { SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { Text } from '@/components';
import { Theme } from 'react-native-calendars/src/types';

type Category = {
  id: string;
  title: string;
  color: string;
};

const categories: Category[] = [
  { id: '1', title: 'Schedule Daily', color: '#27ae60' },
  { id: '2', title: 'Schedule Weekly', color: '#2980b9' },
  { id: '3', title: 'Schedule Custom', color: '#8e44ad' },
];

const LazyCalendarProvider = lazy(() => import('react-native-calendars').then(module => ({ default: module.CalendarProvider })));
const LazyTimelines = lazy(() => import('@/components/screens/TimeLines'));

const RenderCategoryItem = React.memo(({ item, toggleCheckbox, checkedItems }: { item: Category; toggleCheckbox: any, checkedItems: Record<string, boolean> }) => {
  const masterdataStyles = useMasterdataStyles();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
      <Checkbox
        status={checkedItems[item.id] ? 'checked' : 'unchecked'}
        onPress={() => toggleCheckbox(item.id, item.title)}
        color={item.color}
      />
      <Text style={[masterdataStyles.text, { color: item.color }]}>{item.title}</Text>
    </View>
  )
});

const HomeScreen = React.memo(() => {
  const [currentDate, setCurrentDate] = useState(CalendarUtils.getCalendarDateString(getCurrentTime().setDate(getCurrentTime().getDate() + 0)));
  const { theme, darkMode } = useTheme();
  const { spacing, responsive, fontSize } = useRes();

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': true,
  });

  const [filterTitle, setFilterTitle] = useState(['Daily', 'Weekly', 'Custom']);
  const [showCalendar, setShowCalendar] = useState(false);
  const masterdataStyles = useMasterdataStyles();
  const [filterStatus, setFilterStatus] = useState('running');

  const toggleCheckbox = useCallback((id: string, title: string) => {
    setCheckedItems((prevState) => {
      const updatedCheckedState = { ...prevState, [id]: !prevState[id] };
      const updatedFilterTypes = updatedCheckedState[id]
        ? [...filterTitle, title.split(' ')[1]]
        : filterTitle.filter((filter) => filter !== title.split(' ')[1]);

      setFilterTitle(updatedFilterTypes);
      return updatedCheckedState;
    });
  }, [filterTitle]);

  const toggleSwitch = useCallback(() => setShowCalendar((prev) => !prev), []);

  const { data: timeSchedule = [], isLoading } = useQuery('timeSchedule', fetchTimeSchedules, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const [timelineItems, setTimelineItems] = useState<MarkedDates>({});
  const [computedTimeline, setComputedTimeline] = useState<{
    timeline: TimeLine[];
    markedDates: MarkedDates;
  }>({ markedDates: {}, timeline: [] });

  const markedDatesS = useMemo(() => {
    return {
      ...timelineItems,
      [currentDate]: { selected: true, selectedColor: theme.colors.drag, selectedTextColor: theme.colors.fff },
    };
  }, [currentDate, theme.colors.drag, theme.colors.fff, timelineItems]);

  useEffect(() => {
    if (!isLoading && timeSchedule.length)
      setComputedTimeline(convertSchedule(timeSchedule));
  }, [timeSchedule, isLoading]);

  useEffect(() => {
    if (computedTimeline.markedDates !== timelineItems) {
      setTimelineItems(computedTimeline.markedDates);
    }
  }, [computedTimeline]);

  const styles = StyleSheet.create({
    container:
      Platform.OS === "web"
        ? {
          flex: 1,
          margin: 10,
          paddingBottom: 0,
          marginBottom: 0,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          backgroundColor: theme.colors.background,
        }
        : {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
    calendarContainer: {
      padding: 10,
      paddingTop: 0,
      width: responsive === "small" ? "100%" : Platform.OS === "web" ? 400 : 300,
    },
    filterContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 10,
    },
    filterButton: {
      color: theme.colors.text,
      fontSize: spacing.small,
      marginHorizontal: 10,
    },
    filterButtonActive: {
      color: theme.colors.text,
      fontSize: spacing.small + 2,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.drag,
      marginHorizontal: 10,
      marginTop: 10,
    },
    header: {
      fontSize: spacing.large,
      marginTop: spacing.small,
      paddingVertical: fontSize === "large" ? 7 : 5,
    },
    containerRender: {
      flex: 1,
      flexDirection: responsive === "small" ? "row" : "column",
    },
    containerCalendar: {
      width: responsive === "small" ? "70%" : "100%",
      borderRadius: 8,
    },
    textCalender: {
      marginTop: 10,
      marginBottom: 10,
      paddingLeft: 10,
    },
    containerFilter: {
      width: responsive === "small" ? "30%" : "100%",
      marginTop: responsive === "small" ? 44 : 0,
    },
  });

  const themeStyles: Theme = useMemo(
    () => ({
      todayTextColor: theme.colors.onBackground,
      arrowColor: theme.colors.onBackground,
      monthTextColor: theme.colors.onBackground,
      textDayFontSize: spacing.small,
      textMonthFontSize: spacing.small,
      textDayHeaderFontSize: spacing.small,
      textDayFontFamily: "Poppins",
      textMonthFontFamily: "Poppins",
      textDayHeaderFontFamily: "Poppins",
      textMonthFontWeight: "600",
      textDayHeaderFontWeight: "500",
      calendarBackground: theme.colors.background,
    }),
    [darkMode, spacing.small]
  );

  return (
    <View style={styles.container}>
      <Card.Title
        title="Schedule"
        titleStyle={[masterdataStyles.textBold, styles.header]}
      />
      <Divider style={{ marginHorizontal: 15, marginBottom: 10 }} />

      <Suspense fallback={<ActivityIndicator size="large" color={theme.colors.primary} />} >
        <LazyCalendarProvider
          date={currentDate}
          onDateChanged={setCurrentDate}
          showTodayButton
        >
          <View style={{ flex: 1, flexDirection: responsive === "small" ? "column" : "row", padding: 10, }} >
            {showCalendar && (
              <Animated.View entering={SlideInLeft} exiting={SlideOutLeft}>
                <View style={styles.calendarContainer}>
                  <FlatList
                    data={[[]]}
                    renderItem={() => (
                      <View style={styles.containerRender}>
                        <View style={styles.containerCalendar}>
                          {responsive === "small" && (
                            <TouchableOpacity onPress={toggleSwitch} style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }} >
                              <Icon source={showCalendar ? "chevron-left" : "chevron-right"} size={24} color={theme.colors.primary} />
                              <Text style={masterdataStyles.text}>  {showCalendar ? "Hide Calendar" : "Show Calendar"}  </Text>
                            </TouchableOpacity>
                          )}
                          <Text style={[masterdataStyles.text, masterdataStyles.textBold, styles.textCalender]}>
                            Calendar List
                          </Text>
                          <Calendar
                            onDayPress={(day) => setCurrentDate(day.dateString)}
                            markingType="multi-dot"
                            style={{ borderRadius: 10 }}
                            markedDates={markedDatesS}
                            theme={themeStyles}
                          />
                        </View>

                        <View style={styles.containerFilter}>
                          <Text style={[masterdataStyles.text, masterdataStyles.textBold, styles.textCalender]}>
                            Filter Schedule Type
                          </Text>

                          <FlatList
                            data={categories}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item, index }) => (
                              <RenderCategoryItem
                                item={item}
                                toggleCheckbox={toggleCheckbox}
                                checkedItems={checkedItems}
                              />
                            )}
                            extraData={checkedItems}
                          />
                        </View>
                      </View>
                    )}
                  />
                </View>
              </Animated.View>
            )}

            <View style={{ flex: 1, borderLeftWidth: 1, borderColor: "rgb(216,216,216)", paddingLeft: 5 }}>
              {responsive !== "small" ? (
                <TouchableOpacity onPress={toggleSwitch} style={{ flexDirection: "row", alignItems: "center" }} >
                  <Icon
                    source={showCalendar ? "chevron-left" : "chevron-right"}
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={masterdataStyles.text}>
                    {showCalendar ? "Hide Calendar" : "Show Calendar"}
                  </Text>
                </TouchableOpacity>
              ) : (
                responsive === "small" &&
                !showCalendar && (
                  <TouchableOpacity
                    onPress={toggleSwitch}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Icon
                      source={showCalendar ? "chevron-left" : "chevron-right"}
                      size={24}
                      color={theme.colors.primary}
                    />
                    <Text style={masterdataStyles.text}>
                      {showCalendar ? "Hide Calendar" : "Show Calendar"}
                    </Text>
                  </TouchableOpacity>
                )
              )}

              <View style={styles.filterContainer}>
                {["all", "end", "running", "wait", "stop"].map((status) => (
                  <TouchableOpacity onPress={() => setFilterStatus(status)} key={status}>
                    <Text style={filterStatus === status ? styles.filterButtonActive : styles.filterButton} >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flex: 1 }} key={JSON.stringify({ responsive, darkMode, fontSize })}>
                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />} >
                  <LazyTimelines
                    filterStatus={filterStatus}
                    filterTitle={filterTitle}
                    computedTimeline={computedTimeline}
                  />
                </Suspense>
              </View>
            </View>
          </View>
        </LazyCalendarProvider>
      </Suspense>
    </View>
  );
});

export default HomeScreen;
