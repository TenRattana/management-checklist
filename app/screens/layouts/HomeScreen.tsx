// import React, { useState, useMemo, useCallback, lazy, Suspense, useEffect } from 'react';
// import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';
// import { Checkbox, Icon, Text } from 'react-native-paper';
// import { useQuery } from 'react-query';
// import { CalendarUtils, Profiler } from 'react-native-calendars';
// import { useTheme } from '@/app/contexts/useTheme';
// import { useRes } from '@/app/contexts/useRes';
// import { convertScheduleToTimeline, parseTimeScheduleToTimeline, TimeLine } from '@/app/mocks/timeline';
// import { fetchTimeSchedules } from '@/app/services';
// import { getCurrentTime } from '@/config/timezoneUtils';
// import useMasterdataStyles from '@/styles/common/masterdata';
// import Timelines from '@/components/screens/TimeLines';
// import { MarkedDates } from 'react-native-calendars/src/types';

// const LazyCalendar = lazy(() => import('react-native-calendars').then(module => ({ default: module.Calendar })));
// const LazyCalendarProvider = lazy(() => import('react-native-calendars').then(module => ({ default: module.CalendarProvider })));

// const MemoizedLazyCalendarProvider = React.memo(LazyCalendarProvider);
// const MemoizedLazyCalendar = React.memo(LazyCalendar);

// const categories = [
//   { id: '1', title: 'Schedule Daily', color: '#27ae60' },
//   { id: '2', title: 'Schedule Weekly', color: '#2980b9' },
//   { id: '3', title: 'Schedule Custom', color: '#8e44ad' },
// ];

// const HomeScreen = React.memo(() => {
//   const { theme } = useTheme();
//   const { spacing, responsive } = useRes();
//   const masterdataStyles = useMasterdataStyles();

//   const getDate = (offset = 0) => CalendarUtils.getCalendarDateString(getCurrentTime().setDate(getCurrentTime().getDate() + offset));

//   const [currentDate, setCurrentDate] = useState(getDate());
//   const [filterStatus, setFilterStatus] = useState('running');
//   const [filterTitle, setFilterTitle] = useState<string[]>(['Daily', 'Weekly', 'Custom']);
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
//     '1': true,
//     '2': true,
//     '3': true,
//   });

//   const { data: timeSchedule = [], isLoading } = useQuery('timeSchedule', fetchTimeSchedules, {
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//   });

//   const [timelineItems, setTimelineItems] = useState<{
//     timeline: TimeLine[];
//     markedDates: MarkedDates;
//   }>({ timeline: [], markedDates: {} });

//   const fetchTimelineItems = useCallback(async () => {
//     const time = await parseTimeScheduleToTimeline(timeSchedule);
//     const timeline = await convertScheduleToTimeline(time);
//     setTimelineItems(timeline);
//   }, [timeSchedule]);

//   useEffect(() => {
//     if (!isLoading && timeSchedule.length) {
//       fetchTimelineItems();
//     }
//   }, [isLoading, timeSchedule]);

//   const toggleCheckbox = useCallback((id: string, title: string) => {
//     setCheckedItems((prevState) => {
//       const updatedCheckedState = { ...prevState, [id]: !prevState[id] };
//       const updatedFilterTypes = updatedCheckedState[id]
//         ? [...filterTitle, title.split(' ')[1]]
//         : filterTitle.filter((filter) => filter !== title.split(' ')[1]);

//       setFilterTitle(updatedFilterTypes);
//       return updatedCheckedState;
//     });
//   }, [filterTitle]);

//   const toggleSwitch = useCallback(() => setShowCalendar((prev) => !prev), []);

//   const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: theme.colors.background },
//     calendarContainer: { padding: 10, width: responsive === 'small' ? '100%' : 400 },
//     filterContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
//     timelineListContainer: { flex: 1 },
//     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     filterButton: {
//       color: theme.colors.blue,
//       fontSize: spacing.small,
//       marginHorizontal: 10,
//       marginTop: 10,
//     },
//     filterButtonActive: {
//       color: theme.colors.field,
//       fontSize: spacing.medium,
//       borderBottomWidth: 1,
//       borderBottomColor: theme.colors.drag,
//       marginHorizontal: 10,
//       marginTop: 10,
//     },
//   });

