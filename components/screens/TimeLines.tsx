import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/app/contexts/useTheme';
import moment from 'moment-timezone';
import { TimelineListRenderItemInfo, TimelineProps, Timeline } from 'react-native-calendars';
import { formatTime, getCurrentTime } from '@/config/timezoneUtils';
import Home_dialog from './Home_dialog';
import { groupBy } from 'lodash';
import { TimeLine } from '@/app/mocks/timeline';
import Text from '../Text';
import { LoadingSpinner } from '../common';
import { MarkedDates } from '@/app/mocks/convertSchedule';
import { TouchableOpacity, View } from 'react-native';
import useMasterdataStyles from '@/styles/common/masterdata';
import { useRes } from '@/app/contexts/useRes';

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
    computedTimeline: {
        timeline: TimeLine[];
        markedDates: MarkedDates;
    }
};

const Timelines: React.FC<TimelinesProps> = ({ filterStatus, filterTitle, computedTimeline }) => {
    const { theme } = useTheme();
    const { spacing } = useRes();
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const masterdataStyles = useMasterdataStyles();

    const initialTime = useMemo(() => ({
        hour: getCurrentTime().getHours(),
        minutes: getCurrentTime().getMinutes(),
    }), []);

    const [timelineItems, setTimelineItems] = useState<TimeLine[]>([]);

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

    const RenderEvent = React.memo(({ item }: { item: Event }) => (
        <TouchableOpacity onPress={() => handleEventClick(item)}>
            <Text style={[masterdataStyles.textFFF, masterdataStyles.textBold]}>{item.title}</Text>
            <View style={[{ flexDirection: 'row' }]}>
                <Text style={masterdataStyles.textFFF}>Status : </Text>
                <Text style={masterdataStyles.textFFF}>{item.statustype}</Text>
            </View>
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
            <Timeline
                {...timelineProps}
                styles={{ contentStyle: { backgroundColor: theme.colors.fff } }}
                onEventPress={handleEventClick}
                renderEvent={(event) => <RenderEvent item={event} />}
                theme={{
                    eventTitle: { color: theme.colors.fff },
                    eventSummary: { color: theme.colors.fff },
                    eventTimes: { color: theme.colors.fff },
                    timeLabel: { color: theme.colors.error, fontSize: spacing.small, fontWeight: 'bold' },
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
