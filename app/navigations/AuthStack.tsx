import React from 'react';
import { Stack } from 'expo-router';

const AuthStack = () => {
    console.log("AuthStack");

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth/LoginScreen" />
        </Stack>
    );
};

export default AuthStack;
