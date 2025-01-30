import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://default.api.com";

const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
    },
});

axiosInstance.interceptors.response.use(
    response => response,
    async (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403 || error.response.status === 405)) {
            const refreshToken = await AsyncStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${apiUrl}/auth/refresh-token`, { refreshToken });

                    await AsyncStorage.setItem('accessToken', data.accessToken);

                    error.config.headers['Authorization'] = `Bearer ${data.accessToken}`;
                    return axios(error.config);

                } catch (refreshError) {
                    console.error('Error refreshing token:', refreshError);
                    Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
                }
            } else {
                Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
