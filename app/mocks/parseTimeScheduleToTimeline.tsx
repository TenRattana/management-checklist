import { Day } from "@/typing/type";
import { TimelineItem, TimeScheduleProps } from "./timeline";

export const parseTimeScheduleToTimeline = (schedules: TimeScheduleProps[]): TimelineItem[] => {
    const timeline: TimelineItem[] = [];

    schedules?.forEach((schedule) => {
        const { ScheduleID, ScheduleName, Type_schedule, TimeSlots, TimeCustom, TimeWeek, IsActive } = schedule;

        if (Type_schedule === "Daily" && Array.isArray(TimeSlots)) {
            const dailySlots = TimeSlots.filter(slot => slot.start && slot.end);
            dailySlots.forEach((slot) => {
                timeline.push({
                    ScheduleID,
                    date: "Recurring Daily",
                    name: ScheduleName,
                    time: `${slot.start} - ${slot.end}`,
                    status: IsActive
                });
            });
        }

        if (Type_schedule === "Weekly" && TimeWeek && typeof TimeWeek === 'object') {
            Object.entries(TimeWeek).forEach(([day, slots]) => {
                if (Array.isArray(slots)) {
                    const weeklySlots = slots.filter(slot => slot.start && slot.end);
                    weeklySlots.forEach((slot) => {
                        timeline.push({
                            ScheduleID,
                            date: `Weekly (${day})`,
                            name: ScheduleName,
                            time: `${slot.start} - ${slot.end}`,
                            status: IsActive
                        });
                    });
                }
            });
        }

        if (Type_schedule === "Custom" && Array.isArray(TimeCustom)) {
            const customSlots = TimeCustom.filter(customSlot => customSlot.start && customSlot.end);

            customSlots.forEach((customSlot: Day) => {
                const [startDate = '', startTime = ''] = (customSlot.start ?? '').split(" ") || [];
                const [, endTime = ''] = (customSlot.end ?? '').split(" ") || [];

                timeline.push({
                    ScheduleID,
                    date: `Custom (${startDate})`,
                    name: ScheduleName,
                    time: `${startTime} - ${endTime}`,
                    status: IsActive
                });
            });
        }
    });

    return timeline;
};