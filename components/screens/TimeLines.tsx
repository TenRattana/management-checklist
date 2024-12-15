import React, { lazy, useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/contexts/useTheme';
import moment from 'moment-timezone';
import { groupBy } from 'lodash';
import { CalendarUtils, Timeline, TimelineListRenderItemInfo, TimelineProps } from 'react-native-calendars';
import { getCurrentTime } from '@/config/timezoneUtils';
import Home_dialog from './Home_dialog';

const LazyTimelineList = lazy(() => import('react-native-calendars').then(module => ({ default: module.TimelineList })));
const MemoHome_dialog = React.memo(Home_dialog)

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
    timeline: any;
};

const Timelines: React.FC<TimelinesProps> = ({ filterStatus, filterTitle, currentDate, timeline }) => {
    const { theme } = useTheme();
    const [dialogVisible, setDialogVisible] = useState<boolean>(false)
    const [selectedEvent, setSelectedEvent] = useState<any>()

    const initialTime = useMemo(() => ({
        hour: getCurrentTime().getHours(),
        minutes: getCurrentTime().getMinutes(),
    }), []);

    const eventsByDate = groupBy(timeline, (e) => CalendarUtils.getCalendarDateString(e.start));

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
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventTime}>
                {formatTime(item.start)} - {formatTime(item.end)}
            </Text>
            {item.summary && <Text style={styles.eventSummary}>{item.summary}</Text>}
        </TouchableOpacity>
    ));

    const handleEventClick = useCallback((event: any) => {
        console.log(event);

        setSelectedEvent(event)
        setDialogVisible(true)
    }, []);

    const renderItem = useCallback((timelineProps: TimelineProps, info: TimelineListRenderItemInfo) => {
        return (
            <Timeline
                {...timelineProps}
                styles={{ contentStyle: { backgroundColor: theme.colors.fff } }}
                renderEvent={(event) => <RenderEvent item={event} />}
            />
        );
    }, []);

    return (
        <>
            <LazyTimelineList
                events={eventsByDateS}
                renderItem={renderItem}
                showNowIndicator
                scrollToNow
                initialTime={initialTime}
            />

            {dialogVisible && (
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

const styles = StyleSheet.create({
    eventContainer: {
        padding: 8,
        borderRadius: 5,
        marginVertical: 4,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    eventTime: {
        fontSize: 14,
        color: '#fff',
    },
    eventSummary: {
        fontSize: 12,
        color: '#fff',
    },
    timelineListContainer: {
        flex: 1,
        padding: 10,
    },
});

export default Timelines;
