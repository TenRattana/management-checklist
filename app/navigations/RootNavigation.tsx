import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { useSelector } from 'react-redux';
import { navigationRef } from './navigationUtils';
import { ActivityIndicator, Text } from 'react-native-paper';

const RootNavigation = () => {
    const isLoggedIn = useSelector((state: any) => state.user.IsAuthenticated);
    const loadgin = useSelector((state: any) => state.user.loadgin);

    return (
        <NavigationContainer independent={true} ref={navigationRef}>
            {isLoggedIn ? loadgin > 0 ? <MainStack /> : <ActivityIndicator /> : <AuthStack />}
        </NavigationContainer>

    );
};

export default RootNavigation;
