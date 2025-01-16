import React, { useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { useTheme } from '@/app/contexts/useTheme';
import moment from 'moment-timezone';
import { FlatList, TouchableOpacity, View, Text as RNText, StyleSheet, ScrollView } from 'react-native';
import { TimeLine } from '@/app/mocks/timeline';
import { LoadingSpinner } from '../common';
import { MarkedDates } from '@/app/mocks/convertSchedule';
import { useRes } from '@/app/contexts/useRes';
import useMasterdataStyles from '@/styles/common/masterdata';
import { getCurrentTime } from '@/config/timezoneUtils';
import Home_dialog from './Home_dialog';
import { groupBy } from 'lodash';
import { Timeline, TimelineListRenderItemInfo, TimelineProps } from 'react-native-calendars';
import Text from '../Text';

const LazyTimelineList = lazy(() => import('react-native-calendars').then(module => ({ default: module.TimelineList })));

// Memoized Home Dialog
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
    };
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
                styles={{
                    contentStyle: {
                        backgroundColor: theme.colors.fff,
                        maxWidth: 300,
                        alignItems: 'center',
                        width: '100%', 
                    },
                }}
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
                    contentStyle: {
                        maxWidth: 300, 
                    },
                }}
            />
        );
    }, [theme]);

    if (isLoadingData) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <View style={{ flex: 1, padding: 5 }}>
                <View style={styles.scrollContainer}>
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
                    ): (
                        <Text style={{ textAlign: 'center', color: theme.colors.text }}>
                            No events found for the selected filters.
                        </Text>
                    )}
                </View>
            </View>

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

const styles = StyleSheet.create({
    timelineContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        zIndex: 1,
        paddingTop: 30, 
    },
    timelineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 10,
    },
    hourMarker: {
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hourText: {
        fontSize: 12,
        color: 'gray',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: 'lightgray',
    },
    currentHourLine: {
        backgroundColor: 'red', 
    },
    eventItem: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
        width: 300, // Set width of each event to 300
    },
    scrollContainer: {
        marginLeft: 60, 
        padding: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',  
        maxWidth: '100%', // Ensure the container doesn't exceed screen width
        justifyContent: 'flex-start', // Align content to the left
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
        flexWrap: 'wrap',  
    },
});

export default Timelines;

