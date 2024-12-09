import { TimelineList } from "react-native-calendars";
import React, { useMemo } from "react";
import { getCurrentTime } from "@/config/timezoneUtils";
import { useRes } from '@/app/contexts/useRes';
import { useTheme } from '@/app/contexts/useTheme';

const Timelines = React.memo(({ eventsByDateS, initialTime, renderItem }: { eventsByDateS: any, initialTime: any, renderItem: any }) => {

    const { theme, darkMode } = useTheme();
    const { spacing } = useRes();

    const timelineProps = useMemo(() => {
        return {
            format24h: true,
            overlapEventsSpacing: 8,
            rightEdgeSpacing: 8,
            start: 0,
            end: 24,
            unavailableHours: [{ start: 0, end: getCurrentTime().getHours() }],
            unavailableHoursColor: darkMode ? '#484848' : "#f0f0f0",
            styles: {
                contentStyle: {
                    backgroundColor: theme.colors.background,
                },
                timelineContainer: {
                    backgroundColor: theme.colors.background,
                    borderRadius: 8
                },
                event: {
                    backgroundColor: '#e3f2fd',
                    borderRadius: 8,
                    padding: 8,
                    margin: 4,
                },
                eventTitle: {
                    color: theme.colors.fff,
                    fontSize: spacing.small,
                    fontWeight: 'bold',
                },
                eventSummary: {
                    color: theme.colors.fff,
                    fontSize: spacing.small,
                },
                eventTimes: {
                    color: theme.colors.fff,
                    fontSize: spacing.small,
                },

            },
        }
    }, [])

    return <TimelineList
        events={eventsByDateS}
        timelineProps={timelineProps}
        showNowIndicator
        scrollToNow
        initialTime={initialTime}
        renderItem={renderItem}
    />
})

export default Timelines