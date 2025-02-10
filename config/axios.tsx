import { saveData } from "@/app/services/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

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
            const RefreshToken = await AsyncStorage.getItem('refreshToken');

            if (RefreshToken) {
                try {
                    const { data } = await axiosInstance.get('Ldap/RefreshToken', { params: { RefreshToken } });

                    await saveData('refreshToken', data.RefreshToken);
                    console.log(data.RefreshToken);

                    error.config.headers['Authorization'] = `Bearer ${data.data.RefreshToken}`;
                    return axios(error.config);
                } catch (refreshError) {
                    console.error('Error refreshing token:', refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
