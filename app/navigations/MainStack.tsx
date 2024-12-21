import React from 'react';
import { Stack } from 'expo-router';

const MainStack = () => {
    console.log("MainStack");

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="navigations/Navigation" />
        </Stack>
    );
};

export default MainStack;
