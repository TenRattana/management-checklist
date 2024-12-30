import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { lazy, Suspense, useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { CalendarUtils, Profiler } from 'react-native-calendars';
import { getCurrentTime } from '@/config/timezoneUtils';
import { useTheme } from '@/app/contexts/useTheme';
import { FlatList } from 'react-native-gesture-handler';
import useMasterdataStyles from '@/styles/common/masterdata';
import { Checkbox, Icon } from 'react-native-paper';
import { useRes } from '@/app/contexts/useRes';
import Timelines from '@/components/screens/TimeLines';
import { useQuery } from 'react-query';
import { fetchTimeSchedules } from '@/app/services';
import { parseTimeScheduleToTimeline } from '@/app/mocks/parseTimeScheduleToTimeline';
import { convertSchedule } from '@/app/mocks/convertSchedule';
import { MarkedDates } from 'react-native-calendars/src/types';

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

const LazyCalendar = lazy(() => import('react-native-calendars').then(module => ({ default: module.Calendar })));
const LazyCalendarProvider = lazy(() => import('react-native-calendars').then(module => ({ default: module.CalendarProvider })));

const TimelinesMemo = React.memo(Timelines);

const HomeScreen = () => {
  const [currentDate, setCurrentDate] = useState(CalendarUtils.getCalendarDateString(getCurrentTime().setDate(getCurrentTime().getDate() + 0)));
  const { theme } = useTheme();
  const { spacing, responsive } = useRes();

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': true,
  });

  const [filterTitle, setFilterTitle] = useState(['Daily', 'Weekly', 'Custom']);

  const checkedItemsRef = useRef(checkedItems);
  const filterTitleRef = useRef(filterTitle);

  useEffect(() => {
    checkedItemsRef.current = checkedItems;
    filterTitleRef.current = filterTitle;
  }, [checkedItems, filterTitle]);

  const [showCalendar, setShowCalendar] = useState(false);
  const masterdataStyles = useMasterdataStyles();
  const [filterStatus, setFilterStatus] = useState('running');

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    calendarContainer: { padding: 10, width: responsive === 'small' ? '100%' : Platform.OS === "web" ? 400 : 300 },
    filterContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    filterButton: {
      color: theme.colors.blue,
      fontSize: spacing.small,
      marginHorizontal: 10,
      marginTop: 10,
    },
    filterButtonActive: {
      color: theme.colors.field,
      fontSize: spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.drag,
      marginHorizontal: 10,
      marginTop: 10,
    },
  }), [theme.colors.background, spacing, responsive]);

  const toggleCheckbox = useCallback((id: string, title: string) => {
    setCheckedItems((prevState) => {
      const updatedCheckedState = { ...prevState, [id]: !prevState[id] };
      const updatedFilterTypes = updatedCheckedState[id]
        ? [...filterTitleRef.current, title]
        : filterTitleRef.current.filter((filter) => filter !== title);

      setFilterTitle(updatedFilterTypes);
      return updatedCheckedState;
    });
  }, [filterTitle]);

  const renderCategoryItem = useCallback(({ item }: { item: Category }) => (
    <View style={styles.filterContainer}>
      <Checkbox
        status={checkedItems[item.id] ? 'checked' : 'unchecked'}
        onPress={() => toggleCheckbox(item.id, item.title)}
        color={item.color}
      />
      <Text style={[masterdataStyles.text, { color: item.color }]}>{item.title}</Text>
    </View>
  ), [checkedItems, toggleCheckbox, masterdataStyles.text, styles.filterContainer]);

  const toggleSwitch = useCallback(() => setShowCalendar((prev) => !prev), []);

  const { data: timeSchedule = [], isLoading } = useQuery('timeSchedule', fetchTimeSchedules, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const [timelineItems, setTimelineItems] = useState<MarkedDates>({});

  const computedTimeline = useMemo(() => {
    if (isLoading || !timeSchedule.length) return { timeline: [], markedDates: {} };
    const time = parseTimeScheduleToTimeline(timeSchedule);
    return convertSchedule(time);
  }, [timeSchedule, isLoading]);

  useEffect(() => {
    if (computedTimeline.markedDates)
      setTimelineItems(computedTimeline.markedDates);
  }, [computedTimeline]);

  const markedDatesS = useMemo(() => {
    return {
      ...timelineItems,
      [currentDate]: { selected: true, selectedColor: theme.colors.drag, selectedTextColor: theme.colors.fff },
    };
  }, [currentDate, theme.colors.drag, theme.colors.fff, timelineItems]);

  return (
    <View style={styles.container}>
      <Suspense fallback={<ActivityIndicator size="large" color={theme.colors.primary} />}>
        <Profiler id={"calendar"}>
          <LazyCalendarProvider date={currentDate} onDateChanged={setCurrentDate} showTodayButton>
            <View style={{ flex: 1, flexDirection: responsive === 'small' ? 'column' : 'row' }}>
              {showCalendar && (
                <View style={styles.calendarContainer}>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCategoryItem}
                    ListHeaderComponent={(
                      <>
                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { marginTop: 20, marginBottom: 10, paddingLeft: 10 }]}>Calendar List</Text>
                        <LazyCalendar
                          onDayPress={(day) => setCurrentDate(day.dateString)}
                          markingType="multi-dot"
                          style={{ borderRadius: 10 }}
                          markedDates={markedDatesS}
                          theme={{
                            todayTextColor: theme.colors.primary,
                            arrowColor: theme.colors.primary,
                            monthTextColor: theme.colors.primary,
                            textDayFontSize: spacing.small,
                            textMonthFontSize: spacing.small,
                            textDayHeaderFontSize: spacing.small,
                            textDayFontFamily: 'Poppins',
                            textMonthFontFamily: 'Poppins',
                            textDayHeaderFontFamily: 'Poppins',
                            textDayFontWeight: 'bold',
                            textMonthFontWeight: '600',
                            textDayHeaderFontWeight: '500',
                          }}
                        />
                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { marginTop: 20, marginBottom: 10, paddingLeft: 10 }]}>Filter Date Type</Text>
                      </>
                    )}
                  />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={toggleSwitch} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                  <Icon source={showCalendar ? "chevron-left" : "chevron-right"} size={24} color={theme.colors.primary} />
                  <Text style={masterdataStyles.text}>{showCalendar ? 'Hide Calendar' : 'Show Calendar'}</Text>
                </TouchableOpacity>

                <View style={styles.filterContainer}>
                  {['all', 'end', 'running', 'wait', 'stop'].map((status) => (
                    <TouchableOpacity onPress={() => setFilterStatus(status)} key={status}>
                      <Text style={filterStatus === status ? styles.filterButtonActive : styles.filterButton}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                  <TimelinesMemo filterStatus={filterStatus} filterTitle={filterTitle} currentDate={currentDate} />
                </Suspense>
              </View>
            </View>
          </LazyCalendarProvider>
        </Profiler>
      </Suspense>
    </View>
  );
};

export default HomeScreen;
