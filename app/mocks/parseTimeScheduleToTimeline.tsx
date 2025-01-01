// import { TimelineItem, TimeScheduleProps } from "./timeline";

// export const parseTimeScheduleToTimeline = (schedules: TimeScheduleProps[]): TimelineItem[] => {
//     const timeline: TimelineItem[] = [];

//     schedules?.forEach(({ ScheduleID, ScheduleName, Type_schedule, TimeSlots, TimeCustom, TimeWeek, IsActive }) => {
//         if (Type_schedule === 'Daily' && Array.isArray(TimeSlots)) {
//             TimeSlots.forEach(({ start, end }) => {
//                 if (start && end) {
//                     timeline.push({
//                         ScheduleID,
//                         date: 'Recurring Daily',
//                         name: ScheduleName,
//                         time: `${start} - ${end}`,
//                         status: IsActive,
//                     });
//                 }
//             });
//         } else if (Type_schedule === 'Weekly' && TimeWeek) {
//             Object.entries(TimeWeek).forEach(([day, slots]) => {
//                 slots?.forEach(({ start, end }) => {
//                     if (start && end) {
//                         timeline.push({
//                             ScheduleID,
//                             date: `Weekly (${day})`,
//                             name: ScheduleName,
//                             time: `${start} - ${end}`,
//                             status: IsActive,
//                         });
//                     }
//                 });
//             });
//         } else if (Type_schedule === 'Custom' && Array.isArray(TimeCustom)) {
//             TimeCustom.forEach(({ start, end }) => {
//                 const [startDate, startTime] = (start ?? '').split(' ');
//                 const [, endTime] = (end ?? '').split(' ');
//                 if (startDate && startTime && endTime) {
//                     timeline.push({
//                         ScheduleID,
//                         date: `Custom (${startDate})`,
//                         name: ScheduleName,
//                         time: `${startTime} - ${endTime}`,
//                         status: IsActive,
//                     });
//                 }
//             });
//         }
//     });

//     return timeline;
// };
