import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/contexts/useTheme';
import moment from 'moment-timezone';
import { CalendarUtils, TimelineEventProps, TimelineListRenderItemInfo, TimelineProps } from 'react-native-calendars';
import { getCurrentTime } from '@/config/timezoneUtils';
import Home_dialog from './Home_dialog';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useQuery } from 'react-query';
import { fetchTimeSchedules } from '@/app/services';
import { GroupMachine } from '@/typing/type';
import { parseTimeScheduleToTimeline } from '@/app/mocks/parseTimeScheduleToTimeline';
import { convertSchedule } from '@/app/mocks/convertSchedule';
import { groupBy } from 'lodash';
import { TimeLine } from '@/app/mocks/timeline';

const LazyTimelineList = lazy(() => import('react-native-calendars').then(module => ({ default: module.TimelineList })));
const LazyTimeline = lazy(() => import('react-native-calendars').then(module => ({ default: module.Timeline })));

const MemoHome_dialog = React.memo(Home_dialog);

type Event = {
    title: string;
    start: string;
    end: string;
    summary?: string;
    statustype?: string;
    type?: string;
};

type TimelinesProps = {
    filterStatus: string;
    filterTitle: string[];
    currentDate: any;
};

type ScheduleType = 'Daily' | 'Weekly' | 'Custom';

type MarkedDates = Record<string, { dots: DOT[] }>;

type DOT = {
    color: string;
    selectedDotColor: string;
    type?: ScheduleType;
};

const Timelines: React.FC<TimelinesProps> = ({ filterStatus, filterTitle, currentDate }) => {
    const { theme } = useTheme();
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const masterdataStyles = useMasterdataStyles();

    const initialTime = useMemo(() => ({
        hour: getCurrentTime().getHours(),
        minutes: getCurrentTime().getMinutes(),
    }), []);

    const { data: timeSchedule = [], isLoading } = useQuery('timeSchedule', fetchTimeSchedules, {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const [timelineItems, setTimelineItems] = useState<TimeLine[]>([]);

    const computedTimeline = useMemo(() => {
        if (isLoading || !timeSchedule.length) return { timeline: [], markedDates: {} };
        const time = parseTimeScheduleToTimeline(timeSchedule);

        return convertSchedule(time);
    }, [timeSchedule, isLoading]);

    useEffect(() => {
        console.log("computedTimeline", computedTimeline);

        setTimelineItems(computedTimeline.timeline);
    }, [timeSchedule, isLoading]);

    const eventsByDate = groupBy(timelineItems, (e) => CalendarUtils.getCalendarDateString(e.start));

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

    const formatTime = (time: string) => {
        const date = new Date(time);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const RenderEvent = React.memo(({ item }: { item: Event }) => (
        <TouchableOpacity onPress={() => handleEventClick(item)}>
            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>{item.title}</Text>
            <Text style={masterdataStyles.textFFF}>
                {formatTime(item.start)} - {formatTime(item.end)}
            </Text>
            {item.summary && <Text style={masterdataStyles.textFFF}>{item.summary}</Text>}
        </TouchableOpacity>
    ));

    const handleEventClick = useCallback((event: Event) => {
        if (event) {
            setSelectedEvent(event);
            setDialogVisible(true);
        } else {
            console.warn('Event is undefined:', event);
        }
    }, []);

    const renderItem = useCallback((timelineProps: TimelineProps, info: TimelineListRenderItemInfo) => {
        return (
            <Suspense fallback={<ActivityIndicator size="small" color={theme.colors.primary} />}>
                <LazyTimeline
                    {...timelineProps}
                    styles={{ contentStyle: { backgroundColor: theme.colors.fff } }}
                    onEventPress={handleEventClick}
                    renderEvent={(event) => <RenderEvent item={event} />}
                />
            </Suspense>
        );
    }, [theme]);

    return (
        <>
            <Suspense fallback={<ActivityIndicator size="large" color={theme.colors.primary} />}>
                <LazyTimelineList
                    events={eventsByDateS}
                    renderItem={renderItem}
                    showNowIndicator
                    scrollToNow
                    initialTime={initialTime}
                />
            </Suspense>


            {dialogVisible && selectedEvent && (
                <MemoHome_dialog
                    dialogVisible={dialogVisible}
                    hideDialog={() => setDialogVisible(false)}
                    selectedEvent={selectedEvent}
                    key={`Home_dialog`}
                />
            )}
        </>
    );
};

export default Timelines;
