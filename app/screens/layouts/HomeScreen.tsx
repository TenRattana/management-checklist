import React, { useState, useMemo, useCallback, lazy } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Checkbox, Icon, Text } from 'react-native-paper';
import { useQuery } from 'react-query';
import { CalendarProvider, CalendarUtils } from 'react-native-calendars';
import { useTheme } from '@/app/contexts/useTheme';
import { useRes } from '@/app/contexts/useRes';
import { convertScheduleToTimeline, parseTimeScheduleToTimeline } from '@/app/mocks/timeline';
import { fetchTimeSchedules } from '@/app/services';
import { getCurrentTime } from '@/config/timezoneUtils';
import useMasterdataStyles from '@/styles/common/masterdata';
import Timelines from '@/components/screens/TimeLines';

const LazyCalendar = lazy(() => import('react-native-calendars').then(module => ({ default: module.Calendar })));

const categories = [
  { id: '1', title: 'Schedule Daily', color: '#27ae60' },
  { id: '2', title: 'Schedule Weekly', color: '#2980b9' },
  { id: '3', title: 'Schedule Custom', color: '#8e44ad' },
];

const HomeScreen = React.memo(() => {
  const { theme } = useTheme();
  const { spacing, responsive } = useRes();
  const masterdataStyles = useMasterdataStyles();

  const getDate = (offset = 0) => CalendarUtils.getCalendarDateString(getCurrentTime().setDate(getCurrentTime().getDate() + offset));

  const [currentDate, setCurrentDate] = useState(getDate());
  const [filterStatus, setFilterStatus] = useState('running');
  const [filterTitle, setFilterTitle] = useState<string[]>(["Daily", "Weekly", "Custom"]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': true,
  });

  const { data: timeSchedule = [] } = useQuery('timeSchedule', fetchTimeSchedules, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const time = parseTimeScheduleToTimeline(timeSchedule);
  const timelineItems = useMemo(() => convertScheduleToTimeline(time), [timeSchedule]);

  const markedDatesS = useMemo(() => {
    const { markedDates } = timelineItems;
    return {
      ...markedDates,
      [currentDate]: { selected: true, selectedColor: theme.colors.drag, selectedTextColor: theme.colors.fff },
    };
  }, [currentDate, theme.colors.drag, theme.colors.fff, timelineItems]);

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

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    calendarContainer: { padding: 10, width: responsive === "small" ? "100%" : 400 },
    filterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    timelineListContainer: { flex: 1 },
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
  });

  const renderCategoryItem = useCallback(({ item }: any) => (
    <View style={styles.filterContainer}>
      <Checkbox
        status={checkedItems[item.id] ? 'checked' : 'unchecked'}
        onPress={() => toggleCheckbox(item.id, item.title)}
        color={item.color}
      />
      <Text style={[masterdataStyles.text, { color: item.color }]}>{item.title}</Text>
    </View>
  ),
    [checkedItems, toggleCheckbox, masterdataStyles.text]
  );

  return (
    <View style={styles.container}>
      <CalendarProvider date={currentDate} onDateChanged={setCurrentDate} showTodayButton>
        <View style={{ flex: 1, flexDirection: responsive === 'small' ? 'column' : 'row' }}>
          {showCalendar && (
            <View style={styles.calendarContainer}>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={renderCategoryItem}
                ListHeaderComponent={
                  <LazyCalendar
                    onDayPress={(day) => {
                      setCurrentDate(day.dateString);
                    }}
                    markedDates={markedDatesS}
                    markingType="multi-dot"
                  />
                }
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

            <Timelines filterStatus={filterStatus} filterTitle={filterTitle} currentDate={currentDate} timeline={timelineItems.timeline} />
          </View>
        </View>
      </CalendarProvider>
    </View>
  );
});

export default HomeScreen;

