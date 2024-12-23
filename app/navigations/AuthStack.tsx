import React from 'react';
import { Stack } from 'expo-router';

const AuthStack = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth/LoginScreen" options={{ title: "Login" }} />
        </Stack>
    );
};

export default AuthStack;
