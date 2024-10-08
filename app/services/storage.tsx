import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@user_data';
const PAGINATE = '@paginate';

interface UserData {
    username: string;
    role: string | null;
}

interface PAGINATE {
    paginate: number;
}

export const savePaginate = async (paginate: PAGINATE) => {
    try {
        await AsyncStorage.setItem(PAGINATE, JSON.stringify(paginate));
    } catch (error) {
        console.error('Failed to save pagination data', error);
    }
}

export const loadPaginate = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(PAGINATE);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('Failed to load pagination data', error);
    }
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
