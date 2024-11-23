import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, View, Switch, Text } from 'react-native';
import { NewCalendarList } from 'react-native-calendars';
const testIDs = {
    menu: {
        CONTAINER: 'menu',
        CALENDARS: 'calendars_btn',
        CALENDAR_LIST: 'calendar_list_btn',
        HORIZONTAL_LIST: 'horizontal_list_btn',
        AGENDA: 'agenda_btn',
        AGENDA_INFINITE: 'agenda_infinite_btn',
        EXPANDABLE_CALENDAR: 'expandable_calendar_btn',
        WEEK_CALENDAR: 'week_calendar_btn',
        TIMELINE_CALENDAR: 'timeline_calendar_btn',
        PLAYGROUND: 'playground_btn'
    },
    calendars: {
        CONTAINER: 'calendars',
        FIRST: 'first_calendar',
        LAST: 'last_calendar'
    },
    calendarList: { CONTAINER: 'calendarList' },
    horizontalList: { CONTAINER: 'horizontalList' },
    agenda: {
        CONTAINER: 'agenda',
        ITEM: 'item'
    },
    expandableCalendar: { CONTAINER: 'expandableCalendar' },
    weekCalendar: { CONTAINER: 'weekCalendar' }
}

const initialDate = '2020-05-16';

const TimescheduleScreen = () => {
    const [selected, setSelected] = useState(initialDate);
    const [isHorizontal, setIsHorizontal] = useState(false);

    const onValueChange = useCallback((value) => {
        setIsHorizontal(value);
    }, [isHorizontal]);

    const markedDates = useMemo(() => {
        return {
            [selected]: {
                selected: true,
                selectedColor: '#DFA460'
            }
        };
    }, [selected]);

    const onDayPress = useCallback(day => {
        console.warn('dayPress: ', day);
        setSelected(day.dateString);
    }, [setSelected]);

    const calendarProps = useMemo(() => {
        return {
            markedDates: markedDates,
            onDayPress: onDayPress
        };
    }, [selected, markedDates, onDayPress]);

    return (
        <View style={styles.container}>
            <View style={styles.switchView}>
                <Text style={styles.switchText}>Horizontal</Text>
                <Switch value={isHorizontal} onValueChange={onValueChange} />
            </View>
            <NewCalendarList
                key={Number(isHorizontal)} // only for this example - to force rerender
                horizontal={isHorizontal}
                staticHeader
                // initialDate={initialDate}
                // scrollRange={10}
                calendarProps={calendarProps}
                testID={testIDs.horizontalList.CONTAINER}
            />
        </View>
    );
};

export default TimescheduleScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    switchView: {
        flexDirection: 'row',
        height: 70,
        padding: 10,
        paddingBottom: 30,
        backgroundColor: 'white',
        alignItems: 'center',
        position: 'absolute',
        borderTopWidth: 1,
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 100
    },
    switchText: {
        marginRight: 20,
        fontSize: 16
    }
});