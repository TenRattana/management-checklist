import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export async function saveData(key: string, TokenAuth: string) {
    try {
        if (Platform.OS === 'web') {
            await AsyncStorage.setItem(key, JSON.stringify(TokenAuth));
        } else {
            await SecureStore.setItemAsync('userToken', TokenAuth);
        }
    } catch (error) {
        console.error('Failed to save token', error);
    }
}

export async function getData(key: string) {
    try {
        let token;
        if (Platform.OS === 'web') {
            const token = await AsyncStorage.getItem(key);
            return token != null ? JSON.parse(token) : null;
        } else {
            token = await SecureStore.getItemAsync('userToken');
        }
        return token;
    } catch (error) {
        console.error('Failed to retrieve token', error);
    }
}

export async function deleteData(key: string) {
    try {
        if (Platform.OS === 'web') {
            await AsyncStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync('userToken');
        }
    } catch (error) {
        console.error('Failed to delete token', error);
    }
}

