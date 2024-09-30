import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@user_data';

interface UserData {
    username: string;
    role: string | null;
}

export const saveUserData = async (userData: UserData) => {
    try {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
        console.error('Failed to save user data', error);
    }
};

export const loadUserData = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(USER_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('Failed to load user data', error);
    }
};

export const removeUserData = async () => {
    try {
        await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error('Failed to remove user data', error);
    }
};
