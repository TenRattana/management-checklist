import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { Portal, Dialog, Paragraph, Provider } from 'react-native-paper';

const TestComponent = () => {
    const [isDialogOneVisible, setDialogOneVisible] = useState(false);
    const [isDialogTwoVisible, setDialogTwoVisible] = useState(false);

    const openDialogOne = () => setDialogOneVisible(true);
    const closeDialogOne = () => setDialogOneVisible(false);

    const openDialogTwo = () => setDialogTwoVisible(true);
    const closeDialogTwo = () => setDialogTwoVisible(false);

    return (
        <Portal>
            <View style={styles.container}>
                <Button title="Open First Dialog" onPress={openDialogOne} />

                <Dialog visible={isDialogOneVisible} onDismiss={closeDialogOne} style={{ zIndex: 1 }}>
                    <Dialog.Title>First Dialog</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>This is the first dialog.</Paragraph>
                        <Button title="Open Second Dialog" onPress={openDialogTwo} />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button title="Close" onPress={closeDialogOne} />
                    </Dialog.Actions>
                </Dialog>


                <Dialog visible={isDialogTwoVisible} onDismiss={closeDialogTwo} style={{ zIndex: 2 }}>
                    <Dialog.Title>Second Dialog</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>This is the second dialog inside the first dialog.</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button title="Close" onPress={closeDialogTwo} />
                    </Dialog.Actions>
                </Dialog>
            </View>
        </Portal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
});

export default TestComponent;
