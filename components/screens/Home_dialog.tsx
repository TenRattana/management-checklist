import React, { useMemo } from 'react'
import { Button, Dialog, Portal } from 'react-native-paper'
import useMasterdataStyles from '@/styles/common/masterdata';
import { TimeScheduleMachine } from '@/typing/type';
import { useQuery } from 'react-query';
import { LoadingSpinner, LoadingSpinnerTable } from '../common';
import { Customtable } from '..';
import { useTheme } from '@/app/contexts/useTheme';
import { Platform, StyleSheet, View } from 'react-native';
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { fetchTimeMachines } from '@/app/services';
import { Home_dialogProps } from '@/typing/screens/HomeScreen';

const Home_dialog = React.memo(({ dialogVisible, hideDialog, selectedEvent }: Home_dialogProps) => {
    const masterdataStyles = useMasterdataStyles()
    const { theme } = useTheme()

    const { data: machine = [], isLoading } = useQuery<TimeScheduleMachine[], Error>(
        ['machine', selectedEvent?.ScheduleID],
        () => fetchTimeMachines({ ScheduleID: selectedEvent?.ScheduleID || '' })
    );

    const tableData = useMemo(() => machine.map((item) => [
        item.MachineName,
        item.Area ?? "-",
        item.Building ?? "-",
        item.Floor ?? "-",
        item.MachineCode ?? "-",
        item.FormName ?? "-",
        selectedEvent?.statustype
    ]), [machine]);

    const customtableProps = useMemo(() => ({
        Tabledata: tableData,
        Tablehead: [
            { label: "Machine Name", align: "flex-start" },
            { label: "Area", align: "flex-start" },
            { label: "Building", align: "flex-start" },
            { label: "Floor", align: "flex-start" },
            { label: "MachineCode", align: "flex-start" },
            { label: "FormName", align: "flex-start" },
            { label: "Status", align: "center" },
        ],
        flexArr: [3, 1, 1, 1, 2, 2, 1],
        actionIndex: [{}],
        showMessage: 2,
        searchQuery: " ",
    }), [tableData]);

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
            width: 850,
            display: dialogVisible ? 'flex' : 'none',
            flex: 1,
            maxHeight: hp(Platform.OS === "web" ? '50%' : '70&')
        }
    })

    return (
        <Portal>
            <Dialog visible={dialogVisible} onDismiss={hideDialog} style={[masterdataStyles.containerDialog, styles.container]}>
                <Dialog.Title>{selectedEvent?.title} - Schedule</Dialog.Title>
                <View style={{ flex: 1, marginHorizontal: 24 }}>
                    {isLoading ? <LoadingSpinnerTable /> : <Customtable {...customtableProps} />}
                </View>
                <View style={{ paddingBottom: 10, justifyContent: 'flex-end', flexDirection: 'row', paddingHorizontal: 24 }}>
                    <Button onPress={() => {
                        hideDialog()
                    }}>Cancel</Button>
                </View>
            </Dialog>
        </Portal>
    )
})

export default Home_dialog; 
