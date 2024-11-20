import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';


export async function saveData(key: string, TokenAuth: string) {
    try {
        if (Platform.OS === 'web') {
            await AsyncStorage.setItem(key, JSON.stringify(TokenAuth));
            console.log('Token saved in localStorage');
        } else {
            await SecureStore.setItemAsync('userToken', TokenAuth);
            console.log('Token saved in SecureStore');
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
            console.log('Token retrieved from localStorage:', token);
            return token != null ? JSON.parse(token) : null;
        } else {
            token = await SecureStore.getItemAsync('userToken');
            console.log('Token retrieved from SecureStore:', token);
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
            console.log('Token deleted from localStorage');
        } else {
            await SecureStore.deleteItemAsync('userToken');
            console.log('Token deleted from SecureStore');
        }
    } catch (error) {
        console.error('Failed to delete token', error);
    }
}

