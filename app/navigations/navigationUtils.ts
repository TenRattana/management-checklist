import { ComponentNames } from '@/typing/type';
import { CommonActions, NavigationContainerRef } from '@react-navigation/native';
import React from 'react';

export const navigationRef = React.createRef<NavigationContainerRef<Record<string, any>>>();

export function navigate(name: ComponentNames, params?: any) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
}

export function reset(routes: { name: ComponentNames }[]) {
  if (navigationRef.current) {
    navigationRef.current.dispatch(
      CommonActions.reset({
        index: 0,  
        routes,    
      })
    );
  }
}

export function isReady() {
  return navigationRef.current?.isReady();
}
