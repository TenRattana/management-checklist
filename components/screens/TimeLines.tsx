import React, { useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { useTheme } from '@/app/contexts/useTheme';
import moment from 'moment-timezone';
import { TouchableOpacity, View, Text as RNText, StyleSheet, ScrollView } from 'react-native';
import { LoadingSpinner } from '../common';
import { useRes } from '@/app/contexts/useRes';
import useMasterdataStyles from '@/styles/common/masterdata';
import { getCurrentTime } from '@/config/timezoneUtils';
import Home_dialog from './Home_dialog';
import { groupBy } from 'lodash';
import { Timeline, TimelineListRenderItemInfo, TimelineProps } from 'react-native-calendars';
import Text from '../Text';
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Event, TimeLine, TimelinesProps } from '@/typing/screens/TimeSchedule';

const LazyTimelineList = lazy(() => import('react-native-calendars').then(module => ({ default: module.TimelineList })));

const MemoHome_dialog = React.memo(Home_dialog);

const Timelines = ({ filterStatus, filterTitle, computedTimeline }: TimelinesProps) => {
    const { theme } = useTheme();
    const { spacing } = useRes();
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const masterdataStyles = useMasterdataStyles();

    const initialTime = useMemo(() => {
        const now = getCurrentTime();
        return {
            hour: now.getHours(),
            minutes: now.getMinutes(),
        };
    }, []);

    const [timelineItems, setTimelineItems] = useState<TimeLine[]>([]);

    useEffect(() => {
        if (computedTimeline.timeline.length) {
            setTimelineItems(computedTimeline.timeline);
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
                availableWidth={wp('95%')}
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
                        timelineProps={{
                            overlapEventsSpacing: 4,
                            rightEdgeSpacing: 10,
                        }}
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

