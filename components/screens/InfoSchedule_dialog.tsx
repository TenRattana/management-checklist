import { Button, View } from 'react-native'
import React from 'react'
import { Dialog, Menu, Paragraph } from 'react-native-paper'
import Text from '../Text';

interface InfoScheduleProps {
    visible: boolean;
    setVisible: (v: boolean) => void;
}

const InfoSchedule_dialog = ({ visible, setVisible }: InfoScheduleProps) => {
    return (
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={{ zIndex: 2, width: 500, justifyContent: 'center', alignSelf: 'center' }}>
            <Dialog.Title>Week Dialog</Dialog.Title>
            <Dialog.Content>
                <View style={styles.timeIntervalMenu}>
                    <Text style={masterdataStyles.text}>Generate Time Every : {timeInterval}</Text>

                    <Menu
                        visible={showTimeIntervalMenu.time}
                        onDismiss={() => setShowTimeIntervalMenu((prev) => ({ ...prev, time: !showTimeIntervalMenu.time }))}
                        anchor={<Button
                            mode="outlined"
                            style={styles.timeButton}
                            onPress={() => setShowTimeIntervalMenu((prev) => ({ ...prev, time: true }))}
                        >
                            <Text style={styles.timeText}>{timeInterval > 0 ? `Every ${timeInterval} hours` : 'Select Interval'}</Text>
                        </Button>}
                    >
                        {Hours.map((interval, index) => (
                            <Menu.Item
                                style={styles.menuItem}
                                key={index}
                                onPress={() => {
                                    handleGenerateSchedule(interval, setFieldValue);
                                    setShowTimeIntervalMenu((prev) => ({ ...prev, time: false }))
                                }}
                                title={`Every ${interval} hours`}
                            />
                        ))}
                    </Menu>
                </View>
                <Paragraph>This is the second dialog inside the first dialog.</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
                <Button title="Close" onPress={() => setVisible(false)} />
            </Dialog.Actions>
        </Dialog>
    )
}
export default InfoSchedule_dialog
