import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/app/contexts/useTheme';
import moment from 'moment-timezone';
import { TimelineListRenderItemInfo, TimelineProps, Timeline } from 'react-native-calendars';
import { getCurrentTime } from '@/config/timezoneUtils';
import Home_dialog from './Home_dialog';
import { useQuery } from 'react-query';
import { fetchTimeSchedules } from '@/app/services';
import { convertSchedule } from '@/app/mocks/convertSchedule';
import { groupBy } from 'lodash';
import { TimeLine } from '@/app/mocks/timeline';
import { useRes } from '@/app/contexts/useRes';
import Text from '../Text';
import { LoadingSpinner } from '../common';

const LazyTimelineList = lazy(() => import('react-native-calendars').then(module => ({ default: module.TimelineList })));

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
};

const Timelines: React.FC<TimelinesProps> = ({ filterStatus, filterTitle }) => {
    const { theme } = useTheme();
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

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
        return convertSchedule(timeSchedule);
    }, [timeSchedule, isLoading]);

    useEffect(() => {
        if (computedTimeline.timeline.length) {
            setTimelineItems(computedTimeline.timeline);
            setIsLoadingData(false);
        }
    }, [computedTimeline.timeline]);

    const eventsByDateS = useMemo(() => {
        if (!timelineItems.length) return {};

        const filteredEvents = timelineItems.filter(event => {
            const statusMatches = filterStatus === "all" || event.statustype === filterStatus;
            const typeMatches = filterTitle.includes(event.type as string);
            return statusMatches && typeMatches;
        });

        return groupBy(filteredEvents, (event) => {
            if (event.start && typeof event.start === 'string') {
                return moment(event.start).format('YYYY-MM-DD');
            }
            return 'invalid_date';
        });
    }, [filterStatus, filterTitle, timelineItems]);

    const handleEventClick = useCallback((event: Event) => {
        setSelectedEvent(event);
        setDialogVisible(true);
    }, []);

    const renderItem = useCallback((timelineProps: TimelineProps, info: TimelineListRenderItemInfo) => {
        return (
            <Timeline
                {...timelineProps}
                styles={{ contentStyle: { backgroundColor: theme.colors.fff } }}
                onEventPress={handleEventClick}
                theme={{
                    eventTitle: { color: theme.colors.fff },
                    eventSummary: { color: theme.colors.fff },
                    eventTimes: { color: theme.colors.fff },
                    timeLabel: { color: theme.colors.error },
                    textSectionTitleColor: theme.colors.fff,
                    calendarBackground: theme.colors.background,
                    indicatorColor: theme.colors.primary,
                }}
            />
        );
    }, [theme]);

    if (isLoadingData) {
        return <LoadingSpinner />;
    }

    return (
        <>
            {Object.keys(eventsByDateS).length ? (
                <Suspense fallback={<LoadingSpinner />}>
                    <LazyTimelineList
                        events={eventsByDateS}
                        renderItem={renderItem}
                        showNowIndicator
                        scrollToNow
                        initialTime={initialTime}
                    />
                </Suspense>
            ) : (
                <Text style={{ textAlign: 'center', color: theme.colors.text }}>
                    No events found for the selected filters.
                </Text>
            )}

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
