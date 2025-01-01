import React, { lazy, Suspense, useCallback, useState, useMemo } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarUtils, CalendarProvider, Calendar } from 'react-native-calendars';
import { getCurrentTime } from '@/config/timezoneUtils';
import { useTheme } from '@/app/contexts/useTheme';
import { FlatList } from 'react-native-gesture-handler';
import useMasterdataStyles from '@/styles/common/masterdata';
import { Checkbox, Icon } from 'react-native-paper';
import { useRes } from '@/app/contexts/useRes';
import { useQuery } from 'react-query';
import { fetchTimeSchedules } from '@/app/services';
import { convertSchedule } from '@/app/mocks/convertSchedule';

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

const LazyTimelines = lazy(() => import('@/components/screens/TimeLines'));

const RenderCategoryItem = React.memo(({ item, toggleCheckbox, checkedItems }: { item: Category, toggleCheckbox: any, checkedItems: any }) => {
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
  );
});

const HomeScreen = React.memo(() => {
  const [currentDate, setCurrentDate] = useState(() => CalendarUtils.getCalendarDateString(getCurrentTime()));
  const { theme } = useTheme();
  const { spacing, responsive } = useRes();

  const [checkedItems, setCheckedItems] = useState({ '1': true, '2': true, '3': true });
  const [filterTitle, setFilterTitle] = useState(['Daily', 'Weekly', 'Custom']);
  const [showCalendar, setShowCalendar] = useState(false);
  const masterdataStyles = useMasterdataStyles();
  const [filterStatus, setFilterStatus] = useState('running');

  const { data: timeSchedule = [], isLoading } = useQuery('timeSchedule', fetchTimeSchedules, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const computedTimeline = useMemo(() => {
    if (isLoading || !timeSchedule.length) return { timeline: [], markedDates: {} };
    return convertSchedule(timeSchedule);
  }, [timeSchedule, isLoading]);

  const markedDatesS = useMemo(() => {
    return {
      ...computedTimeline.markedDates,
      [currentDate]: { selected: true, selectedColor: theme.colors.drag, selectedTextColor: theme.colors.fff },
    };
  }, [currentDate, theme.colors.drag, theme.colors.fff, computedTimeline.markedDates]);

  const toggleCheckbox = useCallback((id: string, title: string) => {
    setCheckedItems((prevState) => {
      const updatedCheckedState = { ...prevState, [id as '1' | '2' | '3']: !prevState[id as '1' | '2' | '3'] };
      const updatedFilterTypes = updatedCheckedState[id as '1' | '2' | '3']
        ? [...filterTitle, title]
        : filterTitle.filter((filter) => filter !== title);

      setFilterTitle(updatedFilterTypes);
      return updatedCheckedState;
    });
  }, [filterTitle]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    calendarContainer: { padding: 10, width: responsive === 'small' ? '100%' : 300 },
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
  }), [theme.colors, spacing, responsive]);

  const toggleSwitch = useCallback(() => setShowCalendar(prev => !prev), []);

  return (
    <View style={styles.container}>
      <CalendarProvider date={currentDate} onDateChanged={setCurrentDate} showTodayButton>
        <View style={{ flex: 1, flexDirection: responsive === 'small' ? 'column' : 'row' }}>
          {showCalendar && (
            <View style={styles.calendarContainer}>
              <FlatList
                data={categories}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <RenderCategoryItem item={item} toggleCheckbox={toggleCheckbox} checkedItems={checkedItems} />
                )}
                initialNumToRender={3}
                windowSize={5}
                ListHeaderComponent={() => (
                  <Calendar
                    onDayPress={day => setCurrentDate(day.dateString)}
                    markingType="multi-dot"
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
              {['all', 'end', 'running', 'wait', 'stop'].map(status => (
                <TouchableOpacity key={status} onPress={() => setFilterStatus(status)}>
                  <Text style={filterStatus === status ? styles.filterButtonActive : styles.filterButton}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Suspense fallback={<ActivityIndicator size="large" color={theme.colors.primary} />}>
              <LazyTimelines filterStatus={filterStatus} filterTitle={filterTitle} currentDate={currentDate} />
            </Suspense>
          </View>
        </View>
      </CalendarProvider>
    </View>
  );
});

export default HomeScreen;
