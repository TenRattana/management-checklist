import { deleteData, saveData } from "@/app/services/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useToast } from '@/app/contexts/useToast'

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://default.api.com";

const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

let isRefreshing = false;
let refreshSubscribers: ((newToken: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (newToken: string) => void) => {
    refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newToken: string) => {
    refreshSubscribers.forEach(callback => callback(newToken));
    refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && [401, 403, 405].includes(error.response.status)) {
            if (!isRefreshing) {
                isRefreshing = true;
                const refreshToken = await AsyncStorage.getItem('refreshToken');

                if (refreshToken) {
                    try {
                        const { data } = await axiosInstance.get('Ldap/RefreshToken', {
                            params: { RefreshToken: refreshToken },
                        });

                        await saveData('userToken', data.RefreshToken);
                        await saveData('refreshToken', data.RefreshToken);

                        onTokenRefreshed(data.RefreshToken);
                        originalRequest.headers['Authorization'] = `Bearer ${data.RefreshToken}`;
                        useToast().showSuccess('RefreshToken Success')

                        return axiosInstance(originalRequest);
                    } catch (refreshError) {
                        useToast().showError(`Error refreshing token ${refreshError}`)
                        return Promise.reject(refreshError);
                    }
                } else {
                    useToast().showError('No refresh token available')
                    return Promise.reject(error);
                }
            }

            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((newToken: string) => {
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    resolve(axiosInstance(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
