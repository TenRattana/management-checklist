// src/store/persistStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebStorage } from 'redux-persist/lib/types';

export function createPersistStorage(): WebStorage {
    const isServer = typeof window === 'undefined';

    if (isServer) {
        return {
            getItem: async () => null,
            setItem: async () => { },
            removeItem: async () => { },
        };
    }

    // For client-side (React Native), return AsyncStorage
    return AsyncStorage;
}