//   const renderCategoryItem = useCallback(({ item }: any) => (
//     <View style={styles.filterContainer}>
//       <Checkbox
//         status={checkedItems[item.id] ? 'checked' : 'unchecked'}
//         onPress={() => toggleCheckbox(item.id, item.title)}
//         color={item.color}
//       />
//       <Text style={[masterdataStyles.text, { color: item.color }]}>{item.title}</Text>
//     </View>
//   ), [checkedItems, toggleCheckbox, masterdataStyles.text]);

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={theme.colors.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Suspense fallback={<ActivityIndicator size="large" color={theme.colors.primary} />}>
//         <Profiler id={"Lazy Calendar"}>
//           <MemoizedLazyCalendarProvider date={currentDate} onDateChanged={setCurrentDate} showTodayButton>
//             <View style={{ flex: 1, flexDirection: responsive === 'small' ? 'column' : 'row' }}>
//               {showCalendar && (
//                 <View style={styles.calendarContainer}>
//                   <FlatList
//                     data={categories}
//                     keyExtractor={(item) => item.id}
//                     renderItem={renderCategoryItem}
//                     ListHeaderComponent={
//                       <Suspense fallback={<ActivityIndicator size="large" color={theme.colors.primary} />}>
//                         <MemoizedLazyCalendar
//                           onDayPress={(day) => setCurrentDate(day.dateString)}
//                           // markedDates={markedDatesS}
//                           markingType="multi-dot"
//                           style={{ borderRadius: 10 }}
//                         />
//                         <Text style={[masterdataStyles.text, masterdataStyles.textBold, { marginTop: 20, marginBottom: 10, paddingLeft: 10 }]}>Filter Date Type</Text>
//                       </Suspense>
//                     }
//                   />
//                 </View>
//               )}
//               <View style={{ flex: 1 }}>
//                 <TouchableOpacity onPress={toggleSwitch} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
//                   <Icon source={showCalendar ? "chevron-left" : "chevron-right"} size={24} color={theme.colors.primary} />
//                   <Text style={masterdataStyles.text}>{showCalendar ? 'Hide Calendar' : 'Show Calendar'}</Text>
//                 </TouchableOpacity>

//                 <View style={styles.filterContainer}>
//                   {['all', 'end', 'running', 'wait', 'stop'].map((status) => (
//                     <TouchableOpacity onPress={() => setFilterStatus(status)} key={status}>
//                       <Text style={filterStatus === status ? styles.filterButtonActive : styles.filterButton}>
//                         {status.charAt(0).toUpperCase() + status.slice(1)}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>

//                 <Timelines filterStatus={filterStatus} filterTitle={filterTitle} currentDate={currentDate} timeline={timelineItems.timeline} />
//               </View>
//             </View>
//           </MemoizedLazyCalendarProvider>
//         </Profiler>
//       </Suspense>
//     </View>
//   );
// });

// export default HomeScreen;

import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { lazy, Suspense, useCallback, useState, useMemo, useEffect } from 'react';
import { CalendarUtils, Profiler } from 'react-native-calendars';
import { getCurrentTime } from '@/config/timezoneUtils';
import { useTheme } from '@/app/contexts/useTheme';
import { FlatList } from 'react-native-gesture-handler';
import useMasterdataStyles from '@/styles/common/masterdata';
import { Checkbox, Icon } from 'react-native-paper';
import { useRes } from '@/app/contexts/useRes';
import Timelines from '@/components/screens/TimeLines';

const categories = [
  { id: '1', title: 'Schedule Daily', color: '#27ae60' },
  { id: '2', title: 'Schedule Weekly', color: '#2980b9' },
  { id: '3', title: 'Schedule Custom', color: '#8e44ad' },
];

const LazyCalendar = lazy(() => import('react-native-calendars').then(module => ({ default: module.Calendar })));
const LazyCalendarProvider = lazy(() => import('react-native-calendars').then(module => ({ default: module.CalendarProvider })));

const HomeScreen = () => {
  const [currentDate, setCurrentDate] = useState(CalendarUtils.getCalendarDateString(getCurrentTime().setDate(getCurrentTime().getDate() + 0)));
  const { theme } = useTheme();
  const { spacing, responsive } = useRes();

  const [showCalendar, setShowCalendar] = useState(false);
  const masterdataStyles = useMasterdataStyles();
  const [filterStatus, setFilterStatus] = useState('running');
  const [filterTitle, setFilterTitle] = useState<string[]>(['Daily', 'Weekly', 'Custom']);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': true,
  });

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
        ? [...filterTitle, title.split(' ')[1]]
        : filterTitle.filter((filter) => filter !== title.split(' ')[1]);

      setFilterTitle(updatedFilterTypes);
      return updatedCheckedState;
    });
  }, [filterTitle]);

  const renderCategoryItem = useCallback(({ item }: any) => (
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
                    ListHeaderComponent={
                      <>
                        <Text style={[masterdataStyles.text, masterdataStyles.textBold, { marginTop: 20, marginBottom: 10, paddingLeft: 10 }]}>Calendar List</Text>
                        <LazyCalendar
                          onDayPress={(day) => setCurrentDate(day.dateString)}
                          markingType="multi-dot"
                          style={{ borderRadius: 10 }}
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

                <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                  <Timelines filterStatus={filterStatus} filterTitle={filterTitle} currentDate={currentDate} />
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
