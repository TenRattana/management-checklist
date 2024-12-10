import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Set up notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export default function Notification() {
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    useEffect(() => {
        // Register for push notifications
        if (Platform.OS !== 'web') {
            registerForPushNotificationsAsync();
        }

        // Set up listeners for push notifications
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification Response:', response);
        });

        return () => {
            // Clean up notification listeners
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
            <Text>{notification ? 'Notification Received' : 'No Notification Received'}</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text>Title: {notification?.request.content.title}</Text>
                <Text>Body: {notification?.request.content.body}</Text>
                <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
            </View>
        </View>
    );
}

async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        // Create a notification channel for Android
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Permission not granted for push notifications!');
            return;
        }

        try {
            // Get the Expo push token (but we don't save it in the state anymore)
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Expo Push Token:', token);  // Optional: log token if needed for debugging
        } catch (e) {
            console.error('Error getting Expo push token:', e);
        }
    } else {
        alert('Must use a physical device for push notifications');
    }

    // No need to return token here since we're not saving it or sending notifications manually
}
