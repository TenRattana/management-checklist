import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { navigationRef } from './navigationUtils';
import { LoadingSpinner } from '@/components';
import Navigation from './Navigation';
import { LoginScreen } from '../screens';

const RootNavigation = () => {
    const isLoggedIn = useSelector((state: any) => state.user.IsAuthenticated);
    const loadgin = useSelector((state: any) => state.user.loadgin);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (loadgin) {
            setIsLoading(false); 
        }
    }, [loadgin]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <NavigationContainer independent={true} ref={navigationRef}>
            {isLoggedIn ? (
                <Navigation />
            ) : (
                <LoginScreen />
            )}
        </NavigationContainer>
    );
};

export default RootNavigation;
